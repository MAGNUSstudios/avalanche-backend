"""
Quick script to create a test user with wallet balance for testing withdrawals
Run with: python create_test_user_with_balance.py
"""

from sqlalchemy.orm import Session
from database import SessionLocal, User, Wallet, WalletTransaction
from auth import get_password_hash
from datetime import datetime

def create_test_user():
    db = SessionLocal()

    try:
        # Check if test user already exists
        existing_user = db.query(User).filter(User.email == "test@example.com").first()

        if existing_user:
            print(f"✓ Test user already exists: test@example.com")
            print(f"  User ID: {existing_user.id}")

            # Check wallet
            wallet = db.query(Wallet).filter(Wallet.user_id == existing_user.id).first()
            if wallet:
                print(f"  Current balance: ${wallet.balance:.2f}")

                # Add $100 for testing
                wallet.balance += 100.0
                transaction = WalletTransaction(
                    wallet_id=wallet.id,
                    transaction_type="deposit",
                    amount=100.0,
                    description="Test funds for withdrawal testing"
                )
                db.add(transaction)
                db.commit()
                print(f"  Added $100.00 for testing")
                print(f"  New balance: ${wallet.balance:.2f}")

            return existing_user

        # Create new test user
        test_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            first_name="Test",
            last_name="User",
            country="US",
            username="testuser"
        )

        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        print(f"✓ Created test user:")
        print(f"  Email: test@example.com")
        print(f"  Password: password123")
        print(f"  User ID: {test_user.id}")

        # Create wallet with $500 balance
        wallet = Wallet(
            user_id=test_user.id,
            balance=500.0
        )
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

        # Add initial transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="deposit",
            amount=500.0,
            description="Initial test funds"
        )
        db.add(transaction)
        db.commit()

        print(f"  Wallet balance: $500.00")
        print(f"\n✓ You can now login with:")
        print(f"  Email: test@example.com")
        print(f"  Password: password123")
        print(f"\n✓ Ready to test withdrawals!")

        return test_user

    except Exception as e:
        print(f"✗ Error: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Creating test user with wallet balance...\n")
    create_test_user()
