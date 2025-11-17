"""
Seed script to populate the database with sample marketplace products
"""
from database import SessionLocal, User, Product
from datetime import datetime
import random

# Sample products across different categories
products_data = [
    # Food & Groceries
    {"name": "Organic White Rice 5kg", "description": "Premium quality organic rice from local farmers in Kisumu", "price": 2500, "category": "Food", "stock": 150},
    {"name": "Fresh Tomatoes 2kg", "description": "Farm-fresh tomatoes harvested daily", "price": 800, "category": "Food", "stock": 200},
    {"name": "Maize Flour 2kg", "description": "Stone-ground maize flour, perfect for ugali", "price": 350, "category": "Food", "stock": 300},
    {"name": "Sweet Potatoes 5kg", "description": "Nutritious orange-fleshed sweet potatoes", "price": 1200, "category": "Food", "stock": 100},
    {"name": "Fresh Bananas Bundle", "description": "Sweet matoke bananas, 10-12 pieces", "price": 500, "category": "Food", "stock": 180},
    {"name": "Cooking Oil 2L", "description": "Pure vegetable cooking oil", "price": 1800, "category": "Food", "stock": 120},
    {"name": "Brown Sugar 1kg", "description": "Natural brown sugar", "price": 450, "category": "Food", "stock": 200},
    {"name": "Fresh Milk 1L", "description": "Pasteurized fresh milk delivered daily", "price": 250, "category": "Food", "stock": 250},
    
    # Electronics
    {"name": "Smartphone - Galaxy A34", "description": "Samsung Galaxy A34 5G, 128GB storage", "price": 45000, "category": "Electronics", "stock": 25},
    {"name": "Wireless Earbuds", "description": "Bluetooth 5.0 wireless earbuds with charging case", "price": 3500, "category": "Electronics", "stock": 60},
    {"name": "Power Bank 20000mAh", "description": "Fast charging power bank with dual USB ports", "price": 4200, "category": "Electronics", "stock": 80},
    {"name": "Laptop - HP 15s", "description": "HP 15s laptop, Intel i5, 8GB RAM, 512GB SSD", "price": 85000, "category": "Electronics", "stock": 15},
    {"name": "Smart Watch", "description": "Fitness tracker with heart rate monitor", "price": 8500, "category": "Electronics", "stock": 40},
    {"name": "USB Flash Drive 64GB", "description": "High-speed USB 3.0 flash drive", "price": 1200, "category": "Electronics", "stock": 150},
    
    # Clothing
    {"name": "Men's T-Shirt - Cotton", "description": "100% cotton crew neck t-shirt, various colors", "price": 1500, "category": "Clothing", "stock": 200},
    {"name": "Women's Dress - Ankara", "description": "Beautiful African print dress, custom sizes", "price": 3800, "category": "Clothing", "stock": 50},
    {"name": "Jeans - Denim", "description": "Classic blue denim jeans, all sizes", "price": 2800, "category": "Clothing", "stock": 120},
    {"name": "Running Shoes", "description": "Comfortable sports shoes for running", "price": 4500, "category": "Clothing", "stock": 80},
    {"name": "Backpack - School/Work", "description": "Durable backpack with laptop compartment", "price": 3200, "category": "Clothing", "stock": 90},
    
    # Home & Living
    {"name": "Bed Sheets Set - Queen", "description": "Quality cotton bed sheets, 4-piece set", "price": 5500, "category": "Home", "stock": 60},
    {"name": "Cooking Pot Set", "description": "Non-stick cooking pots, 5 pieces", "price": 4800, "category": "Home", "stock": 45},
    {"name": "LED Bulbs Pack of 4", "description": "Energy-saving LED bulbs, 12W", "price": 1200, "category": "Home", "stock": 200},
    {"name": "Plastic Storage Boxes", "description": "Set of 3 stackable storage containers", "price": 2200, "category": "Home", "stock": 100},
    {"name": "Floor Mat - Carpet", "description": "Soft carpet floor mat, 120x180cm", "price": 3500, "category": "Home", "stock": 70},
    
    # Health & Beauty
    {"name": "Aloe Vera Gel", "description": "Natural aloe vera gel for skin care", "price": 850, "category": "Beauty", "stock": 150},
    {"name": "Shea Butter - Raw", "description": "100% pure shea butter from Ghana", "price": 1200, "category": "Beauty", "stock": 120},
    {"name": "Face Mask Pack of 10", "description": "Disposable 3-ply face masks", "price": 500, "category": "Beauty", "stock": 300},
    {"name": "Hand Sanitizer 500ml", "description": "Antibacterial hand sanitizer gel", "price": 800, "category": "Beauty", "stock": 200},
    {"name": "Body Lotion", "description": "Moisturizing body lotion with cocoa butter", "price": 1500, "category": "Beauty", "stock": 180},
    
    # Books & Stationery
    {"name": "Exercise Books Pack of 10", "description": "School exercise books, 40 pages", "price": 600, "category": "Books", "stock": 400},
    {"name": "Ballpoint Pens Box", "description": "Blue ink pens, box of 50", "price": 1000, "category": "Books", "stock": 250},
    {"name": "Novel - Things Fall Apart", "description": "Classic African literature by Chinua Achebe", "price": 1800, "category": "Books", "stock": 80},
    {"name": "Calculator - Scientific", "description": "Scientific calculator for students", "price": 2500, "category": "Books", "stock": 100},
    {"name": "Art Supplies Set", "description": "Drawing pencils, crayons, and sketch pad", "price": 3200, "category": "Books", "stock": 60},
    
    # Baby & Kids
    {"name": "Baby Diapers Pack", "description": "Soft diapers for babies 3-6 months, 50 pieces", "price": 2800, "category": "Baby", "stock": 150},
    {"name": "Baby Wipes", "description": "Gentle baby wipes, 3 packs", "price": 900, "category": "Baby", "stock": 200},
    {"name": "Kids Toy Car", "description": "Colorful toy car for toddlers", "price": 1500, "category": "Baby", "stock": 100},
    {"name": "Baby Clothes Set", "description": "Cute baby rompers, 3-piece set", "price": 2400, "category": "Baby", "stock": 80},
    
    # Sports & Outdoors
    {"name": "Football - Official Size", "description": "Quality football for training and matches", "price": 2500, "category": "Sports", "stock": 70},
    {"name": "Yoga Mat", "description": "Non-slip yoga mat with carrying strap", "price": 2800, "category": "Sports", "stock": 90},
    {"name": "Water Bottle 1L", "description": "BPA-free sports water bottle", "price": 800, "category": "Sports", "stock": 200},
    {"name": "Jump Rope", "description": "Adjustable fitness jump rope", "price": 600, "category": "Sports", "stock": 150},
]

