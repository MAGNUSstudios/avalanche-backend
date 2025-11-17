"""
Paystack Integration for African Bank Payouts
Supports: Nigeria (NGN), Ghana (GHS), South Africa (ZAR), Kenya (KES)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
from typing import Optional
from paystackapi.paystack import Paystack
from paystackapi.transfer import Transfer
from paystackapi.trecipient import TransferRecipient

from database import get_db, User, SellerPaymentInfo, Wallet, WalletTransaction, WithdrawalRequest
from auth import get_current_user

# Initialize Paystack
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
paystack = Paystack(secret_key=PAYSTACK_SECRET_KEY)

router = APIRouter(
    prefix="/paystack-payout",
    tags=["Paystack Payout"],
)

# Supported African countries
PAYSTACK_COUNTRIES = {
    "NG": {"name": "Nigeria", "currency": "NGN", "bank_code_required": True},
    "GH": {"name": "Ghana", "currency": "GHS", "bank_code_required": True},
    "ZA": {"name": "South Africa", "currency": "ZAR", "bank_code_required": True},
    "KE": {"name": "Kenya", "currency": "KES", "bank_code_required": True},
}

# Nigerian Bank Codes (most common)
NIGERIAN_BANK_CODES = {
    "Access Bank": "044",
    "Citibank": "023",
    "Diamond Bank": "063",
    "Ecobank Nigeria": "050",
    "Fidelity Bank": "070",
    "First Bank of Nigeria": "011",
    "First City Monument Bank": "214",
    "Guaranty Trust Bank": "058",
    "Heritage Bank": "030",
    "Keystone Bank": "082",
    "Polaris Bank": "076",
    "Providus Bank": "101",
    "Stanbic IBTC Bank": "221",
    "Standard Chartered Bank": "068",
    "Sterling Bank": "232",
    "Union Bank of Nigeria": "032",
    "United Bank for Africa": "033",
    "Unity Bank": "215",
    "Wema Bank": "035",
    "Zenith Bank": "057",
    "GTBank": "058",  # Alias
    "UBA": "033",     # Alias
}


@router.post("/add-african-bank-account")
async def add_african_bank_account(
    bank_details: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add African bank account for Paystack payouts
    Supports Nigeria, Ghana, South Africa, Kenya
    """
    try:
        country = bank_details.get("country", "NG").upper()

        if country not in PAYSTACK_COUNTRIES:
            raise HTTPException(
                status_code=400,
                detail=f"Country {country} not supported by Paystack. Supported: {', '.join(PAYSTACK_COUNTRIES.keys())}"
            )

        country_info = PAYSTACK_COUNTRIES[country]
        currency = country_info["currency"]

        # Get bank code from bank name
        bank_name = bank_details.get("bank_name")
        bank_code = NIGERIAN_BANK_CODES.get(bank_name)

        if not bank_code and country == "NG":
            raise HTTPException(
                status_code=400,
                detail=f"Bank '{bank_name}' not found. Please use exact bank name (e.g., 'Access Bank', 'GTBank', 'UBA')"
            )

        # Create Paystack Transfer Recipient
        recipient_data = {
            "type": "nuban",  # Nigerian Uniform Bank Account Number
            "name": bank_details.get("account_holder_name"),
            "account_number": bank_details.get("account_number"),
            "bank_code": bank_code,
            "currency": currency,
            "metadata": {
                "user_id": str(current_user.id),
                "platform": "avalanche"
            }
        }

        # Create recipient in Paystack
        response = TransferRecipient.create(**recipient_data)

        if not response.get("status"):
            raise HTTPException(
                status_code=400,
                detail=f"Paystack error: {response.get('message', 'Failed to create recipient')}"
            )

        recipient = response["data"]
        recipient_code = recipient["recipient_code"]

        # Save to database
        payment_info = db.query(SellerPaymentInfo).filter(
            SellerPaymentInfo.user_id == current_user.id
        ).first()

        account_last4 = bank_details.get("account_number")[-4:]

        if not payment_info:
            payment_info = SellerPaymentInfo(
                user_id=current_user.id,
                payment_method="bank_account",
                bank_name=bank_name,
                account_holder_name=bank_details.get("account_holder_name"),
                account_number=f"****{account_last4}",
                country_code=country,
                stripe_account_id=recipient_code,  # Store Paystack recipient code here
                provider_customer_id="paystack"  # Mark as Paystack account
            )
            db.add(payment_info)
        else:
            payment_info.payment_method = "bank_account"
            payment_info.bank_name = bank_name
            payment_info.account_holder_name = bank_details.get("account_holder_name")
            payment_info.account_number = f"****{account_last4}"
            payment_info.country_code = country
            payment_info.stripe_account_id = recipient_code
            payment_info.provider_customer_id = "paystack"

        db.commit()
        db.refresh(payment_info)

        return {
            "success": True,
            "message": f"{country_info['name']} bank account added successfully. Automatic payouts enabled!",
            "account_holder_name": payment_info.account_holder_name,
            "bank_name": payment_info.bank_name,
            "account_last4": account_last4,
            "currency": currency,
            "country": country_info["name"]
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error adding bank account: {str(e)}"
        )


