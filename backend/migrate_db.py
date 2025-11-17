"""
Database migration script to update schema with new columns
"""
from database import engine, Base
import sqlite3

def migrate_database():
    """Add new columns to existing tables"""
    print("🔄 Starting database migration...")
    
    # Connect to SQLite database
    conn = sqlite3.connect('avalanche.db')
    cursor = conn.cursor()
    
    try:
        # Add username column to users table if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN username VARCHAR")
            print("✅ Added 'username' column to users table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⏭️  Column 'username' already exists")
            else:
                raise
        
        # Add avatar_url column to users table if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN avatar_url VARCHAR")
            print("✅ Added 'avatar_url' column to users table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⏭️  Column 'avatar_url' already exists")
            else:
                raise
        
        # Add bio column to users table if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN bio TEXT")
            print("✅ Added 'bio' column to users table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⏭️  Column 'bio' already exists")
            else:
                raise
        
        # Add role column to users table if it doesn't exist
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user'")
            print("✅ Added 'role' column to users table")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("⏭️  Column 'role' already exists")
            else:
                raise
        
        conn.commit()
        print("✅ Database migration completed successfully!")
        
        # Create new tables if they don't exist
        print("\n🔄 Creating new tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created/verified!")
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
