"""
Migration script to add parent_id column to comments table for nested replies
"""
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./avalanche.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

def migrate():
    with engine.connect() as conn:
        # Add parent_id column to comments table
        try:
            conn.execute(text("ALTER TABLE comments ADD COLUMN parent_id INTEGER REFERENCES comments(id)"))
            conn.commit()
            print("✅ Added parent_id column to comments table")
        except Exception as e:
            print(f"⚠️  parent_id column might already exist: {e}")

if __name__ == "__main__":
    print("Starting migration...")
    migrate()
    print("Migration complete!")
