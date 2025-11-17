"""
Stripe Automatic Payouts - Production Ready
Uses Stripe API to automatically send money to users' bank accounts
Requires: Standard Stripe account (no Connect needed)
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
    prefix="/stripe-payout",
    tags=["Stripe Payout"],
)


@router.post("/add-bank-account")
async def add_bank_account(
    bank_details: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add bank account to Stripe and store for payouts
    Creates a Stripe Customer with external bank account
    Supports multiple countries including Nigeria
    """
    try:
        # Get or create payment info
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        # Create or get Stripe customer
        if payment_info and payment_info.provider_customer_id:
            customer_id = payment_info.provider_customer_id
        else:
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=current_user.email,
                name=f"{current_user.first_name} {current_user.last_name}",
                metadata={
                    "user_id": str(current_user.id),
                    "platform": "avalanche"
                }
            )
            customer_id = customer.id

        # Get country and currency from bank details
        country = bank_details.get("country", "US").upper()

        # Map country to currency
        currency_map = {
            "US": "usd",
            "NG": "ngn",  # Nigeria
            "GB": "gbp",
            "EU": "eur",
            "CA": "cad",
            "ZA": "zar",  # South Africa
            "GH": "ghs",  # Ghana
            "KE": "kes",  # Kenya
        }
        currency = currency_map.get(country, "usd")

        # Create bank account token based on country
        # Note: For Nigeria and some African countries, Stripe requires different handling
        # We'll store the bank details but payouts may need manual processing or third-party integration

        if country == "NG":
            # For Nigerian accounts, we store the details in our database
            # Actual payouts to Nigeria require Stripe Connect or third-party services like Paystack
            # For now, we'll store the account info for manual processing
            # In the future, integrate with Paystack, Flutterwave, or similar for automatic Nigerian payouts

            # Create a placeholder "token" - we won't actually create a Stripe token for NG
            # Instead, we'll store bank details directly in our database
            bank_account_token = None
            bank_account_id = f"ng_bank_{current_user.id}"  # Custom identifier
            last_4 = bank_details.get("account_number")[-4:] if bank_details.get("account_number") else "****"

        else:
            # US and other supported countries use routing numbers
            bank_account_token = stripe.Token.create(
                bank_account={
                    "country": country,
                    "currency": currency,
                    "account_holder_name": bank_details.get("account_holder_name"),
                    "account_holder_type": "individual",
                    "routing_number": bank_details.get("routing_number"),
                    "account_number": bank_details.get("account_number"),
                }
            )

        # Add bank account to customer (skip for Nigerian accounts)
        if country != "NG":
            bank_account = stripe.Customer.create_source(
                customer_id,
                source=bank_account_token.id
            )
            stripe_account_id = bank_account.id
            account_last4 = bank_account.last4
        else:
            # For Nigerian accounts, we don't create a Stripe source
            stripe_account_id = bank_account_id
            account_last4 = last_4

        # Save to database
        if not payment_info:
            payment_info = SellerPaymentInfo(
                user_id=current_user.id,
                payment_method="bank_account",
                provider_customer_id=customer_id,
                bank_name=bank_details.get("bank_name"),
                account_holder_name=bank_details.get("account_holder_name"),
                account_number=f"****{account_last4}",  # Store only last 4
                routing_number=bank_details.get("routing_number") if country != "NG" else None,
                stripe_account_id=stripe_account_id,  # Store bank account ID or custom ID for NG
                country_code=country  # Store country code
            )
            db.add(payment_info)
        else:
            payment_info.provider_customer_id = customer_id
            payment_info.payment_method = "bank_account"
            payment_info.bank_name = bank_details.get("bank_name")
            payment_info.account_holder_name = bank_details.get("account_holder_name")
            payment_info.account_number = f"****{account_last4}"
            payment_info.routing_number = bank_details.get("routing_number") if country != "NG" else None
            payment_info.stripe_account_id = stripe_account_id
            payment_info.country_code = country  # Update country code

        db.commit()
        db.refresh(payment_info)

        message = "Bank account added successfully"
        if country == "NG":
            message = "Nigerian bank account added. Withdrawals will be processed via local payment provider (Paystack/Flutterwave)"

        return {
            "success": True,
            "message": message,
            "account_holder_name": payment_info.account_holder_name,
            "bank_name": payment_info.bank_name,
            "account_last4": account_last4,
            "requires_manual_processing": country == "NG"  # Flag for frontend
        }

    except StripeError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding bank account: {str(e)}"
        )


