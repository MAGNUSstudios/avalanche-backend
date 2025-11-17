"""
Payment and Escrow Management Endpoints
Handles orders, escrow accounts, and payment processing
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import secrets
import hashlib

from database import get_db, Order, Escrow, Payment, User, Project, Wallet, WalletTransaction
from schemas import (
    OrderCreate, OrderResponse, OrderUpdate,
    EscrowCreate, EscrowResponse, EscrowAction,
    PaymentInitialize, PaymentResponse, PaymentVerify
)
from auth import get_current_user

router = APIRouter()


def generate_order_number() -> str:
    """Generate a unique order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    random_part = secrets.token_hex(4).upper()
    return f"ORD-{timestamp}-{random_part}"


def calculate_service_fee(amount: float) -> float:
    """Calculate service fee (5% of item cost)"""
    return round(amount * 0.05, 2)


# ===== ORDER ENDPOINTS =====

@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new order
    """
    # Calculate total
    service_fee = order_data.service_fee if order_data.service_fee > 0 else calculate_service_fee(order_data.item_cost)
    total_amount = order_data.item_cost + service_fee

    # Create order
    new_order = Order(
        order_number=generate_order_number(),
        buyer_id=current_user.id,
        seller_id=order_data.seller_id,
        product_id=order_data.product_id,
        project_id=order_data.project_id,
        item_name=order_data.item_name,
        item_description=order_data.item_description,
        item_cost=order_data.item_cost,
        service_fee=service_fee,
        total_amount=total_amount,
        payment_method=order_data.payment_method,
        status="pending"
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    return new_order


@router.get("/orders", response_model=List[OrderResponse])
async def get_orders(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all orders for current user (as buyer or seller)
    """
    orders = db.query(Order).filter(
        (Order.buyer_id == current_user.id) | (Order.seller_id == current_user.id)
    ).offset(skip).limit(limit).all()

    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get order by ID
    """
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Check if user is buyer or seller
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return order


@router.put("/orders/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    order_update: OrderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update order status
    """
    order = db.query(Order).filter(Order.id == order_id).first()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only buyer or seller can update
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this order")

    if order_update.status:
        order.status = order_update.status
        if order_update.status == "completed":
            order.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(order)

    return order


# ===== ESCROW ENDPOINTS =====

