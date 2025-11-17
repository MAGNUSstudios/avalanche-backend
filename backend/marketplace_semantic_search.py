"""
Marketplace Semantic Search Service
====================================
This module provides intelligent semantic search for marketplace products using:
- OpenAI embeddings for semantic understanding
- Qdrant vector database for similarity search
- Category detection for intent understanding

Features:
- Understands natural language queries (e.g., "foodstuff", "groceries", "raw food" → "food")
- Semantic category detection without manual keyword lists
- Vector search with category filtering
- Fallback logic for uncertain queries
"""

from typing import List, Dict, Any, Optional, Tuple
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
    PayloadSchemaType,
    OptimizersConfigDiff
)
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging
import json

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize clients
QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here" else None

# Initialize Qdrant client
qdrant_client = None
try:
    if QDRANT_API_KEY:
        qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    else:
        qdrant_client = QdrantClient(url=QDRANT_URL)
    logger.info(f"✅ Successfully connected to Qdrant at {QDRANT_URL}")
except Exception as e:
    logger.warning(f"⚠️ Failed to connect to Qdrant: {e}. Semantic search will be disabled.")

# Collection name for marketplace products
MARKETPLACE_COLLECTION = "marketplace_products"

# Embedding model configuration
EMBEDDING_MODEL = "text-embedding-3-small"  # Fast and cost-effective
EMBEDDING_DIMENSION = 1536

# ============================================================================
# CATEGORY DEFINITIONS (Semantic - AI will understand variations)
# ============================================================================
# These are the canonical categories. The AI will map user queries to these.
# IMPORTANT: These must match the actual categories in your database (case-insensitive)
CANONICAL_CATEGORIES = [
    "electronics",        # Maps: gadgets, tech, devices, laptops, phones, computers
    "fashion",           # Maps: clothing, apparel, wear, outfits, shoes, bags
    "home & garden",     # Maps: home, furniture, kitchen, garden, appliances
    "sports & outdoors", # Maps: sports, fitness, outdoor, camping, athletic
    "books & media",     # Maps: books, magazines, media, stationery
    "toys & games",      # Maps: toys, games, kids, children, play
    "art & crafts",      # Maps: art, crafts, diy, creative, handmade
]

# Category embeddings cache (computed once, reused for fast detection)
_category_embeddings_cache: Optional[Dict[str, List[float]]] = None


# ============================================================================
# EMBEDDING GENERATION
# ============================================================================

def get_embedding(text: str) -> Optional[List[float]]:
    """
    Generate embedding vector for text using OpenAI.

    Args:
        text: The text to embed

    Returns:
        List of floats representing the embedding vector, or None if error
    """
    if not openai_client:
        logger.warning("⚠️ OpenAI client not initialized. Check your OPENAI_API_KEY.")
        return None

    try:
        response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"❌ Error generating embedding: {e}")
        return None


# ============================================================================
# COLLECTION INITIALIZATION
# ============================================================================

def initialize_marketplace_collection():
    """
    Initialize the Qdrant collection for marketplace products.
    Creates the collection if it doesn't exist.

    Returns:
        bool: True if successful, False otherwise
    """
    if not qdrant_client:
        logger.warning("⚠️ Qdrant client not initialized. Skipping collection initialization.")
        return False

    try:
        existing_collections = [col.name for col in qdrant_client.get_collections().collections]

        if MARKETPLACE_COLLECTION not in existing_collections:
            qdrant_client.create_collection(
                collection_name=MARKETPLACE_COLLECTION,
                vectors_config=VectorParams(
                    size=EMBEDDING_DIMENSION,
                    distance=Distance.COSINE  # Cosine similarity for semantic search
                ),
                optimizers_config=OptimizersConfigDiff(
                    indexing_threshold=20  # Index vectors immediately (instead of waiting for 10000)
                )
            )
            logger.info(f"✅ Created collection: {MARKETPLACE_COLLECTION}")
        else:
            logger.info(f"✅ Collection {MARKETPLACE_COLLECTION} already exists")

            # Update optimizer config for existing collection to index immediately
            try:
                qdrant_client.update_collection(
                    collection_name=MARKETPLACE_COLLECTION,
                    optimizers_config=OptimizersConfigDiff(
                        indexing_threshold=20  # Force immediate indexing
                    )
                )
                logger.info(f"✅ Updated collection optimizer config for immediate indexing")
            except Exception as e:
                logger.debug(f"Optimizer config update skipped: {e}")

        # Create payload index for category field to enable filtering
        try:
            qdrant_client.create_payload_index(
                collection_name=MARKETPLACE_COLLECTION,
                field_name="category",
                field_schema=PayloadSchemaType.KEYWORD
            )
            logger.info(f"✅ Created payload index for category field")
        except Exception as e:
            # Index might already exist, which is fine
            logger.debug(f"Payload index creation skipped: {e}")

        return True
    except Exception as e:
        logger.error(f"❌ Error initializing marketplace collection: {e}")
        return False


