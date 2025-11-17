"""
Migration script to add work_submissions table
Run this after updating database.py with WorkSubmission model
"""

from database import engine, Base, WorkSubmission
from sqlalchemy import inspect

def migrate():
    """Create work_submissions table if it doesn't exist"""

    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()

    if 'work_submissions' not in existing_tables:
        print("Creating work_submissions table...")
        WorkSubmission.__table__.create(engine)
        print("✓ work_submissions table created successfully")
    else:
        print("work_submissions table already exists")

if __name__ == "__main__":
    migrate()
    print("\nMigration completed!")