@router.post("/escrow", response_model=EscrowResponse, status_code=status.HTTP_201_CREATED)
async def create_escrow(
    escrow_data: EscrowCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create escrow for an order
    """
    # Verify order exists
    order = db.query(Order).filter(Order.id == escrow_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only buyer can create escrow
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only buyer can create escrow")

    # Check if escrow already exists
    existing_escrow = db.query(Escrow).filter(Escrow.order_id == escrow_data.order_id).first()
    if existing_escrow:
        raise HTTPException(status_code=400, detail="Escrow already exists for this order")

    # Create escrow
    new_escrow = Escrow(
        order_id=escrow_data.order_id,
        amount=escrow_data.amount,
        auto_release_days=escrow_data.auto_release_days,
        requires_buyer_approval=escrow_data.requires_buyer_approval,
        requires_delivery_confirmation=escrow_data.requires_delivery_confirmation,
        status="held"
    )

    db.add(new_escrow)

    # Update order status
    order.status = "processing"

    db.commit()
    db.refresh(new_escrow)

    return new_escrow


@router.get("/escrow", response_model=List[EscrowResponse])
async def get_escrows(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all escrow accounts for current user
    """
    escrows = db.query(Escrow).join(Order).filter(
        (Order.buyer_id == current_user.id) | (Order.seller_id == current_user.id)
    ).offset(skip).limit(limit).all()

    return escrows


@router.get("/escrow/{escrow_id}", response_model=EscrowResponse)
async def get_escrow(
    escrow_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get escrow by ID
    """
    escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()

    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    # Check authorization
    order = escrow.order
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this escrow")

    return escrow


@router.post("/escrow/{escrow_id}/action", response_model=EscrowResponse)
async def escrow_action(
    escrow_id: int,
    action_data: EscrowAction,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Perform action on escrow (approve, confirm_delivery, dispute, release, refund)
    """
    escrow = db.query(Escrow).filter(Escrow.id == escrow_id).first()

    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    order = escrow.order

    # Handle different actions
    if action_data.action == "approve":
        # Buyer approves
        if order.buyer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only buyer can approve")
        escrow.buyer_approved = True

    elif action_data.action == "confirm_delivery":
        # Seller confirms delivery
        if order.seller_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only seller can confirm delivery")
        escrow.delivery_confirmed = True

    elif action_data.action == "dispute":
        # Either party can dispute
        if order.buyer_id != current_user.id and order.seller_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
        escrow.status = "disputed"
        escrow.dispute_reason = action_data.reason

    elif action_data.action == "release":
        # Release funds to seller
        if escrow.status != "held":
            raise HTTPException(status_code=400, detail="Can only release held funds")

        # Check conditions
        if escrow.requires_buyer_approval and not escrow.buyer_approved:
            raise HTTPException(status_code=400, detail="Buyer approval required")

        escrow.status = "released"
        escrow.released_at = datetime.utcnow()
        order.status = "completed"
        order.completed_at = datetime.utcnow()

        # Deposit funds into seller's wallet
        seller_wallet = db.query(Wallet).filter(Wallet.user_id == order.seller_id).first()
        if seller_wallet:
            seller_wallet.balance += escrow.amount
            
            # Create a transaction record
            transaction = WalletTransaction(
                wallet_id=seller_wallet.id,
                transaction_type="deposit",
                amount=escrow.amount,
                description=f"Payment for order #{order.order_number}",
                related_order_id=order.id
            )
            db.add(transaction)

    elif action_data.action == "refund":
        # Refund to buyer
        if escrow.status != "held":
            raise HTTPException(status_code=400, detail="Can only refund held funds")

        escrow.status = "refunded"
        escrow.refunded_at = datetime.utcnow()
        order.status = "refunded"

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.commit()
    db.refresh(escrow)

    return escrow


# ===== PAYMENT ENDPOINTS =====

@router.post("/payments/initialize", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def initialize_payment(
    payment_data: PaymentInitialize,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Initialize payment with Stripe
    """
    import stripe
    import os
    from dotenv import load_dotenv

    load_dotenv()
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Verify order exists
    order = db.query(Order).filter(Order.id == payment_data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Only buyer can initiate payment
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only buyer can initiate payment")

    # Generate payment reference
    reference = f"{payment_data.payment_provider.upper()}-{order.order_number}-{secrets.token_hex(4).upper()}"

    # Create payment record
    new_payment = Payment(
        order_id=payment_data.order_id,
        amount=order.total_amount,
        currency="USD",
        payment_method=payment_data.payment_method,
        payment_provider=payment_data.payment_provider,
        provider_reference=reference,
        status="pending"
    )

    db.add(new_payment)

    # Update order
    order.payment_method = payment_data.payment_method
    order.payment_provider = payment_data.payment_provider

    db.commit()
    db.refresh(new_payment)

    # Create Stripe Checkout Session
    if payment_data.payment_provider == "stripe":
        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'usd',
                            'unit_amount': int(order.item_cost * 100),  # Convert to cents
                            'product_data': {
                                'name': order.item_name,
                                'description': order.item_description or "Product payment",
                            },
                        },
                        'quantity': 1,
                    },
                    {
                        'price_data': {
                            'currency': 'usd',
                            'unit_amount': int(order.service_fee * 100),  # Convert to cents
                            'product_data': {
                                'name': 'Service Fee (5%)',
                                'description': 'Platform service fee',
                            },
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=f'{FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&order_id={order.id}',
                cancel_url=f'{FRONTEND_URL}/marketplace',
                metadata={
                    'order_id': str(order.id),
                    'buyer_id': str(current_user.id),
                    'seller_id': str(order.seller_id),
                    'payment_id': str(new_payment.id),
                }
            )

            # Update payment with Stripe session info
            new_payment.provider_transaction_id = checkout_session.id
            db.commit()
            db.refresh(new_payment)

            # Add checkout_url to response
            new_payment.checkout_url = checkout_session.url

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error creating Stripe checkout session: {str(e)}")

    return new_payment


@router.post("/payments/verify", response_model=PaymentResponse)
async def verify_payment(
    payment_data: PaymentVerify,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment from provider (Paystack or Stripe)
    """
    payment = db.query(Payment).filter(
        Payment.provider_reference == payment_data.provider_reference
    ).first()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    order = payment.order

    # Only buyer can verify
    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify with payment provider
    if payment_data.payment_provider == "paystack":
        import os
        import requests
        from dotenv import load_dotenv

        load_dotenv()
        PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")

        try:
            # Verify transaction with Paystack
            headers = {
                "Authorization": f"Bearer {PAYSTACK_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            response = requests.get(
                f"https://api.paystack.co/transaction/verify/{payment_data.provider_reference}",
                headers=headers
            )

            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to verify payment with Paystack")

            data = response.json()

            if not data.get("status"):
                raise HTTPException(status_code=400, detail="Paystack verification failed")

            transaction_data = data.get("data", {})

            # Check if payment was successful
            if transaction_data.get("status") != "success":
                raise HTTPException(
                    status_code=400,
                    detail=f"Payment not successful. Status: {transaction_data.get('status')}"
                )

            # Verify amount matches (Paystack uses kobo/pesewas - divide by 100)
            expected_amount = int(order.total_amount * 100)
            actual_amount = transaction_data.get("amount", 0)

            if actual_amount != expected_amount:
                raise HTTPException(
                    status_code=400,
                    detail=f"Payment amount mismatch. Expected: {expected_amount}, Got: {actual_amount}"
                )

            # Update payment with Paystack transaction details
            payment.provider_transaction_id = transaction_data.get("id")

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error verifying payment with Paystack: {str(e)}"
            )

    elif payment_data.payment_provider == "stripe":
        # Stripe verification is handled via webhooks, but we can add additional checks here
        pass

    # Mark payment as successful
    payment.status = "success"
    payment.completed_at = datetime.utcnow()

    # Update order status
    order.status = "paid"

    # If this order is for a project, activate the project
    if order.project_id:
        project = db.query(Project).filter(Project.id == order.project_id).first()
        if project and project.status == "pending_payment":
            project.status = "active"
            project.updated_at = datetime.utcnow()
            # Log the activation
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"✅ Project {project.id} '{project.title}' activated after payment verification")

    # Auto-create escrow
    existing_escrow = db.query(Escrow).filter(Escrow.order_id == order.id).first()
    if not existing_escrow:
        new_escrow = Escrow(
            order_id=order.id,
            amount=order.total_amount,
            auto_release_days=7,
            requires_buyer_approval=True,
            requires_delivery_confirmation=True,
            status="held"
        )
        db.add(new_escrow)

    db.commit()
    db.refresh(payment)

    return payment


@router.post("/payments/webhook/stripe")
async def stripe_webhook(
    request: dict,
    db: Session = Depends(get_db)
):
    """
    Handle Stripe webhook events for payment completion
    This endpoint is called by Stripe when a payment is successful
    """
    import logging
    logger = logging.getLogger(__name__)

    event_type = request.get("type")

    if event_type == "checkout.session.completed":
        session = request.get("data", {}).get("object", {})
        metadata = session.get("metadata", {})

        order_id = metadata.get("order_id")
        payment_id = metadata.get("payment_id")

        if order_id and payment_id:
            # Find the order and payment
            order = db.query(Order).filter(Order.id == int(order_id)).first()
            payment = db.query(Payment).filter(Payment.id == int(payment_id)).first()

            if order and payment:
                # Update payment status
                payment.status = "success"
                payment.completed_at = datetime.utcnow()
                payment.provider_transaction_id = session.get("id")

                # Update order status
                order.status = "paid"

                # If this order is for a project, activate the project
                if order.project_id:
                    project = db.query(Project).filter(Project.id == order.project_id).first()
                    if project and project.status == "pending_payment":
                        project.status = "active"
                        project.updated_at = datetime.utcnow()
                        logger.info(f"✅ Project {project.id} '{project.title}' activated via Stripe webhook")

                # Auto-create escrow
                existing_escrow = db.query(Escrow).filter(Escrow.order_id == order.id).first()
                if not existing_escrow:
                    new_escrow = Escrow(
                        order_id=order.id,
                        amount=order.total_amount,
                        auto_release_days=7,
                        requires_buyer_approval=True,
                        requires_delivery_confirmation=True,
                        status="held"
                    )
                    db.add(new_escrow)

                db.commit()
                logger.info(f"✅ Payment {payment_id} completed via Stripe webhook for order {order_id}")

    return {"status": "success"}


@router.get("/payments", response_model=List[PaymentResponse])
async def get_payments(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all payments for current user
    """
    payments = db.query(Payment).join(Order).filter(
        (Order.buyer_id == current_user.id) | (Order.seller_id == current_user.id)
    ).offset(skip).limit(limit).all()

    return payments
