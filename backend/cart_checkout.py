"""
Cart Checkout - Multi-Seller Order Processing
Handles checkout for multiple items from different sellers
Creates separate orders and escrows for each seller
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime, timedelta
import random
import string

from database import get_db, Order, Escrow, Payment, User, Product
from auth import get_current_user

router = APIRouter()


class CartItem(BaseModel):
    product_id: int
    quantity: int


class CartCheckoutRequest(BaseModel):
    items: List[CartItem]
    payment_method: str = "card"
    payment_provider: str = "stripe"


class OrderSummary(BaseModel):
    order_id: int
    order_number: str
    seller_id: int
    seller_name: str
    items: List[dict]
    subtotal: float
    service_fee: float
    total: float
    status: str


class CartCheckoutResponse(BaseModel):
    checkout_session_id: str
    orders: List[OrderSummary]
    total_amount: float
    payment_url: str


def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.now().strftime('%Y%m%d')
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"ORD-{timestamp}-{random_part}"


@router.post("/cart/checkout", response_model=CartCheckoutResponse)
async def checkout_cart(
    checkout_data: CartCheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Checkout cart items - creates separate orders for each seller
    """

    if not checkout_data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # Step 1: Fetch all products and validate
    product_ids = [item.product_id for item in checkout_data.items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()

    if len(products) != len(product_ids):
        raise HTTPException(status_code=404, detail="Some products not found")

    products_map = {p.id: p for p in products}

    # Validate stock
    for item in checkout_data.items:
        product = products_map[item.product_id]
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.stock}"
            )

    # Step 2: Group items by seller
    seller_groups = {}
    for item in checkout_data.items:
        product = products_map[item.product_id]
        seller_id = product.seller_id

        if seller_id not in seller_groups:
            seller_groups[seller_id] = []

        seller_groups[seller_id].append({
            "product": product,
            "quantity": item.quantity,
            "subtotal": product.price * item.quantity
        })

    # Step 3: Create separate order for each seller
    orders = []
    total_checkout_amount = 0

    for seller_id, items in seller_groups.items():
        # Calculate order totals
        subtotal = sum(item["subtotal"] for item in items)
        service_fee = subtotal * 0.05  # 5% service fee
        order_total = subtotal + service_fee
        total_checkout_amount += order_total

        # Create order
        order_number = generate_order_number()
        item_names = ", ".join([f"{item['product'].name} (x{item['quantity']})" for item in items])

        new_order = Order(
            order_number=order_number,
            buyer_id=current_user.id,
            seller_id=seller_id,
            product_id=items[0]["product"].id if len(items) == 1 else None,  # Primary product if single item
            item_name=item_names,
            item_description=f"{len(items)} item(s) from seller",
            item_cost=subtotal,
            service_fee=service_fee,
            total_amount=order_total,
            status="pending",
            payment_method=checkout_data.payment_method,
            payment_provider=checkout_data.payment_provider
        )

        db.add(new_order)
        db.flush()  # Get order ID

        # Get seller info
        seller = db.query(User).filter(User.id == seller_id).first()
        seller_name = f"{seller.first_name} {seller.last_name}" if seller else "Unknown Seller"

        orders.append(OrderSummary(
            order_id=new_order.id,
            order_number=new_order.order_number,
            seller_id=seller_id,
            seller_name=seller_name,
            items=[{
                "product_id": item["product"].id,
                "name": item["product"].name,
                "quantity": item["quantity"],
                "price": item["product"].price,
                "subtotal": item["subtotal"]
            } for item in items],
            subtotal=subtotal,
            service_fee=service_fee,
            total=order_total,
            status="pending"
        ))

    # Step 4: Create a single payment record for the entire cart
    payment_reference = f"STRIPE-CART-{datetime.now().strftime('%Y%m%d%H%M%S')}"

    new_payment = Payment(
        reference=payment_reference,
        amount=total_checkout_amount,
        status="pending",
        payment_method=checkout_data.payment_method,
        payment_provider=checkout_data.payment_provider,
        user_id=current_user.id
    )

    db.add(new_payment)
    db.commit()

    # Step 5: Create Stripe checkout session (or other payment provider)
    # In production, you would integrate with Stripe API here
    checkout_url = f"https://checkout.stripe.com/pay/{payment_reference}"

    # For testing, you can use the existing verify endpoint with this reference

    return CartCheckoutResponse(
        checkout_session_id=payment_reference,
        orders=orders,
        total_amount=total_checkout_amount,
        payment_url=checkout_url
    )


