#!/usr/bin/env python3
"""
Migration script to add post_likes and comments tables
"""
from database import engine, Base, Post, Comment, post_likes
from sqlalchemy import inspect

def migrate():
    """Create new tables if they don't exist"""
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    print("Existing tables:", existing_tables)
    
    # Create all tables (will only create missing ones)
    Base.metadata.create_all(bind=engine)
    
    print("\nMigration complete!")
    print("Created tables:")
    print("- post_likes (if not exists)")
    print("- comments (if not exists)")

if __name__ == "__main__":
    migrate()
