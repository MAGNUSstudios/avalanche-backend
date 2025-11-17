#!/usr/bin/env python3
"""
Marketplace Product Indexing Script
====================================
This script indexes all products from your database into Qdrant
for semantic search functionality.

Usage:
    python index_marketplace_products.py

Requirements:
    - Qdrant running (docker run -p 6333:6333 qdrant/qdrant)
    - OpenAI API key in .env file
    - Database with Product table populated
"""

import sys
from database import SessionLocal, Product
from marketplace_semantic_search import index_product, bulk_index_products
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def main():
    """
    Index all active products from database to Qdrant
    """
    logger.info("=" * 70)
    logger.info("📦 MARKETPLACE PRODUCT INDEXING")
    logger.info("=" * 70)

    # Create database session
    db = SessionLocal()

    try:
        # Fetch all active products
        logger.info("🔍 Fetching products from database...")
        products = db.query(Product).filter(Product.is_active == True).all()

        total_products = len(products)
        logger.info(f"📊 Found {total_products} active products to index")

        if total_products == 0:
            logger.warning("⚠️  No products found in database!")
            logger.info("💡 Please add some products first, then run this script again.")
            return

        # Show sample products
        logger.info("\n" + "-" * 70)
        logger.info("📋 SAMPLE PRODUCTS (first 5):")
        logger.info("-" * 70)
        for product in products[:5]:
            logger.info(f"  • {product.name} (${product.price}) - Category: {product.category or 'None'}")

        # Ask for confirmation
        logger.info("\n" + "-" * 70)
        response = input(f"\n🔄 Index all {total_products} products to Qdrant? (yes/no): ").strip().lower()

        if response not in ['yes', 'y']:
            logger.info("❌ Indexing cancelled by user")
            return

        # Index products
        logger.info("\n" + "=" * 70)
        logger.info("🚀 STARTING INDEXING PROCESS...")
        logger.info("=" * 70 + "\n")

        successful = 0
        failed = 0

        for i, product in enumerate(products, 1):
            try:
                logger.info(f"[{i}/{total_products}] Indexing: {product.name}")

                result = index_product(
                    product_id=product.id,
                    name=product.name,
                    description=product.description or "",
                    category=product.category or "uncategorized",
                    price=product.price,
                    image_url=product.image_url,
                    stock=product.stock,
                    seller_id=product.seller_id
                )

                if result:
                    successful += 1
                    logger.info(f"  ✅ Indexed successfully")
                else:
                    failed += 1
                    logger.error(f"  ❌ Failed to index")

            except Exception as e:
                failed += 1
                logger.error(f"  ❌ Error: {e}")

        # Summary
        logger.info("\n" + "=" * 70)
        logger.info("📊 INDEXING SUMMARY")
        logger.info("=" * 70)
        logger.info(f"  Total products: {total_products}")
        logger.info(f"  ✅ Successfully indexed: {successful}")
        logger.info(f"  ❌ Failed: {failed}")
        logger.info(f"  Success rate: {(successful/total_products*100):.1f}%")
        logger.info("=" * 70)

        if successful > 0:
            logger.info("\n✨ SUCCESS! Products are now indexed for semantic search!")
            logger.info("\n🧪 Test the search:")
            logger.info("   1. Start your backend server")
            logger.info("   2. Try: GET /marketplace/semantic-search?q=foodstuff")
            logger.info("   3. Or: POST /marketplace/semantic-search with JSON body")

    except Exception as e:
        logger.error(f"❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        db.close()


if __name__ == "__main__":
    main()
