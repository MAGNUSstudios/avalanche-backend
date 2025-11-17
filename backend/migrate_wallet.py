import sqlite3

def migrate_wallet_tables():
    """
    Creates the wallets, wallet_transactions, and withdrawal_requests tables
    in the avalanche.db SQLite database.
    """
    db_path = 'avalanche.db'
    print(f"Connecting to database at {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    print("Connection successful.")

    try:
        # Wallets Table
        print("Creating 'wallets' table if it doesn't exist...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wallets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                balance REAL NOT NULL DEFAULT 0.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            );
        """)
        print("'wallets' table created or already exists.")

        # Wallet Transactions Table
        print("Creating 'wallet_transactions' table if it doesn't exist...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wallet_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet_id INTEGER NOT NULL,
                transaction_type TEXT NOT NULL,
                amount REAL NOT NULL,
                description TEXT,
                related_order_id INTEGER,
                related_project_id INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (wallet_id) REFERENCES wallets (id),
                FOREIGN KEY (related_order_id) REFERENCES orders (id),
                FOREIGN KEY (related_project_id) REFERENCES projects (id)
            );
        """)
        print("'wallet_transactions' table created or already exists.")

        # Withdrawal Requests Table
        print("Creating 'withdrawal_requests' table if it doesn't exist...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS withdrawal_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                wallet_id INTEGER NOT NULL,
                amount REAL NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                payout_method TEXT NOT NULL,
                payout_details TEXT NOT NULL, -- Storing as JSON string
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (wallet_id) REFERENCES wallets (id)
            );
        """)
        print("'withdrawal_requests' table created or already exists.")

        # Also, let's create a wallet for every existing user
        print("Checking for existing users without wallets...")
        cursor.execute("SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM wallets)")
        users_without_wallets = cursor.fetchall()

        if users_without_wallets:
            print(f"Found {len(users_without_wallets)} users without wallets. Creating wallets for them...")
            for user_row in users_without_wallets:
                user_id = user_row[0]
                cursor.execute("INSERT INTO wallets (user_id, balance) VALUES (?, ?)", (user_id, 0.0))
                print(f"Created wallet for user_id: {user_id}")
        else:
            print("All existing users already have a wallet.")

        conn.commit()
        print("Database migration successful!")

    except sqlite3.Error as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        print("Closing database connection.")
        conn.close()

if __name__ == "__main__":
    migrate_wallet_tables()
