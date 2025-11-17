"""
AI Subscription Tier Management
Handles Free, Pro, and Max tier subscriptions
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional

from database import get_db, User
from auth import get_current_user

router = APIRouter(prefix="/ai/subscription", tags=["AI Subscription"])

# Business-Level Tier Configurations
TIER_LIMITS = {
    "free": {
        "name": "Starter",
        "price": 0,
        "monthly_tokens": 50000,  # ~50 conversations
        "monthly_requests": 100,
        "session_token_limit": 4000,  # Per conversation session
        "session_timeout_minutes": 30,  # Session expires after 30min inactivity
        "features": [
            "100 AI messages per month",
            "Basic product search & recommendations",
            "Guild discovery",
            "Standard response time (~5 seconds)",
            "Community support",
            "Session memory (30 minutes)"
        ],
        "business_features": {
            "listings": 5,  # Max 5 product listings
            "guilds": 3,  # Join up to 3 guilds
            "projects": 2,  # Create 2 projects
            "marketplace_analytics": False,
            "ai_insights": False
        },
        "priority": "standard",
        "response_time": "normal"
    },
    "pro": {
        "name": "Professional",
        "price": 29.99,
        "monthly_tokens": 500000,  # ~500 conversations
        "monthly_requests": 1000,
        "session_token_limit": 8000,  # Longer conversations
        "session_timeout_minutes": 120,  # 2 hour sessions
        "features": [
            "1,000 AI messages per month",
            "Advanced AI insights & analytics",
            "Market trend analysis",
            "Project collaboration tools",
            "Priority support (24h response)",
            "Fast response time (~3 seconds)",
            "Extended session memory (2 hours)",
            "Conversation history (30 days)"
        ],
        "business_features": {
            "listings": 50,  # Max 50 product listings
            "guilds": 10,  # Join up to 10 guilds
            "projects": 20,  # Create 20 projects
            "marketplace_analytics": True,
            "ai_insights": True,
            "bulk_upload": True,
            "advanced_search": True
        },
        "priority": "high",
        "response_time": "fast"
    },
    "business": {
        "name": "Business",
        "price": 49.99,
        "monthly_tokens": 2000000,  # ~2000 conversations
        "monthly_requests": 5000,
        "session_token_limit": 16000,  # Very long conversations
        "session_timeout_minutes": 480,  # 8 hour sessions
        "features": [
            "5,000 AI messages per month",
            "Unlimited product listings",
            "Unlimited guilds & projects",
            "AI-powered sales optimization",
            "Custom AI training on your data",
            "Dedicated account manager",
            "API access for integrations",
            "Priority support (2h response)",
            "Instant response time (~1 second)",
            "Unlimited session memory",
            "Conversation history (1 year)"
        ],
        "business_features": {
            "listings": -1,  # Unlimited
            "guilds": -1,  # Unlimited
            "projects": -1,  # Unlimited
            "marketplace_analytics": True,
            "ai_insights": True,
            "bulk_upload": True,
            "advanced_search": True,
            "api_access": True,
            "white_label": True,
            "team_members": 10
        },
        "priority": "highest",
        "response_time": "instant"
    },
    "admin": {
        "name": "Admin",
        "price": 0,
        "monthly_tokens": -1,  # Unlimited
        "monthly_requests": -1,
        "session_token_limit": -1,  # No limits
        "session_timeout_minutes": -1,  # Never expires
        "features": [
            "Unlimited everything",
            "Full system access",
            "Admin dashboard",
            "User management",
            "System analytics",
            "Platform monitoring"
        ],
        "business_features": {
            "listings": -1,
            "guilds": -1,
            "projects": -1,
            "marketplace_analytics": True,
            "ai_insights": True,
            "bulk_upload": True,
            "advanced_search": True,
            "api_access": True,
            "white_label": True,
            "team_members": -1
        },
        "priority": "admin",
        "response_time": "instant"
    }
}


class SubscriptionUpgrade(BaseModel):
    tier: str  # pro, max
    payment_method: Optional[str] = "card"


class SubscriptionResponse(BaseModel):
    current_tier: str
    requests_used: int
    requests_remaining: int
    monthly_limit: int
    expires_at: Optional[datetime] = None
    features: list
    can_upgrade: bool


@router.get("/status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's AI subscription status
    """
    # Reset monthly requests if needed
    now = datetime.utcnow()
    if current_user.ai_requests_reset_at and now > current_user.ai_requests_reset_at:
        current_user.ai_requests_used = 0
        current_user.ai_requests_reset_at = now + timedelta(days=30)
        db.commit()

    # Check if subscription expired
    if current_user.ai_tier_expires_at and now > current_user.ai_tier_expires_at:
        current_user.ai_tier = "free"
        current_user.ai_tier_expires_at = None
        db.commit()

    tier = current_user.ai_tier or "free"
    tier_config = TIER_LIMITS[tier]
    monthly_limit = tier_config["monthly_requests"]
    requests_used = current_user.ai_requests_used or 0

    return {
        "current_tier": tier,
        "tier_name": tier_config["name"],
        "price": tier_config["price"],
        "requests_used": requests_used,
        "requests_remaining": monthly_limit - requests_used if monthly_limit > 0 else -1,
        "monthly_limit": monthly_limit,
        "expires_at": current_user.ai_tier_expires_at,
        "resets_at": current_user.ai_requests_reset_at,
        "features": tier_config["features"],
        "priority": tier_config["priority"],
        "can_upgrade": tier != "business"
    }


