#!/usr/bin/env python3
"""
Script to seed the database with sample data for development and testing
"""

from database import SessionLocal, User, Guild, Project, Product, Message, Order, Escrow, Payment, init_db
from auth import get_password_hash
import random
from datetime import datetime, timedelta

def seed_database():
    """Seed database with sample data"""
    print("🌱 Starting database seeding...")
    
    # Initialize database
    init_db()
    
    db = SessionLocal()
    
    try:
        # Check if data already exists
        user_count = db.query(User).count()
        if user_count > 2:
            print(f"⏭️  Database already has {user_count} users. Skipping seed.")
            return
        
        print("\n📝 Creating sample users...")
        # Create sample users
        users_data = [
            {"email": "john.doe@example.com", "first_name": "John", "last_name": "Doe", "country": "Nigeria"},
            {"email": "jane.smith@example.com", "first_name": "Jane", "last_name": "Smith", "country": "Kenya"},
            {"email": "nia.adebayo@example.com", "first_name": "Nia", "last_name": "Adebayo", "country": "Ghana"},
            {"email": "kwame.mensah@example.com", "first_name": "Kwame", "last_name": "Mensah", "country": "Ghana"},
            {"email": "amara.okafor@example.com", "first_name": "Amara", "last_name": "Okafor", "country": "Nigeria"},
            {"email": "thabo.mwangi@example.com", "first_name": "Thabo", "last_name": "Mwangi", "country": "South Africa"},
            {"email": "zara.hassan@example.com", "first_name": "Zara", "last_name": "Hassan", "country": "Egypt"},
            {"email": "kofi.asante@example.com", "first_name": "Kofi", "last_name": "Asante", "country": "Ghana"},
        ]
        
        users = []
        for i, user_data in enumerate(users_data):
            user = User(
                email=user_data["email"],
                username=user_data["email"].split('@')[0],
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                country=user_data["country"],
                hashed_password=get_password_hash("password123"),
                role="user",
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60))
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        print(f"✅ Created {len(users)} sample users")
        
        print("\n🏰 Creating sample guilds...")
        # Create sample guilds
        guilds_data = [
            {"name": "AI Builders Africa", "description": "Building AI solutions for African problems", "category": "Technology", "member_count": 156},
            {"name": "Fintech Kenya", "description": "Revolutionizing financial services in Kenya", "category": "Finance", "member_count": 98},
            {"name": "Creative Economy", "description": "Supporting African creatives and artists", "category": "Arts", "member_count": 234},
            {"name": "Sustainable Tech", "description": "Green technology and sustainability initiatives", "category": "Environment", "member_count": 87},
            {"name": "Blockchain Africa", "description": "Decentralization and blockchain technology", "category": "Technology", "member_count": 142},
            {"name": "EdTech Innovators", "description": "Transforming education through technology", "category": "Education", "member_count": 119},
        ]
        
        guilds = []
        for guild_data in guilds_data:
            guild = Guild(
                name=guild_data["name"],
                description=guild_data["description"],
                category=guild_data["category"],
                member_count=guild_data["member_count"],
                owner_id=random.choice(users).id,
                is_private=False,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90))
            )
            db.add(guild)
            guilds.append(guild)
        
        db.commit()
        print(f"✅ Created {len(guilds)} sample guilds")
        
        # Skipping sample projects - let real users create them
        projects = []
        print("⏭️  Skipping sample projects - ready for real user data")
        
        print("\n🛍️ Creating sample products...")
        # Create sample products
        products_data = [
            {"name": "Handcrafted Beaded Necklace", "description": "Beautiful traditional beadwork", "price": 45.99, "category": "Jewelry", "stock": 20},
            {"name": "African Print Fabric", "description": "Premium quality Ankara fabric", "price": 25.00, "category": "Textiles", "stock": 50},
            {"name": "Wooden Sculpture", "description": "Hand-carved wooden art piece", "price": 120.00, "category": "Art", "stock": 5},
            {"name": "Shea Butter Skincare Set", "description": "Natural organic skincare products", "price": 35.50, "category": "Beauty", "stock": 30},
            {"name": "Basket Weaving Kit", "description": "Complete basket weaving starter kit", "price": 28.99, "category": "Crafts", "stock": 15},
            {"name": "Traditional Drum", "description": "Authentic African djembe drum", "price": 85.00, "category": "Music", "stock": 8},
            {"name": "Leather Sandals", "description": "Handmade leather sandals", "price": 55.00, "category": "Fashion", "stock": 25},
            {"name": "Coffee Beans - Ethiopian", "description": "Premium Ethiopian coffee beans", "price": 18.99, "category": "Food", "stock": 100},
        ]
        
        products = []
        for product_data in products_data:
            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                category=product_data["category"],
                stock=product_data["stock"],
                seller_id=random.choice(users).id,
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90))
            )
            db.add(product)
            products.append(product)
        
        db.commit()
        print(f"✅ Created {len(products)} sample products")
        
        print("\n💰 Creating sample orders and payments...")
        # Create sample orders
        orders = []
        for i in range(20):
            product = random.choice(products)
            buyer = random.choice(users)
            seller = db.query(User).filter(User.id == product.seller_id).first()
            
            order_cost = product.price
            service_fee = order_cost * 0.05
            total = order_cost + service_fee
            
            order_status = random.choice(["pending", "paid", "processing", "completed", "completed", "completed"])
            
            order = Order(
                order_number=f"AV{78230 + i}",
                buyer_id=buyer.id,
                seller_id=seller.id,
                product_id=product.id,
                item_name=product.name,
                item_description=product.description,
                item_cost=order_cost,
                service_fee=service_fee,
                total_amount=total,
                status=order_status,
                payment_method=random.choice(["card", "bank_transfer", "mobile_money"]),
                payment_provider="paystack",
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 45)),
                completed_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)) if order_status == "completed" else None
            )
            db.add(order)
            orders.append(order)
            
            # Create payment for paid/completed orders
            if order_status in ["paid", "completed"]:
                payment = Payment(
                    order_id=order.id,
                    amount=total,
                    currency="USD",
                    payment_method=order.payment_method,
                    payment_provider=order.payment_provider,
                    provider_reference=f"PAY{random.randint(100000, 999999)}",
                    status="completed" if order_status == "completed" else "success",
                    created_at=order.created_at,
                    completed_at=order.created_at + timedelta(minutes=5)
                )
                db.add(payment)
                
                # Create escrow for completed orders
                if order_status == "completed":
                    escrow = Escrow(
                        order_id=order.id,
                        amount=order_cost,
                        status="released",
                        auto_release_days=7,
                        requires_buyer_approval=True,
                        requires_delivery_confirmation=True,
                        buyer_approved=True,
                        delivery_confirmed=True,
                        created_at=order.created_at,
                        released_at=order.completed_at
                    )
                    db.add(escrow)
        
        db.commit()
        print(f"✅ Created {len(orders)} sample orders with payments and escrow")
        
        print("\n💬 Creating sample messages...")
        # Create sample messages
        for i in range(15):
            sender = random.choice(users)
            recipient = random.choice([u for u in users if u.id != sender.id])
            
            message = Message(
                content=random.choice([
                    "Hi, I'm interested in your product!",
                    "Is this still available?",
                    "Can we discuss the project details?",
                    "Thank you for your purchase!",
                    "When can you deliver this item?",
                    "I'd like to join your guild.",
                    "Let's collaborate on this project!",
                ]),
                sender_id=sender.id,
                recipient_id=recipient.id,
                is_read=random.choice([True, False]),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 72))
            )
            db.add(message)
        
        db.commit()
        print("✅ Created 15 sample messages")
        
        print("\n" + "="*50)
        print("🎉 Database seeding completed successfully!")
        print("="*50)
        print(f"👥 Users: {len(users)}")
        print(f"🏰 Guilds: {len(guilds)}")
        print(f"🚀 Projects: {len(projects)}")
        print(f"🛍️ Products: {len(products)}")
        print(f"💰 Orders: {len(orders)}")
        print("="*50)
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
