#!/usr/bin/env python3
"""
Script to check existing database tables and their structure
"""

import sqlite3
import os

def check_database_tables():
    """Check all tables in the database"""
    db_path = "avalanche.db"
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("="*60)
    print("📊 AVALANCHE DATABASE STRUCTURE")
    print("="*60)
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = cursor.fetchall()
    
    print(f"\n📋 Total Tables: {len(tables)}\n")
    
    for (table_name,) in tables:
        print(f"\n{'='*60}")
        print(f"📄 Table: {table_name}")
        print(f"{'='*60}")
        
        # Get table structure
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        
        print("\nColumns:")
        print(f"{'ID':<5} {'Name':<25} {'Type':<15} {'NotNull':<10} {'Default':<15} {'PK':<5}")
        print("-"*80)
        
        for col in columns:
            cid, name, col_type, notnull, default_val, pk = col
            print(f"{cid:<5} {name:<25} {col_type:<15} {'Yes' if notnull else 'No':<10} {str(default_val):<15} {'Yes' if pk else 'No':<5}")
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"\n📊 Total Rows: {count}")
        
        # Get foreign keys
        cursor.execute(f"PRAGMA foreign_key_list({table_name})")
        fks = cursor.fetchall()
        if fks:
            print("\n🔗 Foreign Keys:")
            for fk in fks:
                print(f"   - {fk[3]} → {fk[2]}.{fk[4]}")
    
    print("\n" + "="*60)
    print("✅ Database check complete!")
    print("="*60)
    
    conn.close()

if __name__ == "__main__":
    check_database_tables()
