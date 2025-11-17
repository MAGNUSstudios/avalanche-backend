"""
Stripe Connect Integration for Seller Payouts
Handles Stripe Connect account creation and payout processing
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import stripe
from stripe import StripeError
import os
from typing import Optional

from database import get_db, User, SellerPaymentInfo, Wallet, WalletTransaction, WithdrawalRequest
from schemas import UserResponse
from auth import get_current_user

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

router = APIRouter(
    prefix="/stripe-connect",
    tags=["Stripe Connect"],
)


@router.post("/create-account")
async def create_connect_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Connect Express account for the seller
    """
    try:
        # Check if user already has a Stripe account
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        if payment_info and payment_info.stripe_account_id:
            # Account already exists, create account link for re-onboarding
            account_link = stripe.AccountLink.create(
                account=payment_info.stripe_account_id,
                refresh_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/wallet?setup=refresh",
                return_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/wallet?setup=complete",
                type="account_onboarding",
            )

            return {
                "account_id": payment_info.stripe_account_id,
                "onboarding_url": account_link.url,
                "existing_account": True
            }

        # Create new Stripe Connect Express account
        account = stripe.Account.create(
            type="express",
            country="US",  # You can make this dynamic based on user's country
            email=current_user.email,
            capabilities={
                "transfers": {"requested": True},
            },
            business_type="individual",
        )

        # Create account link for onboarding
        account_link = stripe.AccountLink.create(
            account=account.id,
            refresh_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/wallet?setup=refresh",
            return_url=os.getenv("FRONTEND_URL", "http://localhost:5173") + "/wallet?setup=complete",
            type="account_onboarding",
        )

        # Save Stripe account ID to database
        if not payment_info:
            payment_info = SellerPaymentInfo(
                user_id=current_user.id,
                payment_method="stripe_connect",
                stripe_account_id=account.id
            )
            db.add(payment_info)
        else:
            payment_info.stripe_account_id = account.id
            payment_info.payment_method = "stripe_connect"

        db.commit()

        return {
            "account_id": account.id,
            "onboarding_url": account_link.url,
            "existing_account": False
        }

    except StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating Connect account: {str(e)}"
        )


@router.get("/account-status")
async def get_account_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check the status of user's Stripe Connect account
    """
    try:
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        if not payment_info or not payment_info.stripe_account_id:
            return {
                "connected": False,
                "details_submitted": False,
                "charges_enabled": False,
                "payouts_enabled": False
            }

        # Retrieve account from Stripe
        try:
            account = stripe.Account.retrieve(payment_info.stripe_account_id)

            return {
                "connected": True,
                "account_id": account.id,
                "details_submitted": account.details_submitted,
                "charges_enabled": account.charges_enabled,
                "payouts_enabled": account.payouts_enabled,
                "requirements": {
                    "currently_due": account.requirements.currently_due if account.requirements else [],
                    "eventually_due": account.requirements.eventually_due if account.requirements else [],
                    "past_due": account.requirements.past_due if account.requirements else [],
                }
            }
        except StripeError as stripe_err:
            # If Stripe account doesn't exist or is invalid, return not connected
            print(f"Stripe error retrieving account: {str(stripe_err)}")
            return {
                "connected": False,
                "details_submitted": False,
                "charges_enabled": False,
                "payouts_enabled": False
            }

    except Exception as e:
        # Return default status instead of error
        print(f"Error checking Stripe account status: {str(e)}")
        return {
            "connected": False,
            "details_submitted": False,
            "charges_enabled": False,
            "payouts_enabled": False
        }


@router.post("/process-withdrawal/{withdrawal_id}")
async def process_withdrawal(
    withdrawal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process a withdrawal request via Stripe Connect payout
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

        # Get Stripe account
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        if not payment_info or not payment_info.stripe_account_id:
            raise HTTPException(
                status_code=400,
                detail="Stripe Connect account not set up. Please connect your account first."
            )

        # Verify account is ready for payouts
        account = stripe.Account.retrieve(payment_info.stripe_account_id)
        if not account.payouts_enabled:
            raise HTTPException(
                status_code=400,
                detail="Stripe account not ready for payouts. Please complete onboarding."
            )

        # Check wallet balance
        if wallet.balance < withdrawal.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")

        # Create Stripe payout (transfer to connected account)
        # Convert amount to cents for Stripe
        amount_cents = int(withdrawal.amount * 100)

        payout = stripe.Transfer.create(
            amount=amount_cents,
            currency="usd",
            destination=payment_info.stripe_account_id,
            description=f"Withdrawal for user {current_user.id}",
        )

        # Deduct from wallet balance
        wallet.balance -= withdrawal.amount

        # Create withdrawal transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="withdrawal",
            amount=-withdrawal.amount,  # Negative for withdrawal
            description=f"Withdrawal to Stripe account",
            related_order_id=None
        )
        db.add(transaction)

        # Update withdrawal request
        withdrawal.status = "completed"
        withdrawal.stripe_transfer_id = payout.id

        db.commit()

        return {
            "success": True,
            "transfer_id": payout.id,
            "amount": withdrawal.amount,
            "new_balance": wallet.balance
        }

    except stripe.error.StripeError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing withdrawal: {str(e)}"
        )


@router.post("/dashboard-link")
async def create_dashboard_link(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a login link to Stripe Express Dashboard
    """
    try:
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        if not payment_info or not payment_info.stripe_account_id:
            raise HTTPException(
                status_code=400,
                detail="No Stripe Connect account found"
            )

        # Create login link
        login_link = stripe.Account.create_login_link(
            payment_info.stripe_account_id
        )

        return {
            "url": login_link.url
        }

    except StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
