"""
Qdrant Vector Database Integration using REST API
Handles semantic search using vector embeddings with OpenAI and Qdrant Cloud
"""

from typing import List, Dict, Any, Optional
import httpx
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
http_client: Optional[httpx.Client] = None

def init_qdrant_clients():
    global QDRANT_URL, QDRANT_API_KEY, openai_client, http_client

    QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

    # Initialize OpenAI client
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY and OPENAI_API_KEY != "your-openai-api-key-here" else None

    # Initialize HTTP client for Qdrant REST API
    try:
        headers = {"Content-Type": "application/json"}
        if QDRANT_API_KEY:
            headers["api-key"] = QDRANT_API_KEY

        http_client = httpx.Client(
            base_url=QDRANT_URL,
            headers=headers,
            timeout=30.0
        )
        logger.info(f"Successfully configured Qdrant client for {QDRANT_URL}")
    except Exception as e:
        logger.warning(f"Failed to configure Qdrant client: {e}. Semantic search will be disabled.")

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
    if not http_client:
        logger.warning("Qdrant client not initialized. Skipping collection initialization.")
        return False

    try:
        # Get existing collections
        response = http_client.get("/collections")
        response.raise_for_status()
        existing_collections = [col["name"] for col in response.json().get("result", {}).get("collections", [])]

        collections = [PROJECTS_COLLECTION, PRODUCTS_COLLECTION, GUILDS_COLLECTION]

        for collection_name in collections:
            if collection_name not in existing_collections:
                # Create collection
                payload = {
                    "vectors": {
                        "size": EMBEDDING_DIMENSION,
                        "distance": "Cosine"
                    }
                }
                response = http_client.put(f"/collections/{collection_name}", json=payload)
                response.raise_for_status()
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
    if not http_client or not openai_client:
        return False

    try:
        # Combine title and description for embedding
        text = f"{title}\n{description or ''}"
        embedding = get_embedding(text)

        if not embedding:
            return False

        # Prepare metadata
        payload_data = {
            "project_id": project_id,
            "title": title,
            "description": description,
            **(metadata or {})
        }

        # Index in Qdrant
        upsert_payload = {
            "points": [
                {
                    "id": project_id,
                    "vector": embedding,
                    "payload": payload_data
                }
            ]
        }

        response = http_client.put(f"/collections/{PROJECTS_COLLECTION}/points", json=upsert_payload)
        response.raise_for_status()

        logger.info(f"Indexed project {project_id}: {title}")
        return True
    except Exception as e:
        logger.error(f"Error indexing project {project_id}: {e}")
        return False


def index_product(product_id: int, name: str, description: str, metadata: Dict[str, Any] = None):
    """
    Index a product in Qdrant for semantic search
    """
    if not http_client or not openai_client:
        return False

    try:
        # Combine name and description for embedding
        text = f"{name}\n{description or ''}"
        embedding = get_embedding(text)

        if not embedding:
            return False

        # Prepare metadata
        payload_data = {
            "product_id": product_id,
            "name": name,
            "description": description,
            **(metadata or {})
        }

        # Index in Qdrant
        upsert_payload = {
            "points": [
                {
                    "id": product_id,
                    "vector": embedding,
                    "payload": payload_data
                }
            ]
        }

        response = http_client.put(f"/collections/{PRODUCTS_COLLECTION}/points", json=upsert_payload)
        response.raise_for_status()

        logger.info(f"Indexed product {product_id}: {name}")
        return True
    except Exception as e:
        logger.error(f"Error indexing product {product_id}: {e}")
        return False


def index_guild(guild_id: int, name: str, description: str, metadata: Dict[str, Any] = None):
    """
    Index a guild in Qdrant for semantic search
    """
    if not http_client or not openai_client:
        return False

    try:
        # Combine name and description for embedding
        text = f"{name}\n{description or ''}"
        embedding = get_embedding(text)

        if not embedding:
            return False

        # Prepare metadata
        payload_data = {
            "guild_id": guild_id,
            "name": name,
            "description": description,
            **(metadata or {})
        }

        # Index in Qdrant
        upsert_payload = {
            "points": [
                {
                    "id": guild_id,
                    "vector": embedding,
                    "payload": payload_data
                }
            ]
        }

        response = http_client.put(f"/collections/{GUILDS_COLLECTION}/points", json=upsert_payload)
        response.raise_for_status()

        logger.info(f"Indexed guild {guild_id}: {name}")
        return True
    except Exception as e:
        logger.error(f"Error indexing guild {guild_id}: {e}")
        return False


