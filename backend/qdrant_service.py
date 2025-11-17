"""
Qdrant Vector Database Integration
Handles semantic search using vector embeddings with OpenAI and Qdrant
"""

from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize clients
QDRANT_URL: Optional[str] = None
QDRANT_API_KEY: Optional[str] = None
openai_client: Optional[OpenAI] = None
qdrant_client: Optional[QdrantClient] = None

def init_qdrant_clients():
    global QDRANT_URL, QDRANT_API_KEY, openai_client, qdrant_client

    QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # Initialize OpenAI client
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here" else None

    # Initialize Qdrant client
    try:
        if QDRANT_API_KEY:
            qdrant_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
        else:
            qdrant_client = QdrantClient(url=QDRANT_URL)
        logger.info(f"Successfully connected to Qdrant at {QDRANT_URL}")
    except Exception as e:
        logger.warning(f"Failed to connect to Qdrant: {e}. Semantic search will be disabled.")

# Embedding model
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSION = 1536

# Collection names
PROJECTS_COLLECTION = "projects"
PRODUCTS_COLLECTION = "products"
GUILDS_COLLECTION = "guilds"


def get_embedding(text: str) -> Optional[List[float]]:
    """
    Generate embedding vector for text using OpenAI
    """
    if not openai_client:
        logger.warning("OpenAI client not initialized. Skipping embedding generation.")
        return None

    try:
        response = openai_client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return None


def initialize_collections():
    """
    Initialize Qdrant collections for projects, products, and guilds
    """
    if not qdrant_client:
        logger.warning("Qdrant client not initialized. Skipping collection initialization.")
        return False

    try:
        collections = [PROJECTS_COLLECTION, PRODUCTS_COLLECTION, GUILDS_COLLECTION]
        existing_collections = [col.name for col in qdrant_client.get_collections().collections]

        for collection_name in collections:
            if collection_name not in existing_collections:
                qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(
                        size=EMBEDDING_DIMENSION,
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created collection: {collection_name}")
            else:
                logger.info(f"Collection {collection_name} already exists")

        return True
    except Exception as e:
        logger.error(f"Error initializing collections: {e}")
        return False


def index_project(project_id: int, title: str, description: str, metadata: Dict[str, Any] = None):
    """
    Index a project in Qdrant for semantic search
    """
    if not qdrant_client or not openai_client:
        return False

    try:
        # Combine title and description for embedding
        text = f"{title}\n{description or ''}"
        embedding = get_embedding(text)

        if not embedding:
            return False

        # Prepare metadata
        payload = {
            "project_id": project_id,
            "title": title,
            "description": description,
            **(metadata or {})
        }

        # Index in Qdrant
        qdrant_client.upsert(
            collection_name=PROJECTS_COLLECTION,
            points=[
                PointStruct(
                    id=project_id,
                    vector=embedding,
                    payload=payload
                )
            ]
        )

        logger.info(f"Indexed project {project_id}: {title}")
        return True
    except Exception as e:
        logger.error(f"Error indexing project {project_id}: {e}")
        return False


def index_product(product_id: int, name: str, description: str, metadata: Dict[str, Any] = None):
    """
    Index a product in Qdrant for semantic search
    """
    if not qdrant_client or not openai_client:
        return False

    try:
        # Combine name and description for embedding
        text = f"{name}\n{description or ''}"
        embedding = get_embedding(text)

        if not embedding:
            return False

        # Prepare metadata
        payload = {
            "product_id": product_id,
            "name": name,
            "description": description,
            **(metadata or {})
        }

        # Index in Qdrant
        qdrant_client.upsert(
            collection_name=PRODUCTS_COLLECTION,
            points=[
                PointStruct(
                    id=product_id,
                    vector=embedding,
                    payload=payload
                )
            ]
        )

        logger.info(f"Indexed product {product_id}: {name}")
        return True
    except Exception as e:
        logger.error(f"Error indexing product {product_id}: {e}")
        return False


def index_guild(guild_id: int, name: str, description: str, metadata: Dict[str, Any] = None):
    """
    Index a guild in Qdrant for semantic search
    """
    if not qdrant_client or not openai_client:
        return False

    try:
        # Combine name and description for embedding
        text = f"{name}\n{description or ''}"
        embedding = get_embedding(text)

        if not embedding:
            return False

        # Prepare metadata
        payload = {
            "guild_id": guild_id,
            "name": name,
            "description": description,
            **(metadata or {})
        }

        # Index in Qdrant
        qdrant_client.upsert(
            collection_name=GUILDS_COLLECTION,
            points=[
                PointStruct(
                    id=guild_id,
                    vector=embedding,
                    payload=payload
                )
            ]
        )

        logger.info(f"Indexed guild {guild_id}: {name}")
        return True
    except Exception as e:
        logger.error(f"Error indexing guild {guild_id}: {e}")
        return False


def semantic_search_projects(query: str, limit: int = 10, score_threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Perform semantic search on projects
    """
    if not qdrant_client or not openai_client:
        logger.warning("Semantic search not available. OpenAI or Qdrant not configured.")
        return []

    try:
        # Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return []

        # Search in Qdrant
        results = qdrant_client.search(
            collection_name=PROJECTS_COLLECTION,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold
        )

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "project_id": result.payload.get("project_id"),
                "title": result.payload.get("title"),
                "description": result.payload.get("description"),
                "score": result.score,
                "metadata": {k: v for k, v in result.payload.items() if k not in ["project_id", "title", "description"]}
            })

        logger.info(f"Found {len(formatted_results)} projects for query: {query}")
        return formatted_results
    except Exception as e:
        logger.error(f"Error performing semantic search on projects: {e}")
        return []


def semantic_search_products(query: str, limit: int = 10, score_threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Perform semantic search on products
    """
    if not qdrant_client or not openai_client:
        logger.warning("Semantic search not available. OpenAI or Qdrant not configured.")
        return []

    try:
        # Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return []

        # Search in Qdrant
        results = qdrant_client.search(
            collection_name=PRODUCTS_COLLECTION,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold
        )

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "product_id": result.payload.get("product_id"),
                "name": result.payload.get("name"),
                "description": result.payload.get("description"),
                "score": result.score,
                "metadata": {k: v for k, v in result.payload.items() if k not in ["product_id", "name", "description"]}
            })

        logger.info(f"Found {len(formatted_results)} products for query: {query}")
        return formatted_results
    except Exception as e:
        logger.error(f"Error performing semantic search on products: {e}")
        return []