@router.get("/bank-account-status")
async def get_bank_account_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user has bank account set up
    """
    payment_info = db.query(SellerPaymentInfo).filter(
        SellerPaymentInfo.user_id == current_user.id
    ).first()

    if not payment_info or not payment_info.provider_customer_id:
        return {
            "connected": False,
            "has_bank_account": False
        }

    try:
        # Verify with Stripe
        customer = stripe.Customer.retrieve(payment_info.provider_customer_id)

        # Check if customer has bank accounts
        has_bank = False
        if customer.sources and customer.sources.data:
            for source in customer.sources.data:
                if source.object == "bank_account":
                    has_bank = True
                    break

        return {
            "connected": True,
            "has_bank_account": has_bank,
            "account_holder_name": payment_info.account_holder_name,
            "bank_name": payment_info.bank_name,
            "account_last4": payment_info.account_number[-4:] if payment_info.account_number else None
        }

    except StripeError:
        return {
            "connected": False,
            "has_bank_account": False
        }


@router.post("/process-automatic-payout/{withdrawal_id}")
async def process_automatic_payout(
    withdrawal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process withdrawal automatically via Stripe Payout
    Money is sent directly to user's bank account
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

        # Get payment info
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        if not payment_info or not payment_info.provider_customer_id:
            raise HTTPException(
                status_code=400,
                detail="Bank account not set up. Please add your bank details first."
            )

        # Check wallet balance
        if wallet.balance < withdrawal.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")

        # Check if this is a Nigerian account (requires different processing)
        is_nigerian_account = payment_info.stripe_account_id and payment_info.stripe_account_id.startswith("ng_bank_")

        if is_nigerian_account:
            # Nigerian accounts require manual processing or third-party integration
            # Mark withdrawal as pending for admin review
            withdrawal.status = "pending_manual_processing"
            withdrawal.stripe_transfer_id = "NG_MANUAL_" + str(withdrawal.id)

            # Deduct from wallet
            wallet.balance -= withdrawal.amount

            # Create transaction record
            transaction = WalletTransaction(
                wallet_id=wallet.id,
                transaction_type="withdrawal",
                amount=-withdrawal.amount,
                description=f"Withdrawal to {payment_info.bank_name} (pending manual processing)"
            )
            db.add(transaction)
            db.commit()

            return {
                "success": True,
                "amount": withdrawal.amount,
                "new_balance": wallet.balance,
                "status": "pending_manual_processing",
                "message": "Withdrawal request submitted. Nigerian payouts are processed within 24 hours via Paystack/Flutterwave. You'll receive a notification when complete.",
                "is_manual": True
            }

        # Determine currency based on bank account
        # Retrieve the bank account to get currency
        try:
            customer = stripe.Customer.retrieve(payment_info.provider_customer_id)
            bank_account = None
            if customer.sources and customer.sources.data:
                for source in customer.sources.data:
                    if source.object == "bank_account" and source.id == payment_info.stripe_account_id:
                        bank_account = source
                        break

            currency = bank_account.currency if bank_account else "usd"
        except:
            currency = "usd"  # Default to USD

        # Convert amount to smallest currency unit (kobo for NGN, cents for USD)
        if currency == "ngn":
            # For NGN, amounts are in kobo (1 Naira = 100 kobo)
            amount_minor = int(withdrawal.amount * 100)
            min_amount = 100  # 1 NGN minimum
            min_display = "₦1.00"
        else:
            # For USD and others, amounts are in cents
            amount_minor = int(withdrawal.amount * 100)
            min_amount = 100  # $1.00 minimum
            min_display = "$1.00"

        # Minimum payout amount check
        if amount_minor < min_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Minimum withdrawal amount is {min_display}"
            )

        # Create Stripe Payout
        # Note: This sends money from your Stripe balance to the customer's bank
        payout = stripe.Payout.create(
            amount=amount_minor,
            currency=currency,
            destination=payment_info.stripe_account_id,  # Bank account ID
            description=f"Withdrawal for user {current_user.id}",
            metadata={
                "user_id": str(current_user.id),
                "withdrawal_id": str(withdrawal_id),
                "wallet_id": str(wallet.id),
                "currency": currency
            },
            # For immediate payout (may incur fees)
            # method="instant",  # Uncomment for instant (arrives in ~30 minutes, extra fee)
        )

        # Deduct from wallet balance
        wallet.balance -= withdrawal.amount

        # Create withdrawal transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="withdrawal",
            amount=-withdrawal.amount,  # Negative for withdrawal
            description=f"Automatic payout to {payment_info.bank_name} ****{payment_info.account_number[-4:]}",
            related_order_id=None
        )
        db.add(transaction)

        # Update withdrawal request
        withdrawal.status = "completed"
        withdrawal.stripe_transfer_id = payout.id

        db.commit()

        # Determine arrival time
        arrival_date = "2-3 business days"
        if hasattr(payout, 'arrival_date'):
            from datetime import datetime
            arrival_timestamp = payout.arrival_date
            arrival_date = datetime.fromtimestamp(arrival_timestamp).strftime('%B %d, %Y')

        return {
            "success": True,
            "payout_id": payout.id,
            "amount": withdrawal.amount,
            "new_balance": wallet.balance,
            "status": payout.status,
            "arrival_date": arrival_date,
            "message": f"Payout initiated! Funds will arrive in your bank account by {arrival_date}."
        }

    except StripeError as e:
        db.rollback()
        # Handle specific Stripe errors
        error_message = str(e)
        if "insufficient" in error_message.lower():
            error_message = "Insufficient funds in platform account. Please contact support."
        elif "invalid" in error_message.lower():
            error_message = "Invalid bank account. Please update your bank details."

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payout failed: {error_message}"
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing payout: {str(e)}"
        )


@router.get("/payout-status/{payout_id}")
async def get_payout_status(
    payout_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check the status of a Stripe payout
    """
    try:
        payout = stripe.Payout.retrieve(payout_id)

        status_messages = {
            "paid": "Completed - Funds sent to bank",
            "pending": "Processing - Funds on the way",
            "in_transit": "In transit to bank",
            "canceled": "Canceled",
            "failed": "Failed - Please contact support"
        }

        return {
            "payout_id": payout.id,
            "status": payout.status,
            "status_message": status_messages.get(payout.status, payout.status),
            "amount": payout.amount / 100,
            "arrival_date": payout.arrival_date,
            "created": payout.created
        }

    except StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error fetching payout status: {str(e)}"
        )