@router.post("/process-paystack-payout/{withdrawal_id}")
async def process_paystack_payout(
    withdrawal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process automatic payout via Paystack to African bank accounts
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

        if not payment_info or payment_info.provider_customer_id != "paystack":
            raise HTTPException(
                status_code=400,
                detail="Paystack bank account not set up. Please add your bank details first."
            )

        # Check wallet balance
        if wallet.balance < withdrawal.amount:
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")

        # Get country and currency
        country = payment_info.country_code or "NG"
        currency = PAYSTACK_COUNTRIES.get(country, {}).get("currency", "NGN")

        # Convert amount to kobo (Paystack uses minor currency units)
        # 1 Naira = 100 kobo, 1 Cedi = 100 pesewas, etc.
        amount_kobo = int(withdrawal.amount * 100)

        # Minimum payout check
        if amount_kobo < 100:  # Minimum 1.00 in local currency
            raise HTTPException(
                status_code=400,
                detail=f"Minimum withdrawal amount is 1.00 {currency}"
            )

        # Create Paystack Transfer
        transfer_data = {
            "source": "balance",
            "amount": amount_kobo,
            "recipient": payment_info.stripe_account_id,  # Paystack recipient code
            "reason": f"Withdrawal for user {current_user.id}",
            "currency": currency,
            "reference": f"WD_{withdrawal.id}_{current_user.id}",
        }

        response = Transfer.initiate(**transfer_data)

        if not response.get("status"):
            raise HTTPException(
                status_code=400,
                detail=f"Paystack transfer failed: {response.get('message', 'Unknown error')}"
            )

        transfer = response["data"]
        transfer_code = transfer.get("transfer_code") or transfer.get("id")

        # Deduct from wallet balance
        wallet.balance -= withdrawal.amount

        # Create withdrawal transaction
        transaction = WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="withdrawal",
            amount=-withdrawal.amount,
            description=f"Paystack payout to {payment_info.bank_name} ****{payment_info.account_number[-4:]}"
        )
        db.add(transaction)

        # Update withdrawal request
        withdrawal.status = "completed"
        withdrawal.stripe_transfer_id = str(transfer_code)

        db.commit()

        return {
            "success": True,
            "transfer_code": transfer_code,
            "amount": withdrawal.amount,
            "currency": currency,
            "new_balance": wallet.balance,
            "status": transfer.get("status", "success"),
            "message": f"Payout successful! {currency} {withdrawal.amount:.2f} sent to your {payment_info.bank_name} account. Funds will arrive within 24 hours."
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing payout: {str(e)}"
        )


@router.get("/bank-list/{country_code}")
async def get_bank_list(country_code: str):
    """
    Get list of banks for a country (currently supports Nigeria)
    """
    country_code = country_code.upper()

    if country_code == "NG":
        return {
            "country": "Nigeria",
            "currency": "NGN",
            "banks": list(NIGERIAN_BANK_CODES.keys())
        }

    return {
        "country": country_code,
        "message": "Bank list not available. Please enter your bank name manually."
    }


@router.get("/transfer-status/{transfer_code}")
async def get_transfer_status(
    transfer_code: str,
    current_user: User = Depends(get_current_user)
):
    """
    Check status of a Paystack transfer
    """
    try:
        response = Transfer.verify(id_or_code=transfer_code)

        if not response.get("status"):
            raise HTTPException(
                status_code=400,
                detail=f"Failed to get transfer status: {response.get('message')}"
            )

        transfer = response["data"]

        status_messages = {
            "success": "Completed - Funds sent to bank",
            "pending": "Processing - Transfer in progress",
            "failed": "Failed - Please contact support",
            "reversed": "Reversed - Funds returned to wallet"
        }

        return {
            "transfer_code": transfer_code,
            "status": transfer.get("status"),
            "status_message": status_messages.get(transfer.get("status"), transfer.get("status")),
            "amount": transfer.get("amount", 0) / 100,  # Convert from kobo
            "currency": transfer.get("currency"),
            "recipient": transfer.get("recipient"),
            "created_at": transfer.get("createdAt")
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking transfer status: {str(e)}"
        )