def semantic_search_projects(query: str, limit: int = 10, score_threshold: float = 0.7) -> List[Dict[str, Any]]:
    """
    Perform semantic search on projects
    """
    if not http_client or not openai_client:
        logger.warning("Semantic search not available. OpenAI or Qdrant not configured.")
        return []

    try:
        # Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return []

        # Search in Qdrant
        search_payload = {
            "vector": query_embedding,
            "limit": limit,
            "score_threshold": score_threshold,
            "with_payload": True
        }

        response = http_client.post(f"/collections/{PROJECTS_COLLECTION}/points/search", json=search_payload)
        response.raise_for_status()
        results = response.json().get("result", [])

        # Format results
        formatted_results = []
        for result in results:
            payload = result.get("payload", {})
            formatted_results.append({
                "project_id": payload.get("project_id"),
                "title": payload.get("title"),
                "description": payload.get("description"),
                "score": result.get("score"),
                "metadata": {k: v for k, v in payload.items() if k not in ["project_id", "title", "description"]}
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
    if not http_client or not openai_client:
        logger.warning("Semantic search not available. OpenAI or Qdrant not configured.")
        return []

    try:
        # Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return []

        # Search in Qdrant
        search_payload = {
            "vector": query_embedding,
            "limit": limit,
            "score_threshold": score_threshold,
            "with_payload": True
        }

        response = http_client.post(f"/collections/{PRODUCTS_COLLECTION}/points/search", json=search_payload)
        response.raise_for_status()
        results = response.json().get("result", [])

        # Format results
        formatted_results = []
        for result in results:
            payload = result.get("payload", {})
            formatted_results.append({
                "product_id": payload.get("product_id"),
                "name": payload.get("name"),
                "description": payload.get("description"),
                "score": result.get("score"),
                "metadata": {k: v for k, v in payload.items() if k not in ["product_id", "name", "description"]}
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
    if not http_client or not openai_client:
        logger.warning("Semantic search not available. OpenAI or Qdrant not configured.")
        return []

    try:
        # Generate query embedding
        query_embedding = get_embedding(query)
        if not query_embedding:
            return []

        # Search in Qdrant
        search_payload = {
            "vector": query_embedding,
            "limit": limit,
            "score_threshold": score_threshold,
            "with_payload": True
        }

        response = http_client.post(f"/collections/{GUILDS_COLLECTION}/points/search", json=search_payload)
        response.raise_for_status()
        results = response.json().get("result", [])

        # Format results
        formatted_results = []
        for result in results:
            payload = result.get("payload", {})
            formatted_results.append({
                "guild_id": payload.get("guild_id"),
                "name": payload.get("name"),
                "description": payload.get("description"),
                "score": result.get("score"),
                "metadata": {k: v for k, v in payload.items() if k not in ["guild_id", "name", "description"]}
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
    if not http_client:
        return False

    try:
        delete_payload = {
            "points": [project_id]
        }
        response = http_client.post(f"/collections/{PROJECTS_COLLECTION}/points/delete", json=delete_payload)
        response.raise_for_status()
        logger.info(f"Deleted project {project_id} from vector database")
        return True
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {e}")
        return False


def delete_product(product_id: int):
    """
    Delete a product from the vector database
    """
    if not http_client:
        return False

    try:
        delete_payload = {
            "points": [product_id]
        }
        response = http_client.post(f"/collections/{PRODUCTS_COLLECTION}/points/delete", json=delete_payload)
        response.raise_for_status()
        logger.info(f"Deleted product {product_id} from vector database")
        return True
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        return False


def delete_guild(guild_id: int):
    """
    Delete a guild from the vector database
    """
    if not http_client:
        return False

    try:
        delete_payload = {
            "points": [guild_id]
        }
        response = http_client.post(f"/collections/{GUILDS_COLLECTION}/points/delete", json=delete_payload)
        response.raise_for_status()
        logger.info(f"Deleted guild {guild_id} from vector database")
        return True
    except Exception as e:
        logger.error(f"Error deleting guild {guild_id}: {e}")
        return False