# ============================================================================
# PRODUCT INDEXING
# ============================================================================

def index_product(
    product_id: int,
    name: str,
    description: str,
    category: str,
    price: float,
    image_url: Optional[str] = None,
    stock: int = 0,
    seller_id: Optional[int] = None,
    additional_metadata: Optional[Dict[str, Any]] = None
) -> bool:
    """
    Index a product in Qdrant for semantic search.

    Args:
        product_id: Unique product identifier
        name: Product name
        description: Product description
        category: Product category (should be one of CANONICAL_CATEGORIES)
        price: Product price
        image_url: URL to product image
        stock: Available stock quantity
        seller_id: ID of the seller
        additional_metadata: Any extra metadata to store

    Returns:
        bool: True if indexing successful, False otherwise
    """
    if not qdrant_client or not openai_client:
        logger.warning("⚠️ Cannot index product: Qdrant or OpenAI not configured")
        return False

    try:
        # Create rich text representation for embedding
        # Combine name, description, and category for better semantic understanding
        embedding_text = f"""
        Product: {name}
        Category: {category}
        Description: {description or 'No description'}
        """.strip()

        # Generate embedding
        embedding = get_embedding(embedding_text)
        if not embedding:
            logger.error(f"❌ Failed to generate embedding for product {product_id}")
            return False

        # Prepare metadata payload
        payload = {
            "product_id": product_id,
            "name": name,
            "description": description,
            "category": category.lower(),  # Normalize category to lowercase
            "price": price,
            "image_url": image_url,
            "stock": stock,
            "seller_id": seller_id,
            **(additional_metadata or {})
        }

        # Upsert to Qdrant (insert or update)
        qdrant_client.upsert(
            collection_name=MARKETPLACE_COLLECTION,
            points=[
                PointStruct(
                    id=product_id,
                    vector=embedding,
                    payload=payload
                )
            ]
        )

        logger.info(f"✅ Indexed product {product_id}: {name} (category: {category})")
        return True

    except Exception as e:
        logger.error(f"❌ Error indexing product {product_id}: {e}")
        return False


def bulk_index_products(products: List[Dict[str, Any]]) -> Tuple[int, int]:
    """
    Index multiple products at once for better performance.

    Args:
        products: List of product dictionaries with keys:
                 product_id, name, description, category, price, image_url, stock, seller_id

    Returns:
        Tuple of (successful_count, failed_count)
    """
    if not qdrant_client or not openai_client:
        logger.warning("⚠️ Cannot bulk index: Qdrant or OpenAI not configured")
        return 0, len(products)

    successful = 0
    failed = 0

    for product in products:
        try:
            result = index_product(
                product_id=product['id'],
                name=product['name'],
                description=product.get('description', ''),
                category=product.get('category', 'uncategorized'),
                price=product.get('price', 0.0),
                image_url=product.get('image_url'),
                stock=product.get('stock', 0),
                seller_id=product.get('seller_id')
            )
            if result:
                successful += 1
            else:
                failed += 1
        except Exception as e:
            logger.error(f"❌ Error indexing product {product.get('id')}: {e}")
            failed += 1

    logger.info(f"📊 Bulk indexing complete: {successful} successful, {failed} failed")
    return successful, failed


# ============================================================================
# CATEGORY DETECTION (Intent Understanding)
# ============================================================================

def _initialize_category_embeddings():
    """
    Pre-compute embeddings for all canonical categories.
    This is done once and cached for fast category detection.
    """
    global _category_embeddings_cache

    if _category_embeddings_cache is not None:
        return  # Already initialized

    if not openai_client:
        logger.warning("⚠️ Cannot initialize category embeddings: OpenAI not configured")
        return

    logger.info("🔄 Initializing category embeddings...")
    _category_embeddings_cache = {}

    for category in CANONICAL_CATEGORIES:
        # Create rich category description for better matching
        category_text = f"{category} products, items related to {category}"
        embedding = get_embedding(category_text)
        if embedding:
            _category_embeddings_cache[category] = embedding

    logger.info(f"✅ Initialized {len(_category_embeddings_cache)} category embeddings")


def detect_category(query: str) -> Tuple[str, float]:
    """
    Detect which category a user query is referring to using semantic similarity.

    This function uses cosine similarity between the query embedding and
    pre-computed category embeddings to determine the most relevant category.

    Args:
        query: User's natural language query (e.g., "What foodstuff do you have?")

    Returns:
        Tuple of (detected_category, confidence_score)
        - detected_category: The canonical category name
        - confidence_score: Similarity score (0.0 to 1.0)
    """
    if not openai_client:
        logger.warning("⚠️ Cannot detect category: OpenAI not configured")
        return "uncategorized", 0.0

    # Initialize category embeddings if not already done
    if _category_embeddings_cache is None:
        _initialize_category_embeddings()

    if not _category_embeddings_cache:
        logger.warning("⚠️ Category embeddings not available")
        return "uncategorized", 0.0

    try:
        # Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return "uncategorized", 0.0

        # Compute cosine similarity with each category
        best_category = "uncategorized"
        best_score = 0.0

        for category, category_embedding in _category_embeddings_cache.items():
            # Cosine similarity calculation
            similarity = _cosine_similarity(query_embedding, category_embedding)

            if similarity > best_score:
                best_score = similarity
                best_category = category

        logger.info(f"🎯 Detected category: {best_category} (confidence: {best_score:.2f})")
        return best_category, best_score

    except Exception as e:
        logger.error(f"❌ Error detecting category: {e}")
        return "uncategorized", 0.0


