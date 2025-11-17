"""
Seed script to populate the database with 50 guilds across different categories
"""
from database import SessionLocal, User, Guild, init_db
from auth import get_password_hash
from datetime import datetime
import random

# Initialize database
init_db()

# Guild data across different categories
guilds_data = [
    # Technology (10)
    {"name": "Code Ninjas", "description": "Elite developers building the future", "category": "Technology"},
    {"name": "AI Innovators Hub", "description": "Exploring artificial intelligence and machine learning", "category": "Technology"},
    {"name": "Blockchain Builders", "description": "Decentralized solutions for African markets", "category": "Technology"},
    {"name": "Web3 Africa", "description": "Pioneering blockchain technology across Africa", "category": "Technology"},
    {"name": "Mobile First Developers", "description": "Creating mobile apps for African users", "category": "Technology"},
    {"name": "DevOps Masters", "description": "Cloud infrastructure and automation experts", "category": "Technology"},
    {"name": "Cybersecurity Squad", "description": "Protecting digital assets and privacy", "category": "Technology"},
    {"name": "Data Science Collective", "description": "Turning data into actionable insights", "category": "Technology"},
    {"name": "IoT Innovators", "description": "Internet of Things for smart cities", "category": "Technology"},
    {"name": "Tech Entrepreneurs", "description": "Building tech startups that scale", "category": "Technology"},
    
    # Design (10)
    {"name": "Design Innovators", "description": "Creative minds shaping visual experiences", "category": "Design"},
    {"name": "UI/UX Collective", "description": "Crafting delightful user experiences", "category": "Design"},
    {"name": "Brand Wizards", "description": "Building memorable brand identities", "category": "Design"},
    {"name": "Motion Graphics Pro", "description": "Bringing designs to life with animation", "category": "Design"},
    {"name": "African Aesthetics", "description": "Celebrating African design heritage", "category": "Design"},
    {"name": "3D Artists Guild", "description": "Creating stunning 3D visualizations", "category": "Design"},
    {"name": "Typography Lovers", "description": "Mastering the art of letterforms", "category": "Design"},
    {"name": "Color Theory Masters", "description": "Understanding and applying color psychology", "category": "Design"},
    {"name": "Product Designers", "description": "Designing products that solve real problems", "category": "Design"},
    {"name": "Illustration Collective", "description": "Visual storytellers and illustrators", "category": "Design"},
    
    # Business (10)
    {"name": "Startup Accelerators", "description": "Fast-tracking business growth", "category": "Business"},
    {"name": "E-Commerce Empire", "description": "Building online retail success stories", "category": "Business"},
    {"name": "Marketing Mavericks", "description": "Growth hackers and digital marketers", "category": "Business"},
    {"name": "Finance Gurus", "description": "Financial planning and wealth building", "category": "Business"},
    {"name": "Social Enterprise Hub", "description": "Business for social impact", "category": "Business"},
    {"name": "Agribusiness Network", "description": "Modernizing agriculture in Africa", "category": "Business"},
    {"name": "Real Estate Investors", "description": "Property development and investment", "category": "Business"},
    {"name": "Export Champions", "description": "Taking African products global", "category": "Business"},
    {"name": "Franchise Builders", "description": "Scaling businesses through franchising", "category": "Business"},
    {"name": "Business Analytics", "description": "Data-driven business decisions", "category": "Business"},
    
    # Education (8)
    {"name": "EdTech Pioneers", "description": "Revolutionizing education with technology", "category": "Education"},
    {"name": "STEM Champions", "description": "Promoting science and technology education", "category": "Education"},
    {"name": "Language Learners", "description": "Multilingual community of learners", "category": "Education"},
    {"name": "Skill Shapers", "description": "Vocational training and skill development", "category": "Education"},
    {"name": "Academic Excellence", "description": "Supporting students to achieve their best", "category": "Education"},
    {"name": "Coding for Kids", "description": "Teaching programming to young minds", "category": "Education"},
    {"name": "Scholarship Network", "description": "Connecting students with opportunities", "category": "Education"},
    {"name": "Lifelong Learners", "description": "Continuous learning and development", "category": "Education"},
    
    # Health & Wellness (6)
    {"name": "HealthTech Innovators", "description": "Digital health solutions for Africa", "category": "Health"},
    {"name": "Fitness Warriors", "description": "Building healthier communities", "category": "Health"},
    {"name": "Mental Health Advocates", "description": "Breaking stigma and promoting wellness", "category": "Health"},
    {"name": "Nutrition Network", "description": "Healthy eating and lifestyle choices", "category": "Health"},
    {"name": "Telemedicine Guild", "description": "Remote healthcare delivery", "category": "Health"},
    {"name": "Wellness Coaches", "description": "Holistic health and wellbeing", "category": "Health"},
    
    # Creative Arts (6)
    {"name": "Music Producers Guild", "description": "Creating the sound of Africa", "category": "Arts"},
    {"name": "Film & Video Collective", "description": "African storytelling through film", "category": "Arts"},
    {"name": "Writers Circle", "description": "Authors and content creators", "category": "Arts"},
    {"name": "Photography Masters", "description": "Capturing Africa's beauty", "category": "Arts"},
    {"name": "Theater & Performance", "description": "Live performance and drama", "category": "Arts"},
    {"name": "Digital Art Community", "description": "NFTs and digital creativity", "category": "Arts"},
]

