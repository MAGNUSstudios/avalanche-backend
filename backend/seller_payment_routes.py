"""
Seller Payment Info Routes
Handles seller payment information for automatic payouts
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from database import get_db, SellerPaymentInfo, User
from auth import get_current_user

router = APIRouter()


class SellerPaymentInfoCreate(BaseModel):
    payment_method: str  # "card" or "bank_account"

    # Card details
    card_holder_name: Optional[str] = None
    card_number: Optional[str] = None  # Full number (will be masked in storage)
    card_expiry: Optional[str] = None
    card_cvv: Optional[str] = None

    # Bank account details
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_holder_name: Optional[str] = None
    routing_number: Optional[str] = None


class SellerPaymentInfoResponse(BaseModel):
    id: int
    user_id: int
    payment_method: str
    card_holder_name: Optional[str] = None
    card_last_four: Optional[str] = None
    card_type: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_holder_name: Optional[str] = None
    routing_number: Optional[str] = None
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


def validate_luhn(card_number: str) -> bool:
    """Validate card number using Luhn algorithm"""
    digits = card_number.replace(" ", "").replace("-", "")

    if not digits.isdigit() or len(digits) < 13 or len(digits) > 19:
        return False

    total = 0
    is_even = False

    for i in range(len(digits) - 1, -1, -1):
        digit = int(digits[i])

        if is_even:
            digit *= 2
            if digit > 9:
                digit -= 9

        total += digit
        is_even = not is_even

    return total % 10 == 0


def detect_card_type(card_number: str) -> str:
    """Detect card type from card number"""
    card_number = card_number.replace(" ", "").replace("-", "")

    if card_number[0] == "4":
        return "visa"
    elif card_number[:2] in ["51", "52", "53", "54", "55"]:
        return "mastercard"
    elif card_number[:2] in ["34", "37"]:
        return "amex"
    elif card_number[:4] == "6011" or card_number[:2] in ["64", "65"]:
        return "discover"
    else:
        return "unknown"


@router.post("/seller/payment-info", response_model=SellerPaymentInfoResponse)
async def create_seller_payment_info(
    payment_info: SellerPaymentInfoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Save seller payment information for automatic payouts
    """

    # Check if seller already has payment info
    existing_info = db.query(SellerPaymentInfo).filter(
        SellerPaymentInfo.user_id == current_user.id
    ).first()

    if existing_info:
        raise HTTPException(
            status_code=400,
            detail="Payment information already exists. Use update endpoint to modify."
        )

    # Validate payment method
    if payment_info.payment_method not in ["card", "bank_account"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment method. Use 'card' or 'bank_account'"
        )

    # Create new payment info
    new_payment_info = SellerPaymentInfo(
        user_id=current_user.id,
        payment_method=payment_info.payment_method
    )

    # Handle card details
    if payment_info.payment_method == "card":
        if not payment_info.card_number or not payment_info.card_holder_name:
            raise HTTPException(
                status_code=400,
                detail="Card number and holder name are required for card payment method"
            )

        # Validate card number using Luhn algorithm
        if not validate_luhn(payment_info.card_number):
            raise HTTPException(
                status_code=400,
                detail="Invalid card number. Please check and try again."
            )

        # Store only last 4 digits (in production, use proper encryption/tokenization)
        card_number = payment_info.card_number.replace(" ", "").replace("-", "")
        new_payment_info.card_last_four = card_number[-4:]
        new_payment_info.card_holder_name = payment_info.card_holder_name
        new_payment_info.card_type = detect_card_type(card_number)

        # In production, you would:
        # 1. Tokenize the card with Stripe
        # 2. Store the Stripe token instead of card details
        # 3. Verify the card with a small charge

    # Handle bank account details
    elif payment_info.payment_method == "bank_account":
        if not payment_info.account_number or not payment_info.account_holder_name:
            raise HTTPException(
                status_code=400,
                detail="Account number and holder name are required for bank account payment method"
            )

        new_payment_info.bank_name = payment_info.bank_name
        new_payment_info.account_number = payment_info.account_number
        new_payment_info.account_holder_name = payment_info.account_holder_name
        new_payment_info.routing_number = payment_info.routing_number

        # In production, you would:
        # 1. Use Stripe Connect or similar to verify bank account
        # 2. Store only the verified account ID
        # 3. Perform micro-deposit verification

    db.add(new_payment_info)
    db.commit()
    db.refresh(new_payment_info)

    return new_payment_info


@router.get("/seller/payment-info", response_model=SellerPaymentInfoResponse)
async def get_seller_payment_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get seller payment information
    """
    payment_info = db.query(SellerPaymentInfo).filter(
        SellerPaymentInfo.user_id == current_user.id
    ).first()

    if not payment_info:
        raise HTTPException(
            status_code=404,
            detail="No payment information found. Please add your payment details."
        )

    return payment_info


@router.put("/seller/payment-info", response_model=SellerPaymentInfoResponse)
async def update_seller_payment_info(
    payment_info: SellerPaymentInfoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update seller payment information
    """
    existing_info = db.query(SellerPaymentInfo).filter(
        SellerPaymentInfo.user_id == current_user.id
    ).first()

    if not existing_info:
        raise HTTPException(
            status_code=404,
            detail="No payment information found. Please create payment details first."
        )

    # Update payment method
    existing_info.payment_method = payment_info.payment_method

    # Update card details
    if payment_info.payment_method == "card":
        if not payment_info.card_number or not payment_info.card_holder_name:
            raise HTTPException(
                status_code=400,
                detail="Card number and holder name are required for card payment method"
            )

        # Validate card number using Luhn algorithm
        if not validate_luhn(payment_info.card_number):
            raise HTTPException(
                status_code=400,
                detail="Invalid card number. Please check and try again."
            )

        card_number = payment_info.card_number.replace(" ", "").replace("-", "")
        existing_info.card_last_four = card_number[-4:]
        existing_info.card_holder_name = payment_info.card_holder_name
        existing_info.card_type = detect_card_type(card_number)

        # Clear bank account details
        existing_info.bank_name = None
        existing_info.account_number = None
        existing_info.account_holder_name = None
        existing_info.routing_number = None

    # Update bank account details
    elif payment_info.payment_method == "bank_account":
        if not payment_info.account_number or not payment_info.account_holder_name:
            raise HTTPException(
                status_code=400,
                detail="Account number and holder name are required for bank account payment method"
            )

        existing_info.bank_name = payment_info.bank_name
        existing_info.account_number = payment_info.account_number
        existing_info.account_holder_name = payment_info.account_holder_name
        existing_info.routing_number = payment_info.routing_number

        # Clear card details
        existing_info.card_holder_name = None
        existing_info.card_last_four = None
        existing_info.card_type = None

    existing_info.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(existing_info)

    return existing_info


@router.delete("/seller/payment-info")
async def delete_seller_payment_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete seller payment information
    """
    payment_info = db.query(SellerPaymentInfo).filter(
        SellerPaymentInfo.user_id == current_user.id
    ).first()

    if not payment_info:
        raise HTTPException(
            status_code=404,
            detail="No payment information found"
        )

    db.delete(payment_info)
    db.commit()

    return {"message": "Payment information deleted successfully"}
