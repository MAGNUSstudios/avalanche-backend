#!/usr/bin/env python3
"""
Migration script to add project escrow workflow fields
"""
from sqlalchemy import text
from database import SessionLocal, engine

def migrate():
    """Add new columns for project escrow workflow"""
    db = SessionLocal()

    try:
        print("🔄 Starting project escrow migration...")

        # Add new columns to projects table
        # SQLite doesn't support IF NOT EXISTS, so we'll handle errors
        migrations = [
            ("freelancer_id", "ALTER TABLE projects ADD COLUMN freelancer_id INTEGER REFERENCES users(id)"),
            ("workflow_status", "ALTER TABLE projects ADD COLUMN workflow_status VARCHAR DEFAULT 'posted'"),
            ("agreed_price", "ALTER TABLE projects ADD COLUMN agreed_price FLOAT"),
            ("subscription_paid", "ALTER TABLE projects ADD COLUMN subscription_paid BOOLEAN DEFAULT FALSE"),
            ("subscription_payment_ref", "ALTER TABLE projects ADD COLUMN subscription_payment_ref VARCHAR"),
            ("escrow_funded", "ALTER TABLE projects ADD COLUMN escrow_funded BOOLEAN DEFAULT FALSE"),
            ("escrow_amount", "ALTER TABLE projects ADD COLUMN escrow_amount FLOAT"),
            ("escrow_funded_at", "ALTER TABLE projects ADD COLUMN escrow_funded_at TIMESTAMP"),
            ("completed_at", "ALTER TABLE projects ADD COLUMN completed_at TIMESTAMP"),
            ("payment_released_at", "ALTER TABLE projects ADD COLUMN payment_released_at TIMESTAMP"),
        ]

        for column_name, migration_sql in migrations:
            try:
                db.execute(text(migration_sql))
                print(f"✅ Added column: {column_name}")
            except Exception as e:
                if "duplicate column" in str(e).lower():
                    print(f"⏭️  Column '{column_name}' already exists, skipping...")
                else:
                    print(f"⚠️  Warning for '{column_name}': {e}")

        db.commit()
        print("\n✅ Migration completed successfully!")
        print("\nNew project workflow enabled:")
        print("  1. Poster posts job ($25 subscription)")
        print("  2. Freelancer accepts job")
        print("  3. They negotiate price in DM")
        print("  4. AI prompts poster to move money to escrow")
        print("  5. AI notifies freelancer that money is in escrow")
        print("  6. Freelancer completes work")
        print("  7. Escrow releases payment to freelancer wallet")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