def create_seed_user(db):
    """Create a seed user to own the guilds"""
    existing_user = db.query(User).filter(User.email == "admin@avalanche.com").first()
    if existing_user:
        return existing_user
    
    seed_user = User(
        email="admin@avalanche.com",
        username="avalanche_admin",
        first_name="Avalanche",
        last_name="Admin",
        country="Kenya",
        hashed_password=get_password_hash("admin123"),
        bio="Platform administrator and guild creator"
    )
    db.add(seed_user)
    db.commit()
    db.refresh(seed_user)
    return seed_user

def seed_guilds():
    """Populate database with guilds"""
    db = SessionLocal()
    
    try:
        print("🌱 Starting guild seeding process...")
        
        # Create or get seed user
        print("👤 Creating admin user...")
        admin_user = create_seed_user(db)
        print(f"✅ Admin user created/found: {admin_user.email}")
        
        # Check existing guilds
        existing_count = db.query(Guild).count()
        print(f"📊 Existing guilds in database: {existing_count}")
        
        # Create guilds
        created_count = 0
        for guild_data in guilds_data:
            # Check if guild already exists
            existing_guild = db.query(Guild).filter(Guild.name == guild_data["name"]).first()
            if existing_guild:
                print(f"⏭️  Skipping '{guild_data['name']}' - already exists")
                continue
            
            # Create new guild
            new_guild = Guild(
                name=guild_data["name"],
                description=guild_data["description"],
                category=guild_data["category"],
                is_private=False,
                member_count=1,  # Owner is the first member (real count, no fake data)
                owner_id=admin_user.id,
                created_at=datetime.utcnow()
            )
            
            db.add(new_guild)
            created_count += 1
            print(f"✅ Created guild: {guild_data['name']} ({guild_data['category']})")
        
        db.commit()
        
        # Final stats
        total_guilds = db.query(Guild).count()
        print("\n" + "="*50)
        print(f"🎉 Guild seeding completed!")
        print(f"📊 Guilds created: {created_count}")
        print(f"📊 Total guilds in database: {total_guilds}")
        print("="*50)
        
        # Show category breakdown
        print("\n📋 Guilds by category:")
        categories = db.query(Guild.category).distinct().all()
        for (category,) in categories:
            count = db.query(Guild).filter(Guild.category == category).count()
            print(f"   • {category}: {count} guilds")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_guilds()
