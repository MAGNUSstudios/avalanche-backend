"""
Script to index all products in the database into Qdrant for semantic search
"""
from database import get_db, Product
import qdrant_service

def index_all_products():
    """Index all active products into Qdrant"""
    db = next(get_db())

    try:
        # Get all active products
        products = db.query(Product).filter(Product.is_active == True).all()

        print(f"Found {len(products)} active products to index")

        indexed_count = 0
        failed_count = 0

        for product in products:
            try:
                success = qdrant_service.index_product(
                    product_id=product.id,
                    name=product.name,
                    description=product.description or "",
                    metadata={
                        "price": float(product.price) if product.price else 0,
                        "seller_id": product.seller_id,
                        "category": product.category or "General"
                    }
                )

                if success:
                    indexed_count += 1
                    print(f"✅ Indexed: {product.name} (ID: {product.id})")
                else:
                    failed_count += 1
                    print(f"❌ Failed to index: {product.name} (ID: {product.id})")

            except Exception as e:
                failed_count += 1
                print(f"❌ Error indexing {product.name}: {str(e)}")

        print(f"\n📊 Indexing complete:")
        print(f"   ✅ Successfully indexed: {indexed_count}")
        print(f"   ❌ Failed: {failed_count}")
        print(f"   📦 Total products: {len(products)}")

    finally:
        db.close()

if __name__ == "__main__":
    index_all_products()
