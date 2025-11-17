#!/usr/bin/env python3
"""
Comprehensive seed script to populate database with realistic sample data
- 100+ marketplace product listings
- 50+ users
- 50 projects
- 50 orders
- Posts, comments, messages, etc.
"""

from database import (
    SessionLocal, User, Guild, Project, Product, Message, Order, Escrow, Payment,
    Post, Comment, Task, Wallet, WalletTransaction, init_db
)
from auth import get_password_hash
import random
from datetime import datetime, timedelta

# Sample data pools
FIRST_NAMES = [
    "Amara", "Kofi", "Zara", "Kwame", "Nia", "Thabo", "Amina", "Jabari", "Ife", "Malik",
    "Zahara", "Kendi", "Asante", "Ayanna", "Desta", "Faraji", "Imani", "Jengo", "Kali", "Lulu",
    "Makena", "Nia", "Oluwa", "Panya", "Raha", "Safiya", "Tendai", "Ubah", "Wanjiru", "Yara",
    "Adisa", "Biko", "Chinua", "Dayo", "Eshe", "Femi", "Gamba", "Habib", "Idris", "Jelani",
    "Kamau", "Lamin", "Mosi", "Nuru", "Obi", "Pemba", "Rashid", "Sekou", "Tumaini", "Uzuri",
    "John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Maria", "Robert", "Linda"
]

LAST_NAMES = [
    "Adebayo", "Mensah", "Okafor", "Mwangi", "Hassan", "Asante", "Diop", "Nkosi", "Owusu", "Kamara",
    "Banda", "Chinedu", "Dlamini", "Eze", "Fofana", "Gbeho", "Habte", "Idowu", "Juma", "Kone",
    "Lumumba", "Mbeki", "Ndlovu", "Okonkwo", "Patel", "Qwabe", "Ramaphosa", "Sankara", "Toure", "Umar",
    "Wale", "Xaba", "Yeboah", "Zulu", "Afolabi", "Boateng", "Chakraborty", "Dubois", "Ekwueme", "Fela",
    "Gibbs", "Hussain", "Ibrahim", "Johnson", "Khan", "Lopez", "Martinez", "Nwosu", "O'Brien", "Pierre",
    "Smith", "Williams", "Brown", "Jones", "Garcia", "Rodriguez", "Wilson", "Moore", "Taylor", "Anderson"
]

COUNTRIES = [
    "Nigeria", "Kenya", "Ghana", "South Africa", "Egypt", "Ethiopia", "Tanzania", "Uganda",
    "Senegal", "Morocco", "Rwanda", "Zambia", "Zimbabwe", "Botswana", "Namibia", "Tunisia"
]