def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two vectors.

    Args:
        vec1: First vector
        vec2: Second vector

    Returns:
        Similarity score between 0.0 and 1.0
    """
    import math

    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = math.sqrt(sum(a * a for a in vec1))
    magnitude2 = math.sqrt(sum(b * b for b in vec2))

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    return dot_product / (magnitude1 * magnitude2)


# ============================================================================
# SEMANTIC SEARCH
# ============================================================================

def semantic_search_marketplace(
    query: str,
    category_filter: Optional[str] = None,
    limit: int = 20,
    score_threshold: float = 0.3,  # Lowered threshold for better recall
    auto_detect_category: bool = True
) -> Dict[str, Any]:
    """
    Perform semantic search on marketplace products with optional category filtering.

    This is the main search function that combines:
    1. Query embedding
    2. Category detection (if enabled)
    3. Vector similarity search
    4. Category filtering

    Args:
        query: User's search query (natural language)
        category_filter: Optional specific category to filter by
        limit: Maximum number of results to return
        score_threshold: Minimum similarity score (0.0 to 1.0)
        auto_detect_category: Whether to automatically detect category from query

    Returns:
        Dictionary with:
        {
            "category_detected": str,
            "confidence": float,
            "matches": List[Dict],
            "total_results": int
        }
    """
    if not qdrant_client or not openai_client:
        logger.warning("⚠️ Semantic search not available: Qdrant or OpenAI not configured")
        return {
            "category_detected": None,
            "confidence": 0.0,
            "matches": [],
            "total_results": 0,
            "error": "Search service not available"
        }

    try:
        # Step 1: Category Detection
        detected_category = None
        category_confidence = 0.0

        if auto_detect_category and not category_filter:
            detected_category, category_confidence = detect_category(query)
            logger.info(f"🔍 Auto-detected category: {detected_category} ({category_confidence:.2f})")

        # Use explicit filter if provided, otherwise use detected category
        active_category = category_filter or detected_category

        # Step 2: Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return {
                "category_detected": detected_category,
                "confidence": category_confidence,
                "matches": [],
                "total_results": 0,
                "error": "Failed to generate query embedding"
            }

        # Step 3: Prepare category filter for Qdrant
        search_filter = None
        if active_category and active_category != "uncategorized":
            search_filter = Filter(
                must=[
                    FieldCondition(
                        key="category",
                        match=MatchValue(value=active_category.lower())
                    )
                ]
            )

        # Step 4: Search in Qdrant
        results = qdrant_client.search(
            collection_name=MARKETPLACE_COLLECTION,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold,
            query_filter=search_filter
        )

        # Step 5: Format results
        matches = []
        for result in results:
            matches.append({
                "product_id": result.payload.get("product_id"),
                "name": result.payload.get("name"),
                "description": result.payload.get("description"),
                "category": result.payload.get("category"),
                "price": result.payload.get("price"),
                "image_url": result.payload.get("image_url"),
                "stock": result.payload.get("stock"),
                "seller_id": result.payload.get("seller_id"),
                "relevance_score": round(result.score, 3)
            })

        logger.info(f"✅ Found {len(matches)} products for query: '{query}'")

        return {
            "category_detected": detected_category or category_filter,
            "confidence": category_confidence,
            "matches": matches,
            "total_results": len(matches)
        }

    except Exception as e:
        logger.error(f"❌ Error performing semantic search: {e}")
        return {
            "category_detected": None,
            "confidence": 0.0,
            "matches": [],
            "total_results": 0,
            "error": str(e)
        }


# ============================================================================
# PRODUCT DELETION
# ============================================================================

def delete_product(product_id: int) -> bool:
    """
    Delete a product from the vector database.

    Args:
        product_id: ID of the product to delete

    Returns:
        bool: True if successful, False otherwise
    """
    if not qdrant_client:
        logger.warning("⚠️ Cannot delete product: Qdrant not configured")
        return False

    try:
        qdrant_client.delete(
            collection_name=MARKETPLACE_COLLECTION,
            points_selector=[product_id]
        )
        logger.info(f"✅ Deleted product {product_id} from vector database")
        return True
    except Exception as e:
        logger.error(f"❌ Error deleting product {product_id}: {e}")
        return False


# ============================================================================
# INITIALIZE ON MODULE IMPORT
# ============================================================================

if qdrant_client:
    initialize_marketplace_collection()
    _initialize_category_embeddings()
