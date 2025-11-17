#!/usr/bin/env python3
"""
Script to create an admin user
Usage: python create_admin.py
"""

from database import SessionLocal, User, init_db
from auth import get_password_hash

def create_admin():
    """Create an admin user"""
    # Initialize database
    init_db()
    
    # Admin credentials
    admin_email = "admin@avalanche.com"
    admin_password = "admin123"
    
    db = SessionLocal()
    
    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"Admin user already exists: {admin_email}")
            # Update role to admin if it's not
            if existing_admin.role != "admin":
                existing_admin.role = "admin"
                db.commit()
                print(f"Updated {admin_email} role to admin")
            return
        
        # Create admin user
        admin_user = User(
            email=admin_email,
            username="admin",
            first_name="Admin",
            last_name="User",
            country="USA",
            hashed_password=get_password_hash(admin_password),
            role="admin",
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("=" * 50)
        print("Admin user created successfully!")
        print("=" * 50)
        print(f"Email: {admin_email}")
        print(f"Password: {admin_password}")
        print("=" * 50)
        print("⚠️  Please change the password after first login!")
        print("=" * 50)
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
