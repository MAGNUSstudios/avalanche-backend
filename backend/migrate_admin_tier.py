"""
Migration script to add AI tier fields to Admin table
"""

from sqlalchemy import create_engine, text
from database import DATABASE_URL
import os

def migrate():
    engine = create_engine(DATABASE_URL)

    with engine.connect() as conn:
        # Add ai_tier column to admins table
        try:
            conn.execute(text('ALTER TABLE admins ADD COLUMN ai_tier VARCHAR DEFAULT "admin"'))
            conn.commit()
            print('✅ Added ai_tier column to admins table')
        except Exception as e:
            print(f'⚠️  ai_tier column: {e}')

        # Add plan_selected column to admins table
        try:
            conn.execute(text('ALTER TABLE admins ADD COLUMN plan_selected BOOLEAN DEFAULT 1'))
            conn.commit()
            print('✅ Added plan_selected column to admins table')
        except Exception as e:
            print(f'⚠️  plan_selected column: {e}')

        # Update existing admins
        try:
            result = conn.execute(text('UPDATE admins SET ai_tier = "admin", plan_selected = 1'))
            conn.commit()
            print(f'✅ Updated {result.rowcount} existing admins with admin tier')
        except Exception as e:
            print(f'⚠️  Error updating admins: {e}')

if __name__ == "__main__":
    migrate()
    print("\n✅ Migration completed!")
