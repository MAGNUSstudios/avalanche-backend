"""
Add rules column to guilds table
"""

import sqlite3

def migrate():
    conn = sqlite3.connect('avalanche.db')
    cursor = conn.cursor()
    
    try:
        # Add rules column
        cursor.execute('ALTER TABLE guilds ADD COLUMN rules TEXT')
        conn.commit()
        print("✅ Successfully added rules column to guilds table")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            print("⚠️ rules column already exists")
        else:
            print(f"❌ Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