@router.get("/tiers")
async def get_all_tiers():
    """
    Get all available AI subscription tiers
    """
    return {
        "tiers": [
            {
                "id": "free",
                **TIER_LIMITS["free"]
            },
            {
                "id": "pro",
                **TIER_LIMITS["pro"]
            },
            {
                "id": "business",
                **TIER_LIMITS["business"]
            },
            {
                "id": "admin",
                **TIER_LIMITS["admin"]
            }
        ]
    }


@router.post("/select-plan/{tier}")
async def select_plan(
    tier: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Select initial AI plan (called after signup)
    Returns Stripe checkout URL for Pro/Max or success for Free/Admin
    """
    if tier not in ["free", "pro", "business", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid tier. Choose 'free', 'pro', 'max', or 'admin'")

    # Get the user from the current database session
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Admins bypass and get max tier automatically
    if user.role == "admin":
        user.ai_tier = "business"
        user.plan_selected = True
        user.ai_tier_expires_at = None  # Never expires for admin
        db.commit()
        db.refresh(user)
        return {
            "success": True,
            "tier": "business",
            "redirect_to_dashboard": True,
            "message": "Admin account - Full access granted"
        }

    # Free tier - immediate activation
    if tier == "free":
        user.ai_tier = "free"
        user.plan_selected = True
        user.ai_requests_reset_at = datetime.utcnow() + timedelta(days=30)
        db.commit()
        db.refresh(user)
        return {
            "success": True,
            "tier": "free",
            "redirect_to_dashboard": True
        }

    # Admin tier - only accessible to users with admin role
    if tier == "admin":
        if user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin tier is only available to administrators")
        user.ai_tier = "admin"
        user.plan_selected = True
        user.ai_tier_expires_at = None  # Never expires for admin
        db.commit()
        db.refresh(user)
        return {
            "success": True,
            "tier": "admin",
            "redirect_to_dashboard": True,
            "message": "Admin tier activated - Full system access granted"
        }

    # Pro/Max tier - create Stripe checkout session
    import stripe
    import os
    from dotenv import load_dotenv

    load_dotenv()
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    tier_config = TIER_LIMITS[tier]

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'unit_amount': int(tier_config['price'] * 100),  # Convert to cents
                    'product_data': {
                        'name': f"Avalanche AI {tier_config['name']} Tier",
                        'description': f"Monthly subscription - {', '.join(tier_config['features'][:3])}",
                    },
                    'recurring': {
                        'interval': 'month'
                    }
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'{FRONTEND_URL}/plan-success?session_id={{CHECKOUT_SESSION_ID}}&tier={tier}',
            cancel_url=f'{FRONTEND_URL}/select-plan',
            metadata={
                'user_id': str(current_user.id),
                'tier': tier,
                'type': 'ai_subscription'
            }
        )

        return {
            "success": True,
            "tier": tier,
            "checkout_url": checkout_session.url,
            "redirect_to_stripe": True
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error creating checkout session: {str(e)}")


@router.post("/upgrade")
async def upgrade_subscription(
    upgrade_data: SubscriptionUpgrade,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upgrade AI subscription tier (for existing users)
    """
    if upgrade_data.tier not in ["pro", "business"]:
        raise HTTPException(status_code=400, detail="Invalid tier. Choose 'pro' or 'max'")

    # Get the user from the current database session
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    current_tier = user.ai_tier or "free"

    # Check if already on higher tier
    tier_order = {"free": 0, "pro": 1, "business": 2}
    if tier_order[current_tier] >= tier_order[upgrade_data.tier]:
        raise HTTPException(
            status_code=400,
            detail=f"You are already on {current_tier} tier or higher"
        )

    # TODO: Process payment with Stripe
    # For now, we'll just upgrade the tier

    # Upgrade tier
    user.ai_tier = upgrade_data.tier
    user.ai_tier_expires_at = datetime.utcnow() + timedelta(days=30)
    user.ai_requests_used = 0
    user.ai_requests_reset_at = datetime.utcnow() + timedelta(days=30)

    db.commit()
    db.refresh(user)

    return {
        "success": True,
        "message": f"Successfully upgraded to {TIER_LIMITS[upgrade_data.tier]['name']} tier",
        "new_tier": upgrade_data.tier,
        "expires_at": user.ai_tier_expires_at,
        "features": TIER_LIMITS[upgrade_data.tier]["features"]
    }


@router.post("/confirm-plan")
async def confirm_plan(
    tier: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Confirm plan selection after successful Stripe payment
    """
    if tier not in ["pro", "business"]:
        raise HTTPException(status_code=400, detail="Invalid tier")

    current_user.ai_tier = tier
    current_user.plan_selected = True
    current_user.ai_tier_expires_at = datetime.utcnow() + timedelta(days=30)
    current_user.ai_requests_used = 0
    current_user.ai_requests_reset_at = datetime.utcnow() + timedelta(days=30)

    db.commit()

    return {
        "success": True,
        "message": f"Successfully activated {TIER_LIMITS[tier]['name']} tier",
        "tier": tier
    }


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel AI subscription (downgrade to free)
    """
    if current_user.ai_tier == "free":
        raise HTTPException(status_code=400, detail="You are already on the free tier")

    current_user.ai_tier = "free"
    current_user.ai_tier_expires_at = None
    current_user.ai_requests_used = 0

    db.commit()

    return {
        "success": True,
        "message": "Subscription cancelled successfully. You've been downgraded to the Free tier."
    }


async def check_ai_limit(user: User, db: Session) -> bool:
    """
    Check if user has remaining AI requests
    Returns True if user can make request, False otherwise
    """
    # Reset if needed
    now = datetime.utcnow()
    if user.ai_requests_reset_at and now > user.ai_requests_reset_at:
        user.ai_requests_used = 0
        user.ai_requests_reset_at = now + timedelta(days=30)
        db.commit()

    tier = user.ai_tier or "free"
    monthly_limit = TIER_LIMITS[tier]["monthly_requests"]

    # Unlimited for Max tier
    if monthly_limit == -1:
        return True

    # Check limit
    requests_used = user.ai_requests_used or 0
    return requests_used < monthly_limit


async def increment_ai_usage(user: User, db: Session):
    """
    Increment user's AI request counter
    """
    user.ai_requests_used = (user.ai_requests_used or 0) + 1
    db.commit()


def get_tier_config(tier: str) -> dict:
    """
    Get configuration for a specific tier
    """
    return TIER_LIMITS.get(tier, TIER_LIMITS["free"])