def semantic_search_guilds(query: str, limit: int = 10, score_threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Perform semantic search on guilds
    """
    if not qdrant_client or not openai_client:
        logger.warning("Semantic search not available. OpenAI or Qdrant not configured.")
        return []

    try:
        # Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return []

        # Search in Qdrant
        results = qdrant_client.search(
            collection_name=GUILDS_COLLECTION,
            query_vector=query_embedding,
            limit=limit,
            score_threshold=score_threshold
        )

        # Format results
        formatted_results = []
        for result in results:
            formatted_results.append({
                "guild_id": result.payload.get("guild_id"),
                "name": result.payload.get("name"),
                "description": result.payload.get("description"),
                "score": result.score,
                "metadata": {k: v for k, v in result.payload.items() if k not in ["guild_id", "name", "description"]}
            })

        logger.info(f"Found {len(formatted_results)} guilds for query: {query}")
        return formatted_results
    except Exception as e:
        logger.error(f"Error performing semantic search on guilds: {e}")
        return []


def delete_project(project_id: int):
    """
    Delete a project from the vector database
    """
    if not qdrant_client:
        return False

    try:
        qdrant_client.delete(
            collection_name=PROJECTS_COLLECTION,
            points_selector=[project_id]
        )
        logger.info(f"Deleted project {project_id} from vector database")
        return True
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {e}")
        return False


def delete_product(product_id: int):
    """
    Delete a product from the vector database
    """
    if not qdrant_client:
        return False

    try:
        qdrant_client.delete(
            collection_name=PRODUCTS_COLLECTION,
            points_selector=[product_id]
        )
        logger.info(f"Deleted product {product_id} from vector database")
        return True
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        return False


def delete_guild(guild_id: int):
    """
    Delete a guild from the vector database
    """
    if not qdrant_client:
        return False

    try:
        qdrant_client.delete(
            collection_name=GUILDS_COLLECTION,
            points_selector=[guild_id]
        )
        logger.info(f"Deleted guild {guild_id} from vector database")
        return True
    except Exception as e:
        logger.error(f"Error deleting guild {guild_id}: {e}")
        return False


# Initialize collections on module import
# This is now called explicitly from main.py startup event
# if qdrant_client:
#     initialize_collections()
