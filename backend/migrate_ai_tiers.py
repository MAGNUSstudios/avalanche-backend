"""
Migration script to add AI tier fields to users table
"""
import sqlite3
from datetime import datetime

def migrate():
    conn = sqlite3.connect('avalanche.db')
    cursor = conn.cursor()

    try:
        # Add ai_tier column
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN ai_tier TEXT DEFAULT 'free'
        """)
        print("✓ Added ai_tier column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("✓ ai_tier column already exists")
        else:
            raise

    try:
        # Add ai_tier_expires_at column
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN ai_tier_expires_at TIMESTAMP NULL
        """)
        print("✓ Added ai_tier_expires_at column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("✓ ai_tier_expires_at column already exists")
        else:
            raise

    try:
        # Add ai_requests_used column
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN ai_requests_used INTEGER DEFAULT 0
        """)
        print("✓ Added ai_requests_used column")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("✓ ai_requests_used column already exists")
        else:
            raise

    try:
        # Add ai_requests_reset_at column
        cursor.execute("""
            ALTER TABLE users
            ADD COLUMN ai_requests_reset_at TIMESTAMP NULL
        """)
        print("✓ Added ai_requests_reset_at column")

        # Set default value for existing rows
        cursor.execute("""
            UPDATE users
            SET ai_requests_reset_at = CURRENT_TIMESTAMP
            WHERE ai_requests_reset_at IS NULL
        """)
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("✓ ai_requests_reset_at column already exists")
        else:
            raise

    # Update existing users to have 'free' tier
    cursor.execute("""
        UPDATE users
        SET ai_tier = 'free'
        WHERE ai_tier IS NULL
    """)

    conn.commit()
    print("\n✅ Migration completed successfully!")
    print(f"Updated {cursor.rowcount} users to 'free' tier")

    conn.close()

if __name__ == "__main__":
    migrate()
