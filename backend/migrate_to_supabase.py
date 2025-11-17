"""
Supabase Migration Script
Migrates SQLite database to Supabase PostgreSQL
"""

import os
import sqlite3
import psycopg2
from psycopg2.extras import execute_values
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")  # Your Supabase database URL
SQLITE_DB_PATH = "avalanche.db"

# Table schemas for Supabase (PostgreSQL)
TABLE_SCHEMAS = {
    "users": """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(100) UNIQUE,
            full_name VARCHAR(255),
            hashed_password VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            is_admin BOOLEAN DEFAULT FALSE,
            ai_tier VARCHAR(50) DEFAULT 'free',
            country_code VARCHAR(10),
            phone_number VARCHAR(20),
            bio TEXT,
            avatar_url VARCHAR(500),
            website VARCHAR(255),
            github_username VARCHAR(100),
            linkedin_url VARCHAR(255),
            skills TEXT[],
            interests TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "guilds": """
        CREATE TABLE IF NOT EXISTS guilds (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            owner_id INTEGER REFERENCES users(id),
            avatar_url VARCHAR(500),
            banner_url VARCHAR(500),
            member_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            rules TEXT,
            category VARCHAR(100),
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "guild_members": """
        CREATE TABLE IF NOT EXISTS guild_members (
            id SERIAL PRIMARY KEY,
            guild_id INTEGER REFERENCES guilds(id),
            user_id INTEGER REFERENCES users(id),
            role VARCHAR(50) DEFAULT 'member',
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(guild_id, user_id)
        );
    """,
    "projects": """
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            owner_id INTEGER REFERENCES users(id),
            budget DECIMAL(10,2),
            deadline DATE,
            status VARCHAR(50) DEFAULT 'open',
            workflow_status VARCHAR(50) DEFAULT 'draft',
            category VARCHAR(100),
            tags TEXT[],
            requirements TEXT,
            deliverables TEXT,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "project_members": """
        CREATE TABLE IF NOT EXISTS project_members (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id),
            user_id INTEGER REFERENCES users(id),
            role VARCHAR(50) DEFAULT 'collaborator',
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(project_id, user_id)
        );
    """,
    "products": """
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            seller_id INTEGER REFERENCES users(id),
            category VARCHAR(100),
            stock INTEGER DEFAULT 0,
            images TEXT[],
            tags TEXT[],
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "orders": """
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            buyer_id INTEGER REFERENCES users(id),
            total_amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            stripe_payment_intent_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "order_items": """
        CREATE TABLE IF NOT EXISTS order_items (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id),
            product_id INTEGER REFERENCES products(id),
            quantity INTEGER NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "escrows": """
        CREATE TABLE IF NOT EXISTS escrows (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id),
            amount DECIMAL(10,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'held',
            stripe_transfer_id VARCHAR(255),
            released_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "payments": """
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER REFERENCES orders(id),
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'usd',
            status VARCHAR(50) DEFAULT 'pending',
            stripe_payment_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "wallets": """
        CREATE TABLE IF NOT EXISTS wallets (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) UNIQUE,
            balance DECIMAL(15,2) DEFAULT 0.00,
            currency VARCHAR(10) DEFAULT 'usd',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "wallet_transactions": """
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            id SERIAL PRIMARY KEY,
            wallet_id INTEGER REFERENCES wallets(id),
            amount DECIMAL(15,2) NOT NULL,
            transaction_type VARCHAR(50) NOT NULL,
            description TEXT,
            reference_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "withdrawal_requests": """
        CREATE TABLE IF NOT EXISTS withdrawal_requests (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            amount DECIMAL(15,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            stripe_account_id VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            processed_at TIMESTAMP WITH TIME ZONE
        );
    """,
    "messages": """
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            sender_id INTEGER REFERENCES users(id),
            recipient_id INTEGER REFERENCES users(id),
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "posts": """
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            author_id INTEGER REFERENCES users(id),
            title VARCHAR(255),
            content TEXT NOT NULL,
            category VARCHAR(100),
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "comments": """
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id),
            author_id INTEGER REFERENCES users(id),
            content TEXT NOT NULL,
            parent_id INTEGER REFERENCES comments(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "post_likes": """
        CREATE TABLE IF NOT EXISTS post_likes (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id),
            user_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(post_id, user_id)
        );
    """,
    "post_unlikes": """
        CREATE TABLE IF NOT EXISTS post_unlikes (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id),
            user_id INTEGER REFERENCES users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(post_id, user_id)
        );
    """,
    "guild_chats": """
        CREATE TABLE IF NOT EXISTS guild_chats (
            id SERIAL PRIMARY KEY,
            guild_id INTEGER REFERENCES guilds(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "guild_chat_messages": """
        CREATE TABLE IF NOT EXISTS guild_chat_messages (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER REFERENCES guild_chats(id),
            user_id INTEGER REFERENCES users(id),
            content TEXT NOT NULL,
            message_type VARCHAR(50) DEFAULT 'text',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "project_chats": """
        CREATE TABLE IF NOT EXISTS project_chats (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "project_chat_messages": """
        CREATE TABLE IF NOT EXISTS project_chat_messages (
            id SERIAL PRIMARY KEY,
            chat_id INTEGER REFERENCES project_chats(id),
            user_id INTEGER REFERENCES users(id),
            content TEXT NOT NULL,
            message_type VARCHAR(50) DEFAULT 'text',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "tasks": """
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            assignee_id INTEGER REFERENCES users(id),
            status VARCHAR(50) DEFAULT 'todo',
            priority VARCHAR(20) DEFAULT 'medium',
            due_date DATE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "work_submissions": """
        CREATE TABLE IF NOT EXISTS work_submissions (
            id SERIAL PRIMARY KEY,
            project_id INTEGER REFERENCES projects(id),
            user_id INTEGER REFERENCES users(id),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            files TEXT[],
            status VARCHAR(50) DEFAULT 'submitted',
            submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            reviewed_at TIMESTAMP WITH TIME ZONE
        );
    """,
    "admins": """
        CREATE TABLE IF NOT EXISTS admins (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) UNIQUE,
            tier VARCHAR(50) DEFAULT 'standard',
            permissions TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "ai_conversations": """
        CREATE TABLE IF NOT EXISTS ai_conversations (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            title VARCHAR(255),
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "ai_interactions": """
        CREATE TABLE IF NOT EXISTS ai_interactions (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER REFERENCES ai_conversations(id),
            user_message TEXT,
            ai_response TEXT,
            tokens_used INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """,
    "product_keywords": """
        CREATE TABLE IF NOT EXISTS product_keywords (
            id SERIAL PRIMARY KEY,
            product_id INTEGER REFERENCES products(id),
            keyword VARCHAR(100) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """
}

def get_sqlite_data(table_name):
    """Extract data from SQLite table"""
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    try:
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        columns = [desc[0] for desc in cursor.description]
        return columns, rows
    except Exception as e:
        logger.error(f"Error reading {table_name} from SQLite: {e}")
        return [], []
    finally:
        conn.close()

def create_supabase_connection():
    """Create connection to Supabase PostgreSQL"""
    if not SUPABASE_DB_URL:
        raise ValueError("SUPABASE_DB_URL environment variable not set")

    return psycopg2.connect(SUPABASE_DB_URL)

def create_tables(conn):
    """Create all tables in Supabase"""
    logger.info("Creating tables in Supabase...")

    with conn.cursor() as cursor:
        for table_name, schema in TABLE_SCHEMAS.items():
            try:
                cursor.execute(schema)
                logger.info(f"Created table: {table_name}")
            except Exception as e:
                logger.error(f"Error creating table {table_name}: {e}")
                conn.rollback()
                raise

    conn.commit()
    logger.info("All tables created successfully")

def migrate_table_data(conn, table_name, sqlite_columns, sqlite_rows):
    """Migrate data from SQLite to Supabase for a specific table"""
    if not sqlite_rows:
        logger.info(f"No data to migrate for {table_name}")
        return

    logger.info(f"Migrating {len(sqlite_rows)} rows for {table_name}")

    # Convert SQLite rows to list of tuples
    data = []
    for row in sqlite_rows:
        row_data = []
        for col in sqlite_columns:
            value = row[col]

            # Handle special data types
            if table_name in ['users', 'guilds', 'projects', 'products'] and col in ['skills', 'interests', 'tags']:
                # Convert comma-separated strings to PostgreSQL arrays
                if value and isinstance(value, str):
                    value = [tag.strip() for tag in value.split(',') if tag.strip()]
                else:
                    value = []
            elif table_name in ['products'] and col == 'images':
                # Handle JSON arrays
                if value and isinstance(value, str):
                    try:
                        import json
                        value = json.loads(value)
                    except:
                        value = []
                else:
                    value = []

            row_data.append(value)
        data.append(tuple(row_data))

    # Insert data into Supabase
    with conn.cursor() as cursor:
        try:
            # Create INSERT statement
            columns_str = ', '.join(sqlite_columns)
            placeholders = ', '.join(['%s'] * len(sqlite_columns))
            insert_query = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders})"

            # Execute batch insert
            execute_values(cursor, insert_query, data)
            logger.info(f"Successfully migrated {len(data)} rows to {table_name}")

        except Exception as e:
            logger.error(f"Error migrating {table_name}: {e}")
            # Log first few rows for debugging
            logger.error(f"Sample data: {data[:2] if data else 'No data'}")
            conn.rollback()
            raise

def migrate_data(conn):
    """Migrate all data from SQLite to Supabase"""
    logger.info("Starting data migration...")

    # Define migration order (respecting foreign key constraints)
    migration_order = [
        'users', 'guilds', 'guild_members', 'projects', 'project_members',
        'products', 'orders', 'order_items', 'escrows', 'payments',
        'wallets', 'wallet_transactions', 'withdrawal_requests',
        'messages', 'posts', 'comments', 'post_likes', 'post_unlikes',
        'guild_chats', 'guild_chat_messages', 'project_chats', 'project_chat_messages',
        'tasks', 'work_submissions', 'admins', 'ai_conversations', 'ai_interactions',
        'product_keywords'
    ]

    for table_name in migration_order:
        try:
            columns, rows = get_sqlite_data(table_name)
            if columns:
                migrate_table_data(conn, table_name, columns, rows)
            else:
                logger.warning(f"No columns found for {table_name}, skipping")
        except Exception as e:
            logger.error(f"Failed to migrate {table_name}: {e}")
            continue

    conn.commit()
    logger.info("Data migration completed")

def create_indexes(conn):
    """Create indexes for better performance"""
    logger.info("Creating indexes...")

    indexes = [
        "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);",
        "CREATE INDEX IF NOT EXISTS idx_users_ai_tier ON users(ai_tier);",
        "CREATE INDEX IF NOT EXISTS idx_guilds_owner_id ON guilds(owner_id);",
        "CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);",
        "CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);",
        "CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);",
        "CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);",
        "CREATE INDEX IF NOT EXISTS idx_escrows_order_id ON escrows(order_id);",
        "CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);",
    ]

    with conn.cursor() as cursor:
        for index_sql in indexes:
            try:
                cursor.execute(index_sql)
                logger.info(f"Created index: {index_sql.split('ON')[1].split('(')[0].strip()}")
            except Exception as e:
                logger.error(f"Error creating index: {e}")

    conn.commit()
    logger.info("Indexes created successfully")

def verify_migration(conn):
    """Verify that migration was successful"""
    logger.info("Verifying migration...")

    verification_queries = {
        'users': "SELECT COUNT(*) FROM users",
        'guilds': "SELECT COUNT(*) FROM guilds",
        'projects': "SELECT COUNT(*) FROM projects",
        'products': "SELECT COUNT(*) FROM products",
        'orders': "SELECT COUNT(*) FROM orders",
        'wallets': "SELECT SUM(balance) FROM wallets"
    }

    with conn.cursor() as cursor:
        for table, query in verification_queries.items():
            try:
                cursor.execute(query)
                result = cursor.fetchone()[0]
                logger.info(f"{table}: {result} records")
            except Exception as e:
                logger.error(f"Error verifying {table}: {e}")

def main():
    """Main migration function"""
    if not SUPABASE_DB_URL:
        logger.error("SUPABASE_DB_URL environment variable is required")
        logger.info("Please set SUPABASE_DB_URL in your .env file")
        logger.info("You can find this URL in your Supabase project dashboard under Settings > Database")
        return

    logger.info("Starting migration from SQLite to Supabase...")
    logger.info(f"Source: {SQLITE_DB_PATH}")
    logger.info(f"Target: Supabase PostgreSQL")

    try:
        # Create Supabase connection
        conn = create_supabase_connection()
        logger.info("Connected to Supabase successfully")

        # Create tables
        create_tables(conn)

        # Migrate data
        migrate_data(conn)

        # Create indexes
        create_indexes(conn)

        # Verify migration
        verify_migration(conn)

        logger.info("✅ Migration completed successfully!")
        logger.info("You can now update your DATABASE_URL to use Supabase")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    main()
