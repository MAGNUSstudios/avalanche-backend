"""
Migrate admin users from User table to Admin table
"""
from database import SessionLocal, User, Admin, Base, engine
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def migrate_admin_users():
    # Create Admin table
    Base.metadata.create_all(bind=engine)
    print("✓ Admin table created")

    db = SessionLocal()

    try:
        # Find all users with admin role
        admin_users = db.query(User).filter(User.role == 'admin').all()

        print(f"\nFound {len(admin_users)} admin user(s) to migrate:")

        for user in admin_users:
            # Check if admin already exists
            existing_admin = db.query(Admin).filter(Admin.email == user.email).first()

            if existing_admin:
                print(f"  ⚠ Admin already exists: {user.email}")
                continue

            # Create new admin record
            new_admin = Admin(
                email=user.email,
                username=user.username or user.email.split('@')[0],
                first_name=user.first_name,
                last_name=user.last_name,
                hashed_password=user.hashed_password,
                avatar_url=user.avatar_url,
                is_active=user.is_active,
                created_at=user.created_at
            )

            db.add(new_admin)
            print(f"  ✓ Migrated admin: {user.email}")

            # Delete from users table
            db.delete(user)
            print(f"  ✓ Removed from users table: {user.email}")

        db.commit()
        print("\n✓ Migration completed successfully!")

    except Exception as e:
        print(f"\n✗ Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("=" * 50)
    print("Admin User Migration Script")
    print("=" * 50)
    migrate_admin_users()
