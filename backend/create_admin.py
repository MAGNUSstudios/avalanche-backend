#!/usr/bin/env python3
"""
Create an admin user for the Avalanche platform
"""

from database import SessionLocal, Admin, init_db
from auth import get_password_hash
from datetime import datetime

def create_admin():
    """Create a default admin user"""
    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(Admin).filter(Admin.email == "admin@avalanche.com").first()

        if existing_admin:
            print("✅ Admin user already exists!")
            print(f"📧 Email: admin@avalanche.com")
            print(f"👤 Username: {existing_admin.username}")
            return

        # Create new admin
        admin = Admin(
            username="admin",
            email="admin@avalanche.com",
            hashed_password=get_password_hash("admin123"),
            is_super_admin=True,
            created_at=datetime.utcnow(),
            last_login=None
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("\n" + "="*60)
        print("✅ Admin user created successfully!")
        print("="*60)
        print(f"\n📧 Email: admin@avalanche.com")
        print(f"🔑 Password: admin123")
        print(f"👤 Username: admin")
        print(f"\n🔗 Login at: https://avalanche-frontend-indol.vercel.app/admin/login")
        print("\n⚠️  IMPORTANT: Change the password after first login!")
        print("="*60 + "\n")

    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n🔧 Initializing database...")
    init_db()
    print("✅ Database initialized\n")
    create_admin()