# Expanded product catalog - 100+ items
PRODUCTS_DATA = [
    # Electronics (20 items)
    {"name": "Samsung Galaxy S23 Ultra", "description": "Flagship smartphone with 200MP camera, 12GB RAM, 256GB storage", "price": 125000, "category": "Electronics", "stock": 15},
    {"name": "iPhone 14 Pro Max", "description": "Apple flagship with A16 chip, 48MP camera, 256GB", "price": 145000, "category": "Electronics", "stock": 12},
    {"name": "MacBook Air M2", "description": "13-inch MacBook Air with M2 chip, 8GB RAM, 256GB SSD", "price": 185000, "category": "Electronics", "stock": 8},
    {"name": "Dell XPS 15 Laptop", "description": "15.6\" laptop, Intel i7, 16GB RAM, 512GB SSD, NVIDIA GPU", "price": 165000, "category": "Electronics", "stock": 10},
    {"name": "iPad Air 5th Gen", "description": "10.9\" iPad with M1 chip, 64GB WiFi", "price": 75000, "category": "Electronics", "stock": 20},
    {"name": "Sony WH-1000XM5 Headphones", "description": "Premium noise-canceling wireless headphones", "price": 45000, "category": "Electronics", "stock": 30},
    {"name": "AirPods Pro 2nd Gen", "description": "Apple wireless earbuds with active noise cancellation", "price": 35000, "category": "Electronics", "stock": 40},
    {"name": "Samsung 55\" 4K Smart TV", "description": "55-inch QLED 4K Smart TV with HDR", "price": 95000, "category": "Electronics", "stock": 12},
    {"name": "PlayStation 5", "description": "Sony PS5 gaming console with DualSense controller", "price": 85000, "category": "Electronics", "stock": 8},
    {"name": "Xbox Series X", "description": "Microsoft Xbox Series X 1TB gaming console", "price": 82000, "category": "Electronics", "stock": 10},
    {"name": "Canon EOS R6 Camera", "description": "Full-frame mirrorless camera with 20MP sensor", "price": 325000, "category": "Electronics", "stock": 5},
    {"name": "DJI Mini 3 Pro Drone", "description": "Compact drone with 4K camera and 34-min flight time", "price": 115000, "category": "Electronics", "stock": 7},
    {"name": "Anker PowerCore 26800", "description": "High-capacity portable charger with 3 USB ports", "price": 8500, "category": "Electronics", "stock": 60},
    {"name": "Logitech MX Master 3S", "description": "Advanced wireless mouse for professionals", "price": 12000, "category": "Electronics", "stock": 45},
    {"name": "Mechanical Keyboard RGB", "description": "Gaming mechanical keyboard with RGB backlighting", "price": 15000, "category": "Electronics", "stock": 35},
    {"name": "Portable SSD 1TB", "description": "Samsung T7 portable SSD, up to 1050MB/s", "price": 18000, "category": "Electronics", "stock": 50},
    {"name": "Smart Watch Series 8", "description": "Advanced fitness tracker with ECG and blood oxygen", "price": 42000, "category": "Electronics", "stock": 25},
    {"name": "Ring Video Doorbell", "description": "Smart doorbell with HD video and motion detection", "price": 22000, "category": "Electronics", "stock": 30},
    {"name": "Bose SoundLink Speaker", "description": "Portable Bluetooth speaker with 12-hour battery", "price": 28000, "category": "Electronics", "stock": 40},
    {"name": "Webcam 1080p HD", "description": "Logitech webcam with auto-focus and noise reduction", "price": 9500, "category": "Electronics", "stock": 55},

    # Fashion & Clothing (20 items)
    {"name": "Ankara Print Dress", "description": "Beautiful African print midi dress, custom tailored", "price": 8500, "category": "Fashion", "stock": 40},
    {"name": "Men's Kaftan - Premium", "description": "Elegant embroidered kaftan for special occasions", "price": 12000, "category": "Fashion", "stock": 25},
    {"name": "Leather Jacket", "description": "Genuine leather jacket, black, all sizes", "price": 25000, "category": "Fashion", "stock": 15},
    {"name": "Designer Sneakers", "description": "Limited edition athletic sneakers", "price": 18000, "category": "Fashion", "stock": 30},
    {"name": "Silk Scarf Set", "description": "Set of 3 premium silk scarves, various patterns", "price": 5500, "category": "Fashion", "stock": 60},
    {"name": "Men's Suit - 3 Piece", "description": "Tailored 3-piece suit, navy blue", "price": 35000, "category": "Fashion", "stock": 20},
    {"name": "Evening Gown", "description": "Elegant floor-length evening gown", "price": 28000, "category": "Fashion", "stock": 12},
    {"name": "Casual Denim Jeans", "description": "Premium denim jeans, slim fit", "price": 6500, "category": "Fashion", "stock": 80},
    {"name": "T-Shirt Pack of 5", "description": "Cotton crew neck t-shirts, assorted colors", "price": 4500, "category": "Fashion", "stock": 100},
    {"name": "Leather Handbag", "description": "Designer leather handbag with gold accents", "price": 22000, "category": "Fashion", "stock": 18},
    {"name": "Men's Dress Shoes", "description": "Formal leather oxford shoes", "price": 14000, "category": "Fashion", "stock": 35},
    {"name": "Sports Bra Set", "description": "High-performance sports bra, 3-pack", "price": 4200, "category": "Fashion", "stock": 70},
    {"name": "Winter Coat", "description": "Warm winter coat with faux fur trim", "price": 32000, "category": "Fashion", "stock": 15},
    {"name": "Sunglasses - Designer", "description": "UV protection designer sunglasses", "price": 8500, "category": "Fashion", "stock": 45},
    {"name": "Wristwatch - Automatic", "description": "Mechanical automatic wristwatch", "price": 55000, "category": "Fashion", "stock": 10},
    {"name": "Belt - Leather", "description": "Genuine leather belt with metal buckle", "price": 3500, "category": "Fashion", "stock": 90},
    {"name": "Backpack - Designer", "description": "Stylish backpack with laptop compartment", "price": 12000, "category": "Fashion", "stock": 40},
    {"name": "Running Shoes", "description": "Professional running shoes with air cushion", "price": 9500, "category": "Fashion", "stock": 55},
    {"name": "Polo Shirts - Pack of 3", "description": "Classic polo shirts, various colors", "price": 7500, "category": "Fashion", "stock": 65},
    {"name": "Yoga Pants", "description": "High-waist yoga pants with pockets", "price": 3800, "category": "Fashion", "stock": 85},

    # Home & Living (20 items)
    {"name": "Queen Bed Frame", "description": "Solid wood queen size bed frame", "price": 45000, "category": "Home", "stock": 8},
    {"name": "Mattress - Memory Foam", "description": "King size memory foam mattress", "price": 65000, "category": "Home", "stock": 10},
    {"name": "Dining Table Set", "description": "6-seater dining table with chairs", "price": 85000, "category": "Home", "stock": 5},
    {"name": "Sofa - 3 Seater", "description": "Modern fabric sofa, grey", "price": 95000, "category": "Home", "stock": 7},
    {"name": "Coffee Table", "description": "Glass-top coffee table with wooden legs", "price": 18000, "category": "Home", "stock": 20},
    {"name": "Bookshelf - 5 Tier", "description": "Wooden bookshelf, 180cm height", "price": 22000, "category": "Home", "stock": 15},
    {"name": "Area Rug 8x10", "description": "Persian-style area rug, handwoven", "price": 35000, "category": "Home", "stock": 12},
    {"name": "Curtains Set", "description": "Blackout curtains, 2 panels, various colors", "price": 8500, "category": "Home", "stock": 40},
    {"name": "Table Lamp", "description": "Modern LED table lamp with touch control", "price": 4500, "category": "Home", "stock": 50},
    {"name": "Wall Mirror", "description": "Large decorative wall mirror, 120x80cm", "price": 15000, "category": "Home", "stock": 18},
    {"name": "Cookware Set - 12pc", "description": "Stainless steel cookware set", "price": 28000, "category": "Home", "stock": 25},
    {"name": "Dinner Set - 24pc", "description": "Porcelain dinner set, service for 6", "price": 18000, "category": "Home", "stock": 30},
    {"name": "Blender - High Speed", "description": "1500W professional blender", "price": 12000, "category": "Home", "stock": 35},
    {"name": "Air Fryer", "description": "5L digital air fryer with 8 presets", "price": 15000, "category": "Home", "stock": 40},
    {"name": "Vacuum Cleaner", "description": "Bagless vacuum cleaner with HEPA filter", "price": 22000, "category": "Home", "stock": 20},
    {"name": "Microwave Oven", "description": "25L microwave with grill function", "price": 18000, "category": "Home", "stock": 25},
    {"name": "Bed Sheet Set", "description": "Egyptian cotton bed sheets, queen size", "price": 8500, "category": "Home", "stock": 60},
    {"name": "Pillow Set of 4", "description": "Memory foam pillows with cooling gel", "price": 12000, "category": "Home", "stock": 45},
    {"name": "Throw Blanket", "description": "Soft fleece throw blanket, 150x200cm", "price": 4500, "category": "Home", "stock": 70},
    {"name": "Storage Containers", "description": "Set of 10 airtight food containers", "price": 5500, "category": "Home", "stock": 55},

    # Food & Beverages (15 items)
    {"name": "Premium Coffee Beans 1kg", "description": "Ethiopian Yirgacheffe coffee beans", "price": 4500, "category": "Food", "stock": 100},
    {"name": "Organic Honey 500g", "description": "Raw organic honey from local beekeepers", "price": 2800, "category": "Food", "stock": 120},
    {"name": "Olive Oil - Extra Virgin", "description": "1L extra virgin olive oil, cold-pressed", "price": 3500, "category": "Food", "stock": 80},
    {"name": "Basmati Rice 10kg", "description": "Premium aged basmati rice", "price": 8500, "category": "Food", "stock": 60},
    {"name": "Assorted Nuts 500g", "description": "Mixed nuts - almonds, cashews, walnuts", "price": 3200, "category": "Food", "stock": 90},
    {"name": "Dark Chocolate Box", "description": "Belgian dark chocolate, 70% cocoa", "price": 2500, "category": "Food", "stock": 110},
    {"name": "Green Tea - Premium", "description": "Japanese green tea, 100 bags", "price": 1800, "category": "Food", "stock": 150},
    {"name": "Spice Set", "description": "Set of 20 essential spices in glass jars", "price": 6500, "category": "Food", "stock": 45},
    {"name": "Pasta Variety Pack", "description": "5 types of Italian pasta, 2kg total", "price": 2800, "category": "Food", "stock": 85},
    {"name": "Organic Quinoa 1kg", "description": "White quinoa, certified organic", "price": 3800, "category": "Food", "stock": 70},
    {"name": "Granola - Homemade", "description": "Artisan granola with nuts and dried fruit", "price": 2200, "category": "Food", "stock": 95},
    {"name": "Protein Powder 1kg", "description": "Whey protein isolate, chocolate flavor", "price": 8500, "category": "Food", "stock": 55},
    {"name": "Dried Fruit Mix 500g", "description": "Mixed dried fruits - dates, figs, apricots", "price": 2800, "category": "Food", "stock": 100},
    {"name": "Hot Sauce Collection", "description": "Set of 5 artisan hot sauces", "price": 4500, "category": "Food", "stock": 60},
    {"name": "Herbal Tea Collection", "description": "10 varieties of herbal teas, 200 bags", "price": 3500, "category": "Food", "stock": 75},

    # Beauty & Personal Care (15 items)
    {"name": "Skincare Routine Set", "description": "Complete skincare set - cleanser, toner, serum, moisturizer", "price": 12000, "category": "Beauty", "stock": 40},
    {"name": "Hair Growth Oil", "description": "Natural hair growth oil with rosemary and castor oil", "price": 2800, "category": "Beauty", "stock": 85},
    {"name": "Makeup Brush Set", "description": "Professional 24-piece makeup brush set", "price": 8500, "category": "Beauty", "stock": 50},
    {"name": "Perfume - Designer", "description": "100ml designer fragrance for women", "price": 18000, "category": "Beauty", "stock": 30},
    {"name": "Men's Cologne", "description": "50ml premium cologne for men", "price": 15000, "category": "Beauty", "stock": 35},
    {"name": "Face Mask Set", "description": "Variety pack of 20 sheet masks", "price": 4500, "category": "Beauty", "stock": 70},
    {"name": "Body Butter - Shea", "description": "100% pure shea body butter, 500g", "price": 3200, "category": "Beauty", "stock": 90},
    {"name": "Nail Polish Set", "description": "12 trendy nail polish colors", "price": 3800, "category": "Beauty", "stock": 65},
    {"name": "Hair Straightener", "description": "Ceramic hair straightener with heat control", "price": 8500, "category": "Beauty", "stock": 45},
    {"name": "Electric Shaver", "description": "Men's electric shaver with precision trimmer", "price": 12000, "category": "Beauty", "stock": 40},
    {"name": "Lip Care Set", "description": "Lip scrub, balm, and tint set", "price": 2500, "category": "Beauty", "stock": 80},
    {"name": "Body Lotion - Cocoa", "description": "Moisturizing cocoa butter lotion, 400ml", "price": 2200, "category": "Beauty", "stock": 100},
    {"name": "Sunscreen SPF 50", "description": "Broad spectrum sunscreen for face and body", "price": 3500, "category": "Beauty", "stock": 75},
    {"name": "Facial Cleanser", "description": "Gentle foaming facial cleanser for all skin types", "price": 2800, "category": "Beauty", "stock": 95},
    {"name": "Anti-Aging Serum", "description": "Vitamin C serum with hyaluronic acid", "price": 6500, "category": "Beauty", "stock": 55},

    # Books & Stationery (10 items)
    {"name": "Notebook Set - Leather", "description": "Set of 3 leather-bound notebooks", "price": 4500, "category": "Books", "stock": 60},
    {"name": "Fountain Pen Set", "description": "Premium fountain pen set with ink", "price": 8500, "category": "Books", "stock": 30},
    {"name": "African Literature Collection", "description": "Set of 10 classic African novels", "price": 15000, "category": "Books", "stock": 25},
    {"name": "Business Book Bundle", "description": "5 bestselling business and leadership books", "price": 12000, "category": "Books", "stock": 40},
    {"name": "Planner 2024", "description": "Deluxe daily planner with goal tracking", "price": 3500, "category": "Books", "stock": 80},
    {"name": "Art Supplies Pro Set", "description": "Professional art supplies set - paints, brushes, canvas", "price": 18000, "category": "Books", "stock": 20},
    {"name": "Calligraphy Kit", "description": "Complete calligraphy starter kit", "price": 5500, "category": "Books", "stock": 35},
    {"name": "Sticky Notes Collection", "description": "Colorful sticky notes in various sizes, 1000 sheets", "price": 2200, "category": "Books", "stock": 100},
    {"name": "Desk Organizer Set", "description": "Bamboo desk organizer with multiple compartments", "price": 4500, "category": "Books", "stock": 50},
    {"name": "Marker Set - Professional", "description": "60-color professional marker set", "price": 6500, "category": "Books", "stock": 45},
]

