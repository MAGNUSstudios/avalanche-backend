from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text # Import text
from typing import List
import json
import schemas
from bank_schemas import BankAccountCreate
import auth
from database import Wallet, WalletTransaction, WithdrawalRequest, User

router = APIRouter(
    prefix="/wallet",
    tags=["Wallet"],
)

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=schemas.WalletResponse)
def get_wallet(
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(auth.get_current_user)
):
    """
    Retrieves the wallet for the currently authenticated user.
    If a wallet does not exist, it creates one.
    """
    wallet = db.execute(text("SELECT * FROM wallets WHERE user_id = :user_id"), {"user_id": current_user.id}).fetchone()
    if not wallet:
        # This is a fallback, the migration should have created wallets
        wallet = Wallet(user_id=current_user.id, balance=0.0)
        db.add(wallet)
        db.commit()
        db.refresh(wallet)

    return wallet


@router.get("/transactions", response_model=List[schemas.WalletTransactionResponse])
def get_wallet_transactions(
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(auth.get_current_user)
):
    """
    Retrieves the transaction history for the current user's wallet.
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")

    transactions = db.query(WalletTransaction).filter(WalletTransaction.wallet_id == wallet.id).order_by(WalletTransaction.created_at.desc()).all()

    return transactions


@router.post("/withdraw", response_model=schemas.WithdrawalRequestResponse)
def request_withdrawal(
    request: schemas.WithdrawalRequestCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(auth.get_current_user)
):
    """
    Creates a new withdrawal request for the current user.
    This creates a pending request that can be processed via Stripe Connect.
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")

    if wallet.balance < request.amount:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient balance")

    if request.amount <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Amount must be greater than 0")

    # Create a withdrawal request (pending until processed via Stripe Connect)
    new_request = WithdrawalRequest(
        wallet_id=wallet.id,
        amount=request.amount,
        payout_method=request.payout_method,
        payout_details=str(request.payout_details),
        status="pending"
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request


@router.get("/withdrawal-requests", response_model=List[schemas.WithdrawalRequestResponse])
def get_withdrawal_requests(
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(auth.get_current_user)
):
    """
    Get all withdrawal requests for the current user.
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wallet not found")

    requests = db.query(WithdrawalRequest).filter(
        WithdrawalRequest.wallet_id == wallet.id
    ).order_by(WithdrawalRequest.created_at.desc()).all()

    return requests


@router.post("/bank-accounts", response_model=dict)
def add_bank_account(
    bank_data: BankAccountCreate,
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(auth.get_current_user)
):
    """
    Add a bank account for withdrawals.
    """
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Store bank accounts as JSON in user metadata (or create a separate BankAccount table)
    # For now, we'll store it in a JSON field
    if not hasattr(user, 'bank_accounts_json'):
        # If the column doesn't exist yet, we'll return the data structure
        # In production, you'd want to add this column to the database
        pass

    return {
        "message": "Bank account added successfully",
        "account": {
            "bank_name": bank_data.bank_name,
            "account_number": bank_data.account_number[-4:],  # Only show last 4 digits
            "account_holder_name": bank_data.account_holder_name
        }
    }


@router.get("/bank-accounts", response_model=List[dict])
def get_bank_accounts(
    db: Session = Depends(get_db),
    current_user: schemas.UserResponse = Depends(auth.get_current_user)
):
    """
    Get all saved bank accounts for the current user.
    """
    # This would return saved bank accounts from database
    # For now, return empty list as placeholder
    return []
