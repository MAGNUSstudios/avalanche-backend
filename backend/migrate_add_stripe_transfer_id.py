"""
Migration script to add stripe_transfer_id column to withdrawal_requests table
Run this script to update the database schema
"""

from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./avalanche.db")

def run_migration():
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        try:
            # Check if column already exists
            result = conn.execute(text("PRAGMA table_info(withdrawal_requests)"))
            columns = [row[1] for row in result]

            if 'stripe_transfer_id' not in columns:
                print("Adding stripe_transfer_id column to withdrawal_requests table...")
                conn.execute(text(
                    "ALTER TABLE withdrawal_requests ADD COLUMN stripe_transfer_id VARCHAR"
                ))
                conn.commit()
                print("✓ Migration completed successfully!")
            else:
                print("✓ Column stripe_transfer_id already exists. No migration needed.")

        except Exception as e:
            print(f"✗ Migration failed: {str(e)}")
            conn.rollback()
            raise

if __name__ == "__main__":
    run_migration()