# Project templates
PROJECT_TEMPLATES = [
    {"title": "E-Commerce Website Development", "description": "Build a full-featured online store with payment integration", "budget": 250000, "status": "active"},
    {"title": "Mobile App for Delivery Service", "description": "iOS and Android app for food delivery marketplace", "budget": 450000, "status": "active"},
    {"title": "Logo and Brand Identity Design", "description": "Complete brand identity package for startup", "budget": 85000, "status": "active"},
    {"title": "Social Media Marketing Campaign", "description": "3-month social media strategy and content creation", "budget": 120000, "status": "active"},
    {"title": "Custom Inventory Management System", "description": "Web-based inventory tracking system", "budget": 180000, "status": "active"},
    {"title": "SEO Optimization for Website", "description": "Comprehensive SEO audit and optimization", "budget": 65000, "status": "active"},
    {"title": "Video Production - Company Profile", "description": "Professional company profile video production", "budget": 150000, "status": "active"},
    {"title": "Accounting Software Integration", "description": "Integrate QuickBooks with existing systems", "budget": 95000, "status": "active"},
    {"title": "UI/UX Redesign for Mobile App", "description": "Complete redesign of user interface", "budget": 140000, "status": "active"},
    {"title": "Content Writing - Blog Posts", "description": "20 SEO-optimized blog posts", "budget": 45000, "status": "active"},
]

