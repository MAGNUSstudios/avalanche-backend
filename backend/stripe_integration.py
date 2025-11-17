"""
Stripe Payment Integration
Handles Stripe Checkout sessions and webhooks
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
import stripe
import os
from dotenv import load_dotenv

from database import get_db, Order, Escrow, Payment, Project, User
from schemas import OrderResponse
from auth import get_current_user


class CheckoutSessionCreate(BaseModel):
    project_id: int

load_dotenv()

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

router = APIRouter()


@router.post("/create-checkout-session")
async def create_checkout_session(
    data: CheckoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a Stripe Checkout session for project payment
    """
    # Get project details
    project = db.query(Project).filter(Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if not project.budget or project.budget <= 0:
        raise HTTPException(status_code=400, detail="Project must have a valid budget")

    # Calculate service fee (5%)
    service_fee = round(project.budget * 0.05, 2)
    total_amount = project.budget + service_fee

    try:
        # Create Stripe Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'unit_amount': int(project.budget * 100),  # Convert to cents
                        'product_data': {
                            'name': project.title,
                            'description': project.description or "Project payment",
                        },
                    },
                    'quantity': 1,
                },
                {
                    'price_data': {
                        'currency': 'usd',
                        'unit_amount': int(service_fee * 100),  # Convert to cents
                        'product_data': {
                            'name': 'Service Fee (5%)',
                            'description': 'Platform service fee',
                        },
                    },
                    'quantity': 1,
                },
            ],
            mode='payment',
            success_url=f'{FRONTEND_URL}/payment/success?session_id={{CHECKOUT_SESSION_ID}}&project_id={data.project_id}',
            cancel_url=f'{FRONTEND_URL}/projects/payment?projectId={data.project_id}&cancelled=true',
            metadata={
                'project_id': str(data.project_id),
                'buyer_id': str(current_user.id),
                'seller_id': str(project.owner_id),
                'item_cost': str(project.budget),
                'service_fee': str(service_fee),
                'total_amount': str(total_amount),
            }
        )

        return {
            "sessionId": checkout_session.id,
            "url": checkout_session.url
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating checkout session: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Handle Stripe webhook events
    """
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    if not STRIPE_WEBHOOK_SECRET:
        # For development without webhook secret
        event = stripe.Event.construct_from(
            await request.json(), stripe.api_key
        )
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid payload")
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Extract metadata
        metadata = session.get('metadata', {})
        payment_type = metadata.get('type', 'standard')

        # Handle project escrow payment (new workflow)
        if payment_type == 'project_escrow':
            project_id = int(metadata.get('project_id'))
            escrow_amount = float(metadata.get('escrow_amount'))
            platform_fee = float(metadata.get('platform_fee'))
            freelancer_id = int(metadata.get('freelancer_id'))

            # Get project
            project = db.query(Project).filter(Project.id == project_id).first()
            if project:
                # Update project with escrow funding
                project.escrow_funded = True
                project.escrow_amount = escrow_amount
                project.escrow_funded_at = datetime.utcnow()
                project.workflow_status = "escrow_funded"
                project.updated_at = datetime.utcnow()

                # TODO: Send notification to freelancer
                # "Funds secured! You can start working on the project"

                db.commit()

                print(f"✓ Escrow funded for project {project_id}: ${escrow_amount}")

        # Handle standard project payment (legacy workflow)
        else:
            project_id = int(metadata.get('project_id'))
            buyer_id = int(metadata.get('buyer_id'))
            seller_id = int(metadata.get('seller_id'))
            item_cost = float(metadata.get('item_cost'))
            service_fee = float(metadata.get('service_fee'))
            total_amount = float(metadata.get('total_amount'))

            # Get project
            project = db.query(Project).filter(Project.id == project_id).first()

            # Create order
            from payment_escrow import generate_order_number
            order = Order(
                order_number=generate_order_number(),
                buyer_id=buyer_id,
                seller_id=seller_id,
                project_id=project_id,
                item_name=project.title if project else "Project Payment",
                item_description=project.description if project else None,
                item_cost=item_cost,
                service_fee=service_fee,
                total_amount=total_amount,
                payment_method="card",
                payment_provider="stripe",
                status="paid"
            )
            db.add(order)
            db.flush()

            # Create payment record
            payment = Payment(
                order_id=order.id,
                amount=total_amount,
                currency="USD",
                payment_method="card",
                payment_provider="stripe",
                provider_reference=session.get('id'),
                provider_transaction_id=session.get('payment_intent'),
                status="success"
            )
            db.add(payment)
            db.flush()

            # Create escrow
            escrow = Escrow(
                order_id=order.id,
                amount=item_cost,  # Only escrow the project cost, not the service fee
                status="held",
                auto_release_days=7,
                requires_buyer_approval=True,
                requires_delivery_confirmation=True
            )
            db.add(escrow)

            db.commit()

    return {"status": "success"}


@router.get("/payment-success/{session_id}")
async def payment_success(
    session_id: str,
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify payment success and return order details
    """
    try:
        # Retrieve the session from Stripe
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status != 'paid':
            raise HTTPException(status_code=400, detail="Payment not completed")

        # Find the order
        order = db.query(Order).filter(
            Order.project_id == project_id,
            Order.buyer_id == current_user.id
        ).order_by(Order.created_at.desc()).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        return {
            "order": order,
            "session": {
                "id": session.id,
                "payment_status": session.payment_status,
                "amount_total": session.amount_total / 100,  # Convert from cents
            }
        }

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
