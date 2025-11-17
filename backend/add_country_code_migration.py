"""
Migration script to add country_code column to seller_payment_info table
Run with: python add_country_code_migration.py
"""

from sqlalchemy import create_engine, text
from database import DATABASE_URL
import os

def run_migration():
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        try:
            # Check if column already exists (SQLite specific)
            result = conn.execute(text("PRAGMA table_info(seller_payment_info)"))
            columns = [row[1] for row in result.fetchall()]

            if 'country_code' in columns:
                print("✓ Column 'country_code' already exists in seller_payment_info table")
                return

            # Add the country_code column
            conn.execute(text("""
                ALTER TABLE seller_payment_info
                ADD COLUMN country_code VARCHAR
            """))
            conn.commit()

            print("✓ Successfully added 'country_code' column to seller_payment_info table")

        except Exception as e:
            print(f"✗ Migration failed: {str(e)}")
            conn.rollback()
            raise

if __name__ == "__main__":
    print("Running migration to add country_code column...")
    run_migration()
    print("Migration complete!")
