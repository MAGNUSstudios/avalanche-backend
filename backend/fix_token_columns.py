"""
Fix missing token tracking columns in users table
"""

import sqlite3
from datetime import datetime

DB_PATH = "avalanche.db"

def fix_columns():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    print("🔍 Checking existing columns...")
    cursor.execute("PRAGMA table_info(users)")
    existing_columns = [row[1] for row in cursor.fetchall()]
    print(f"   Existing columns: {existing_columns}")

    # Add ai_tokens_reset_at if missing
    if 'ai_tokens_reset_at' not in existing_columns:
        print("\n➕ Adding ai_tokens_reset_at column...")
        try:
            cursor.execute("""
                ALTER TABLE users
                ADD COLUMN ai_tokens_reset_at DATETIME
            """)
            # Set default value for existing rows
            cursor.execute("""
                UPDATE users
                SET ai_tokens_reset_at = datetime('now')
                WHERE ai_tokens_reset_at IS NULL
            """)
            conn.commit()
            print("   ✅ Added ai_tokens_reset_at column")
        except Exception as e:
            print(f"   ❌ Error adding ai_tokens_reset_at: {e}")
            conn.rollback()
    else:
        print("\n✓ ai_tokens_reset_at already exists")

    # Add ai_requests_reset_at if missing
    if 'ai_requests_reset_at' not in existing_columns:
        print("\n➕ Adding ai_requests_reset_at column...")
        try:
            cursor.execute("""
                ALTER TABLE users
                ADD COLUMN ai_requests_reset_at DATETIME
            """)
            # Set default value for existing rows
            cursor.execute("""
                UPDATE users
                SET ai_requests_reset_at = datetime('now')
                WHERE ai_requests_reset_at IS NULL
            """)
            conn.commit()
            print("   ✅ Added ai_requests_reset_at column")
        except Exception as e:
            print(f"   ❌ Error adding ai_requests_reset_at: {e}")
            conn.rollback()
    else:
        print("\n✓ ai_requests_reset_at already exists")

    # Add plan_selected if missing
    if 'plan_selected' not in existing_columns:
        print("\n➕ Adding plan_selected column...")
        try:
            cursor.execute("""
                ALTER TABLE users
                ADD COLUMN plan_selected BOOLEAN DEFAULT 0
            """)
            conn.commit()
            print("   ✅ Added plan_selected column")
        except Exception as e:
            print(f"   ❌ Error adding plan_selected: {e}")
            conn.rollback()
    else:
        print("\n✓ plan_selected already exists")

    # Verify all columns exist now
    print("\n🔍 Verifying columns after migration...")
    cursor.execute("PRAGMA table_info(users)")
    final_columns = [row[1] for row in cursor.fetchall()]

    required_columns = ['ai_tokens_reset_at', 'ai_requests_reset_at', 'plan_selected']
    missing = [col for col in required_columns if col not in final_columns]

    if missing:
        print(f"\n❌ Still missing columns: {missing}")
    else:
        print("\n✅ All required columns exist!")

    conn.close()

if __name__ == "__main__":
    print("Starting database migration...\n")
    fix_columns()
    print("\n✅ Migration complete!")
