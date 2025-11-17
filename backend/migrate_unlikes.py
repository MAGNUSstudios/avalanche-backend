"""
Migration script to add unlikes_count column to posts table and create post_unlikes table
"""
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./avalanche.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})

def migrate():
    with engine.connect() as conn:
        # Add unlikes_count column to posts table
        try:
            conn.execute(text("ALTER TABLE posts ADD COLUMN unlikes_count INTEGER DEFAULT 0"))
            conn.commit()
            print("✅ Added unlikes_count column to posts table")
        except Exception as e:
            print(f"⚠️  unlikes_count column might already exist: {e}")

        # Create post_unlikes table
        try:
            conn.execute(text("""
                CREATE TABLE post_unlikes (
                    user_id INTEGER NOT NULL,
                    post_id INTEGER NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, post_id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (post_id) REFERENCES posts(id)
                )
            """))
            conn.commit()
            print("✅ Created post_unlikes table")
        except Exception as e:
            print(f"⚠️  post_unlikes table might already exist: {e}")

if __name__ == "__main__":
    print("Starting migration...")
    migrate()
    print("Migration complete!")