def seed_comprehensive():
    """Comprehensive database seeding"""
    print("🌱 Starting comprehensive database seeding...")
    print("="*60)

    init_db()
    db = SessionLocal()

    try:
        # Create 50+ users
        print("\n👥 Creating 50+ users...")
        users = []
        for i in range(60):
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            email = f"{first_name.lower()}.{last_name.lower()}{i}@example.com"

            # Check if user exists
            existing = db.query(User).filter(User.email == email).first()
            if existing:
                users.append(existing)
                continue

            user = User(
                email=email,
                username=f"{first_name.lower()}{last_name.lower()}{i}",
                first_name=first_name,
                last_name=last_name,
                country=random.choice(COUNTRIES),
                hashed_password=get_password_hash("password123"),
                role="user",
                bio=f"{first_name} is a professional from {random.choice(COUNTRIES)}",
                is_active=True,
                ai_tier=random.choice([None, "free", "pro", "max"]),
                plan_selected=random.choice([True, False]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 180))
            )
            db.add(user)
            users.append(user)

        db.commit()
        print(f"✅ Created/verified {len(users)} users")

        # Create wallets for all users
        print("\n💰 Creating wallets for users...")
        wallet_count = 0
        for user in users:
            existing_wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
            if not existing_wallet:
                wallet = Wallet(
                    user_id=user.id,
                    balance=random.uniform(0, 50000)
                )
                db.add(wallet)
                wallet_count += 1

        db.commit()
        print(f"✅ Created {wallet_count} new wallets")

        # Create 100+ products
        print("\n🛍️ Creating 100+ marketplace products...")
        products = []
        for product_data in PRODUCTS_DATA:
            # Check if exists
            existing = db.query(Product).filter(Product.name == product_data["name"]).first()
            if existing:
                products.append(existing)
                continue

            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                price=product_data["price"],
                category=product_data["category"],
                stock=product_data["stock"],
                seller_id=random.choice(users).id,
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 120))
            )
            db.add(product)
            products.append(product)

        db.commit()
        print(f"✅ Created {len(products)} products")

        # Show category breakdown
        print("\n📊 Products by category:")
        for category in ["Electronics", "Fashion", "Home", "Food", "Beauty", "Books"]:
            count = db.query(Product).filter(Product.category == category).count()
            print(f"   • {category}: {count} products")

        # Create 20 guilds
        print("\n🏰 Creating guilds...")
        guild_data = [
            {"name": "AI & Machine Learning", "description": "Artificial intelligence and ML enthusiasts", "category": "Technology"},
            {"name": "Web Development Pro", "description": "Full-stack web developers community", "category": "Technology"},
            {"name": "Mobile App Developers", "description": "iOS and Android development", "category": "Technology"},
            {"name": "Digital Marketing", "description": "Social media and digital marketing experts", "category": "Marketing"},
            {"name": "Graphic Designers", "description": "Creative graphic and UI/UX designers", "category": "Design"},
            {"name": "Content Creators", "description": "Writers, bloggers, and content strategists", "category": "Writing"},
            {"name": "E-Commerce Sellers", "description": "Online sellers and entrepreneurs", "category": "Business"},
            {"name": "Crypto & Blockchain", "description": "Cryptocurrency and blockchain technology", "category": "Finance"},
            {"name": "Photography Club", "description": "Professional and amateur photographers", "category": "Arts"},
            {"name": "Video Production", "description": "Videographers and video editors", "category": "Media"},
            {"name": "Data Science Hub", "description": "Data scientists and analysts", "category": "Technology"},
            {"name": "Cybersecurity", "description": "Security professionals and ethical hackers", "category": "Technology"},
            {"name": "Music Production", "description": "Music producers and audio engineers", "category": "Arts"},
            {"name": "Animation Studio", "description": "2D and 3D animators", "category": "Design"},
            {"name": "Virtual Assistants", "description": "Professional virtual assistants network", "category": "Business"},
            {"name": "Fitness Coaches", "description": "Personal trainers and fitness experts", "category": "Health"},
            {"name": "Language Teachers", "description": "Language tutors and instructors", "category": "Education"},
            {"name": "Legal Services", "description": "Lawyers and legal consultants", "category": "Professional"},
            {"name": "Accounting & Finance", "description": "Accountants and financial advisors", "category": "Finance"},
            {"name": "Architecture & Design", "description": "Architects and interior designers", "category": "Design"},
        ]

        guilds = []
        for guild_info in guild_data:
            existing = db.query(Guild).filter(Guild.name == guild_info["name"]).first()
            if existing:
                guilds.append(existing)
                continue

            guild = Guild(
                name=guild_info["name"],
                description=guild_info["description"],
                category=guild_info["category"],
                member_count=random.randint(50, 500),
                owner_id=random.choice(users).id,
                is_private=random.choice([True, False, False, False]),  # 25% private
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 365))
            )
            db.add(guild)
            guilds.append(guild)

        db.commit()
        print(f"✅ Created {len(guilds)} guilds")

        # Create 50+ projects
        print("\n🚀 Creating 50+ projects...")
        projects = []
        for i in range(55):
            template = random.choice(PROJECT_TEMPLATES)
            project = Project(
                title=f"{template['title']} #{i+1}",
                description=template["description"],
                status=random.choice(["active", "active", "active", "completed", "archived"]),
                budget=template["budget"] + random.randint(-50000, 100000),
                deadline=datetime.utcnow() + timedelta(days=random.randint(7, 120)),
                owner_id=random.choice(users).id,
                guild_id=random.choice(guilds).id if random.choice([True, False]) else None,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90))
            )
            db.add(project)
            projects.append(project)

        db.commit()
        print(f"✅ Created {len(projects)} projects")

        # Create 50+ orders
        print("\n💳 Creating 50+ orders with payments...")
        orders = []
        for i in range(60):
            product = random.choice(products)
            buyer = random.choice(users)
            seller_user = db.query(User).filter(User.id == product.seller_id).first()

            if not seller_user:
                continue

            order_cost = product.price
            service_fee = order_cost * 0.05
            total = order_cost + service_fee

            order_status = random.choice([
                "pending", "paid", "paid", "processing",
                "completed", "completed", "completed", "completed"
            ])

            order = Order(
                order_number=f"ORD{100000 + i}",
                buyer_id=buyer.id,
                seller_id=seller_user.id,
                product_id=product.id,
                item_name=product.name,
                item_description=product.description,
                item_cost=order_cost,
                service_fee=service_fee,
                total_amount=total,
                status=order_status,
                payment_method=random.choice(["card", "bank_transfer", "mobile_money"]),
                payment_provider=random.choice(["paystack", "stripe"]),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                completed_at=datetime.utcnow() - timedelta(days=random.randint(0, 30)) if order_status == "completed" else None
            )
            db.add(order)
            orders.append(order)

            # Create payment for non-pending orders
            if order_status != "pending":
                payment = Payment(
                    order_id=order.id,
                    user_id=buyer.id,
                    reference=f"REF{random.randint(100000, 999999)}",
                    amount=total,
                    currency=random.choice(["NGN", "USD", "GHS", "KES"]),
                    payment_method=order.payment_method,
                    payment_provider=order.payment_provider,
                    provider_reference=f"PAY{random.randint(100000, 999999)}",
                    status="success" if order_status in ["completed", "processing"] else "pending",
                    created_at=order.created_at,
                    completed_at=order.created_at + timedelta(minutes=5) if order_status in ["completed", "processing"] else None
                )
                db.add(payment)

        db.commit()
        print(f"✅ Created {len(orders)} orders with payments")

        # Create posts
        print("\n📝 Creating guild posts...")
        post_count = 0
        for i in range(100):
            post = Post(
                title=f"Post about {random.choice(['development', 'design', 'marketing', 'sales', 'strategy'])} #{i}",
                content=f"This is an interesting post about various topics. Content {i}.",
                author_id=random.choice(users).id,
                guild_id=random.choice(guilds).id,
                is_pinned=random.choice([True, False, False, False, False]),
                likes_count=random.randint(0, 150),
                comments_count=random.randint(0, 50),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90))
            )
            db.add(post)
            post_count += 1

        db.commit()
        print(f"✅ Created {post_count} posts")

        # Create messages
        print("\n💬 Creating direct messages...")
        message_count = 0
        for i in range(80):
            sender = random.choice(users)
            recipient = random.choice([u for u in users if u.id != sender.id])

            message = Message(
                content=random.choice([
                    "Hi! I'm interested in your product.",
                    "Can we discuss the project details?",
                    "Is this still available?",
                    "Great work on the project!",
                    "Let's collaborate on this.",
                    "Thank you for the purchase!",
                    "When can you deliver?",
                    "I'd like to join your guild.",
                ]),
                sender_id=sender.id,
                recipient_id=recipient.id,
                is_read=random.choice([True, False, False]),
                created_at=datetime.utcnow() - timedelta(hours=random.randint(1, 168))
            )
            db.add(message)
            message_count += 1

        db.commit()
        print(f"✅ Created {message_count} messages")

        # Create tasks for projects
        print("\n✓ Creating project tasks...")
        task_count = 0
        for project in projects[:30]:  # Add tasks to first 30 projects
            num_tasks = random.randint(3, 10)
            for j in range(num_tasks):
                task = Task(
                    title=f"Task {j+1} for {project.title}",
                    description=f"Complete this important task for the project",
                    status=random.choice(["pending", "in_progress", "completed", "completed"]),
                    priority=random.choice(["low", "medium", "high"]),
                    assignee_id=random.choice(users).id if random.choice([True, False]) else None,
                    project_id=project.id,
                    created_at=project.created_at + timedelta(days=random.randint(0, 10))
                )
                db.add(task)
                task_count += 1

        db.commit()
        print(f"✅ Created {task_count} tasks")

        # Create wallet transactions
        print("\n💸 Creating wallet transactions...")
        transaction_count = 0
        wallets = db.query(Wallet).all()
        for wallet in wallets[:40]:  # Add transactions for first 40 wallets
            num_transactions = random.randint(2, 8)
            for _ in range(num_transactions):
                trans_type = random.choice(["credit", "debit", "credit"])
                amount = random.uniform(1000, 50000)

                transaction = WalletTransaction(
                    wallet_id=wallet.id,
                    transaction_type=trans_type,
                    amount=amount,
                    description=random.choice([
                        "Payment received from order",
                        "Withdrawal to bank account",
                        "Refund processed",
                        "Service fee",
                        "Bonus credit",
                    ]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 60))
                )
                db.add(transaction)
                transaction_count += 1

        db.commit()
        print(f"✅ Created {transaction_count} wallet transactions")

        # Final summary
        print("\n" + "="*60)
        print("🎉 COMPREHENSIVE SEEDING COMPLETED!")
        print("="*60)
        print(f"👥 Users: {db.query(User).count()}")
        print(f"💰 Wallets: {db.query(Wallet).count()}")
        print(f"🛍️ Products: {db.query(Product).count()}")
        print(f"🏰 Guilds: {db.query(Guild).count()}")
        print(f"🚀 Projects: {db.query(Project).count()}")
        print(f"✓ Tasks: {db.query(Task).count()}")
        print(f"💳 Orders: {db.query(Order).count()}")
        print(f"💵 Payments: {db.query(Payment).count()}")
        print(f"📝 Posts: {db.query(Post).count()}")
        print(f"💬 Messages: {db.query(Message).count()}")
        print(f"💸 Wallet Transactions: {db.query(WalletTransaction).count()}")
        print("="*60)
        print("✨ Your database is now populated with realistic sample data!")

    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_comprehensive()
