"""
Sync all database data to Qdrant vector database
Run this script to populate Qdrant with all projects, products, and guilds
"""

import sys
from sqlalchemy.orm import Session
from database import engine, Project, Product, Guild
import qdrant_service
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def sync_all_data():
    """Sync all projects, products, and guilds to Qdrant"""

    # Initialize Qdrant clients
    logger.info("Initializing Qdrant clients...")
    qdrant_service.init_qdrant_clients()

    # Initialize collections
    logger.info("Initializing Qdrant collections...")
    if not qdrant_service.initialize_collections():
        logger.error("Failed to initialize collections. Exiting.")
        return False

    # Create database session
    db = Session(engine)

    try:
        # Sync Guilds
        logger.info("\n=== Syncing Guilds ===")
        guilds = db.query(Guild).all()
        guild_success = 0
        for guild in guilds:
            metadata = {
                "category": guild.category,
                "member_count": guild.member_count,
                "is_private": guild.is_private
            }
            if qdrant_service.index_guild(
                guild_id=guild.id,
                name=guild.name,
                description=guild.description or "",
                metadata=metadata
            ):
                guild_success += 1
        logger.info(f"✅ Synced {guild_success}/{len(guilds)} guilds")

        # Sync Products
        logger.info("\n=== Syncing Products ===")
        products = db.query(Product).filter(Product.is_active == True).all()
        product_success = 0
        for product in products:
            metadata = {
                "price": float(product.price),
                "category": product.category,
                "stock": product.stock
            }
            if qdrant_service.index_product(
                product_id=product.id,
                name=product.name,
                description=product.description or "",
                metadata=metadata
            ):
                product_success += 1
        logger.info(f"✅ Synced {product_success}/{len(products)} products")

        # Sync Projects
        logger.info("\n=== Syncing Projects ===")
        projects = db.query(Project).filter(Project.status == "active").all()
        project_success = 0
        for project in projects:
            metadata = {
                "budget": float(project.budget) if project.budget else 0,
                "status": project.status,
                "workflow_status": project.workflow_status
            }
            if qdrant_service.index_project(
                project_id=project.id,
                title=project.title,
                description=project.description or "",
                metadata=metadata
            ):
                project_success += 1
        logger.info(f"✅ Synced {project_success}/{len(projects)} projects")

        logger.info("\n=== Sync Complete ===")
        logger.info(f"Guilds: {guild_success}/{len(guilds)}")
        logger.info(f"Products: {product_success}/{len(products)}")
        logger.info(f"Projects: {project_success}/{len(projects)}")

        return True

    except Exception as e:
        logger.error(f"Error during sync: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Starting Qdrant sync...")
    success = sync_all_data()
    sys.exit(0 if success else 1)
