"""
Migration script to add image_url column to comments table
"""
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./avalanche.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

def migrate():
    with engine.connect() as conn:
        # Add image_url column to comments table
        try:
            conn.execute(text("ALTER TABLE comments ADD COLUMN image_url TEXT"))
            conn.commit()
            print("✅ Added image_url column to comments table")
        except Exception as e:
            print(f"⚠️  image_url column might already exist: {e}")

if __name__ == "__main__":
    print("Starting migration...")
    migrate()
    print("Migration complete!")
