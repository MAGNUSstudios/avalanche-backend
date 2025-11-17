"""
Migration script to add guild_chats and guild_chat_messages tables
"""

from database import engine, Base
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Create guild_chats table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS guild_chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (guild_id) REFERENCES guilds(id) ON DELETE CASCADE,
                UNIQUE(guild_id)
            )
        """))
        
        # Create guild_chat_messages table
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS guild_chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guild_chat_id INTEGER NOT NULL,
                sender_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_deleted BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (guild_chat_id) REFERENCES guild_chats(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """))
        
        conn.commit()
        print("✅ Guild chat tables created successfully!")

if __name__ == "__main__":
    migrate()
