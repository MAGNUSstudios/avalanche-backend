"""
Simple Payout System (Alternative to Stripe Connect)
For development/testing without Stripe Connect enabled
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db, User, SellerPaymentInfo, Wallet, WalletTransaction, WithdrawalRequest
from schemas import UserResponse
from auth import get_current_user

router = APIRouter(
    prefix="/simple-payout",
    tags=["Simple Payout"],
)


@router.post("/setup-bank-account")
async def setup_bank_account(
    bank_details: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Store bank account details for payouts (without Stripe Connect)
    In production, these should be encrypted
    """
    try:
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        if not payment_info:
            payment_info = SellerPaymentInfo(
                user_id=current_user.id,
                payment_method="bank_account",
                bank_name=bank_details.get("bank_name"),
                account_number=bank_details.get("account_number"),  # Should be encrypted
                account_holder_name=bank_details.get("account_holder_name"),
                routing_number=bank_details.get("routing_number")
            )
            db.add(payment_info)
        else:
            payment_info.payment_method = "bank_account"
            payment_info.bank_name = bank_details.get("bank_name")
            payment_info.account_number = bank_details.get("account_number")
            payment_info.account_holder_name = bank_details.get("account_holder_name")
            payment_info.routing_number = bank_details.get("routing_number")

        db.commit()
        db.refresh(payment_info)

        return {
            "success": True,
            "message": "Bank account details saved",
            "account_holder_name": payment_info.account_holder_name,
            "bank_name": payment_info.bank_name,
            "account_number_last4": payment_info.account_number[-4:] if payment_info.account_number else None
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving bank details: {str(e)}"
        )


@router.get("/bank-account-status")
async def get_bank_account_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user has bank account on file
    """
    payment_info = db.query(SellerPaymentInfo).filter(
        SellerPaymentInfo.user_id == current_user.id
    ).first()

    if not payment_info or not payment_info.account_number:
        return {
            "connected": False,
            "has_bank_account": False
        }

    return {
        "connected": True,
        "has_bank_account": True,
        "account_holder_name": payment_info.account_holder_name,
        "bank_name": payment_info.bank_name,
        "account_number_last4": payment_info.account_number[-4:] if payment_info.account_number else None
    }


@router.post("/process-simple-withdrawal/{withdrawal_id}")
async def process_simple_withdrawal(
    withdrawal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process withdrawal (marks as pending for manual processing)
    In production, this would integrate with your actual payment processor
    """
    try:
        # Get withdrawal request
        withdrawal = db.query(WithdrawalRequest).filter(
            WithdrawalRequest.id == withdrawal_id
        ).first()

        if not withdrawal:
            raise HTTPException(status_code=404, detail="Withdrawal request not found")

        # Get wallet to verify ownership
        wallet = db.query(Wallet).filter(Wallet.id == withdrawal.wallet_id).first()
        if not wallet or wallet.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")

        # Check if already processed
        if withdrawal.status == "completed":
            raise HTTPException(status_code=400, detail="Withdrawal already processed")

        # Get bank account info
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        if not payment_info or not payment_info.account_number:
            raise HTTPException(
                status_code=400,
                detail="Bank account not set up. Please add your bank details first."
            )

        # Check wallet balance
        if wallet.balance < withdrawal.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")

        # Deduct from wallet balance
        wallet.balance -= withdrawal.amount

        # Create withdrawal transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="withdrawal",
            amount=-withdrawal.amount,  # Negative for withdrawal
            description=f"Withdrawal to {payment_info.bank_name} ****{payment_info.account_number[-4:]}",
            related_order_id=None
        )
        db.add(transaction)

        # Mark withdrawal as pending (or completed for testing)
        withdrawal.status = "completed"  # Change to "pending" if you want manual approval

        db.commit()

        return {
            "success": True,
            "withdrawal_id": withdrawal.id,
            "amount": withdrawal.amount,
            "new_balance": wallet.balance,
            "status": withdrawal.status,
            "message": "Withdrawal processed. Funds will arrive in 2-3 business days."
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing withdrawal: {str(e)}"
        )


@router.get("/withdrawal-history")
async def get_withdrawal_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's withdrawal history
    """
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        return []

    withdrawals = db.query(WithdrawalRequest).filter(
        WithdrawalRequest.wallet_id == wallet.id
    ).order_by(WithdrawalRequest.created_at.desc()).all()

    return withdrawals