def seed_products():
    """Populate database with products"""
    db = SessionLocal()
    
    try:
        print("🌱 Starting product seeding process...")
        
        # Get admin user to be the seller
        admin_user = db.query(User).filter(User.email == "admin@avalanche.com").first()
        if not admin_user:
            print("❌ Admin user not found. Please run seed_guilds.py first.")
            return
        
        print(f"👤 Using admin user as seller: {admin_user.email}")
        
        # Check existing products
        existing_count = db.query(Product).count()
        print(f"📊 Existing products in database: {existing_count}")
        
        # Create products
        created_count = 0
        for product_data in products_data:
            # Check if product already exists
            existing_product = db.query(Product).filter(Product.name == product_data["name"]).first()
            if existing_product:
                print(f"⏭️  Skipping '{product_data['name']}' - already exists")
                continue
            
            # Create new product
            new_product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                category=product_data["category"],
                stock=product_data["stock"],
                seller_id=admin_user.id,
                is_active=True,
                created_at=datetime.utcnow()
            )
            
            db.add(new_product)
            created_count += 1
            print(f"✅ Created product: {product_data['name']} (₦{product_data['price']})")
        
        db.commit()
        
        # Final stats
        total_products = db.query(Product).count()
        print("\n" + "="*50)
        print(f"🎉 Product seeding completed!")
        print(f"📊 Products created: {created_count}")
        print(f"📊 Total products in database: {total_products}")
        print("="*50)
        
        # Show category breakdown
        print("\n📋 Products by category:")
        categories = db.query(Product.category).distinct().all()
        for (category,) in categories:
            count = db.query(Product).filter(Product.category == category).count()
            total_value = db.query(Product).filter(Product.category == category).all()
            avg_price = sum(p.price for p in total_value) / len(total_value) if total_value else 0
            print(f"   • {category}: {count} products (Avg: ₦{avg_price:.0f})")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