@router.post("/cart/complete-payment")
async def complete_cart_payment(
    payment_reference: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Complete cart payment - activates all orders and creates escrows
    """

    # Find payment
    payment = db.query(Payment).filter(Payment.reference == payment_reference).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status == "success":
        return {"message": "Payment already completed"}

    # Update payment status
    payment.status = "success"
    payment.completed_at = datetime.utcnow()

    # Find all orders from this buyer that are pending
    # In production, you'd link orders to payment_reference
    pending_orders = db.query(Order).filter(
        Order.buyer_id == current_user.id,
        Order.status == "pending",
        Order.created_at >= datetime.utcnow() - timedelta(minutes=30)  # Recent orders
    ).all()

    escrows_created = []

    for order in pending_orders:
        # Update order status
        order.status = "paid"

        # Create escrow for this seller
        new_escrow = Escrow(
            order_id=order.id,
            amount=order.total_amount,
            status="held",
            auto_release_days=7,
            requires_buyer_approval=True,
            requires_delivery_confirmation=True
        )

        db.add(new_escrow)
        escrows_created.append({
            "order_id": order.id,
            "seller_id": order.seller_id,
            "amount": order.total_amount
        })

        # Update product stock
        if order.product_id:
            product = db.query(Product).filter(Product.id == order.product_id).first()
            if product:
                product.stock = max(0, product.stock - 1)

    db.commit()

    return {
        "message": "Payment completed successfully",
        "orders_activated": len(pending_orders),
        "escrows_created": escrows_created
    }


@router.post("/orders/{order_id}/confirm-delivery")
async def confirm_delivery(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Buyer confirms delivery for a specific order
    Releases escrow to that seller
    """

    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.buyer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if order.status != "paid":
        raise HTTPException(status_code=400, detail="Order not paid yet")

    # Find escrow
    escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
    if not escrow:
        raise HTTPException(status_code=404, detail="Escrow not found")

    if escrow.status != "held":
        raise HTTPException(status_code=400, detail="Escrow already processed")

    # Release escrow
    escrow.status = "released"
    escrow.released_at = datetime.utcnow()
    escrow.buyer_approved_at = datetime.utcnow()
    escrow.delivery_confirmed_at = datetime.utcnow()

    # Update order
    order.status = "completed"
    order.completed_at = datetime.utcnow()

    db.commit()

    # Get seller info
    seller = db.query(User).filter(User.id == order.seller_id).first()
    seller_name = f"{seller.first_name} {seller.last_name}" if seller else "Unknown"

    # Check if seller has payment info for automatic transfer
    from database import SellerPaymentInfo
    seller_payment_info = db.query(SellerPaymentInfo).filter(
        SellerPaymentInfo.user_id == order.seller_id
    ).first()

    message = f"Delivery confirmed. ${escrow.amount:.2f} released to {seller_name}"
    if seller_payment_info:
        message += f". Payment will be automatically transferred to seller's registered {seller_payment_info.payment_method}."

    # In production, trigger automatic payment transfer here:
    # - Use Stripe Connect to transfer funds
    # - Use bank transfer API
    # - Update payment status

    return {
        "message": message,
        "order_id": order_id,
        "seller_id": order.seller_id,
        "amount_released": escrow.amount,
        "status": "completed",
        "automatic_transfer": seller_payment_info is not None
    }
