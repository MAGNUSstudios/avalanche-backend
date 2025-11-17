import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import SessionLocal, Guild, Project, Product
from backend.qdrant_service import index_guild, index_project, index_product, initialize_collections

load_dotenv()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def index_all_data():
    """
    Fetches all guilds, projects, and products from the database
    and indexes them into Qdrant.
    """
    logger.info("Starting Qdrant data indexing...")

    # Initialize Qdrant collections
    if not initialize_collections():
        logger.error("Failed to initialize Qdrant collections. Exiting.")
        return

    db: Session = SessionLocal()
    try:
        # Index Guilds
        guilds = db.query(Guild).all()
        logger.info(f"Found {len(guilds)} guilds to index.")
        for guild in guilds:
            success = index_guild(
                guild_id=guild.id,
                name=guild.name,
                description=guild.description,
                metadata={
                    "category": guild.category,
                    "owner_id": guild.owner_id,
                    "is_private": guild.is_private
                }
            )
            if not success:
                logger.warning(f"Failed to index guild {guild.id}: {guild.name}")

        # Index Projects
        projects = db.query(Project).all()
        logger.info(f"Found {len(projects)} projects to index.")
        for project in projects:
            success = index_project(
                project_id=project.id,
                title=project.title,
                description=project.description,
                metadata={
                    "status": project.status,
                    "budget": project.budget,
                    "owner_id": project.owner_id,
                    "guild_id": project.guild_id
                }
            )
            if not success:
                logger.warning(f"Failed to index project {project.id}: {project.title}")

        # Index Products
        products = db.query(Product).all()
        logger.info(f"Found {len(products)} products to index.")
        for product in products:
            success = index_product(
                product_id=product.id,
                name=product.name,
                description=product.description,
                metadata={
                    "price": product.price,
                    "category": product.category,
                    "seller_id": product.seller_id
                }
            )
            if not success:
                logger.warning(f"Failed to index product {product.id}: {product.name}")

        logger.info("Qdrant data indexing completed.")

    except Exception as e:
        logger.error(f"An error occurred during indexing: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure OpenAI API Key is set
    if not os.getenv("OPENAI_API_KEY"):
        logger.error("OPENAI_API_KEY is not set in environment variables. Please set it before running the script.")
        sys.exit(1)
    
    # Ensure Qdrant URL and API Key are set
    if not os.getenv("QDRANT_URL") or not os.getenv("QDRANT_API_KEY"):
        logger.error("QDRANT_URL or QDRANT_API_KEY is not set in environment variables. Please set them before running the script.")
        sys.exit(1)

    index_all_data()
