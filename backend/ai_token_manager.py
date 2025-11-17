"""
AI Token Management & Usage Tracking
Handles token counting, quota enforcement, and session management
"""

import tiktoken
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from database import User, AIConversation
from ai_subscription_routes import TIER_LIMITS

logger = logging.getLogger(__name__)

# Initialize tokenizer for GPT models
try:
    tokenizer = tiktoken.encoding_for_model("gpt-4o-mini")
except:
    tokenizer = tiktoken.get_encoding("cl100k_base")  # Fallback


def count_tokens(text: str) -> int:
    """Count tokens in text using tiktoken"""
    try:
        return len(tokenizer.encode(text))
    except Exception as e:
        logger.warning(f"Token counting failed: {e}")
        # Fallback: rough estimate (4 chars = 1 token)
        return len(text) // 4


def check_user_quota(user: Optional[User], db: Session) -> Dict[str, Any]:
    """
    Check if user has quota remaining
    Returns quota status and limits
    """
    # Anonymous users get limited free tier
    if not user:
        return {
            "allowed": True,
            "tier": "anonymous",
            "tokens_remaining": 1000,  # Very limited
            "requests_remaining": 10,
            "message": "Anonymous usage (very limited)"
        }

    # Get user tier or default to free
    tier = user.ai_tier or "free"
    tier_config = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    # Reset monthly counters if needed
    now = datetime.utcnow()
    if user.ai_tokens_reset_at and now > user.ai_tokens_reset_at:
        user.ai_tokens_used = 0
        user.ai_requests_used = 0
        user.ai_tokens_reset_at = now + timedelta(days=30)
        db.commit()
        logger.info(f"🔄 Reset monthly quota for user {user.id}")

    # Check token limit
    monthly_token_limit = tier_config["monthly_tokens"]
    tokens_used = user.ai_tokens_used or 0
    tokens_remaining = monthly_token_limit - tokens_used if monthly_token_limit > 0 else -1

    # Check request limit
    monthly_request_limit = tier_config["monthly_requests"]
    requests_used = user.ai_requests_used or 0
    requests_remaining = monthly_request_limit - requests_used if monthly_request_limit > 0 else -1

    # Determine if allowed
    allowed = True
    message = ""

    if monthly_token_limit > 0 and tokens_remaining <= 0:
        allowed = False
        message = f"Monthly token limit reached ({monthly_token_limit:,} tokens). Upgrade to {get_next_tier(tier)} for more!"
    elif monthly_request_limit > 0 and requests_remaining <= 0:
        allowed = False
        message = f"Monthly message limit reached ({monthly_request_limit} messages). Upgrade for more!"

    return {
        "allowed": allowed,
        "tier": tier,
        "tier_name": tier_config["name"],
        "tokens_used": tokens_used,
        "tokens_remaining": tokens_remaining,
        "monthly_token_limit": monthly_token_limit,
        "requests_used": requests_used,
        "requests_remaining": requests_remaining,
        "monthly_request_limit": monthly_request_limit,
        "resets_at": user.ai_tokens_reset_at,
        "message": message
    }


def check_session_quota(session_id: str, user: Optional[User], db: Session) -> Dict[str, Any]:
    """
    Check if session has exceeded token limit
    Sessions reset after timeout or token limit
    """
    # Get tier config
    tier = user.ai_tier if user else "free"
    tier_config = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    session_token_limit = tier_config["session_token_limit"]
    session_timeout_minutes = tier_config["session_timeout_minutes"]

    # Get session history
    last_conversation = db.query(AIConversation).filter(
        AIConversation.session_id == session_id
    ).order_by(AIConversation.created_at.desc()).first()

    if not last_conversation:
        return {
            "allowed": True,
            "session_tokens_used": 0,
            "session_token_limit": session_token_limit,
            "session_expired": False,
            "message": "New session"
        }

    # Check session timeout
    now = datetime.utcnow()
    time_since_last = (now - last_conversation.last_activity_at).total_seconds() / 60

    session_expired = False
    if session_timeout_minutes > 0 and time_since_last > session_timeout_minutes:
        session_expired = True
        logger.info(f"⏱️  Session {session_id[:8]}... expired after {time_since_last:.0f} minutes")

    session_tokens_used = last_conversation.session_total_tokens or 0
    session_tokens_remaining = session_token_limit - session_tokens_used if session_token_limit > 0 else -1

    allowed = True
    message = ""

    if session_expired:
        allowed = True  # Expired session allows new conversation
        message = f"Previous session expired. Starting fresh! ({tier_config['name']} tier)"
    elif session_token_limit > 0 and session_tokens_remaining <= 0:
        allowed = False
        message = f"Session token limit reached ({session_token_limit:,} tokens). Start a new conversation!"

    return {
        "allowed": allowed,
        "session_tokens_used": session_tokens_used,
        "session_tokens_remaining": session_tokens_remaining,
        "session_token_limit": session_token_limit,
        "session_expired": session_expired,
        "time_since_last": time_since_last,
        "message": message
    }


def update_usage(
    user: Optional[User],
    session_id: str,
    user_message: str,
    ai_response: str,
    session_total_tokens: int,
    db: Session
) -> int:
    """
    Update user and session token usage
    Returns tokens used in this exchange
    """
    # Count tokens
    message_tokens = count_tokens(user_message)
    response_tokens = count_tokens(ai_response)
    total_tokens = message_tokens + response_tokens

    logger.info(f"📊 Tokens: {message_tokens} (user) + {response_tokens} (AI) = {total_tokens} total")

    # Update user monthly totals
    if user:
        user.ai_tokens_used = (user.ai_tokens_used or 0) + total_tokens
        user.ai_requests_used = (user.ai_requests_used or 0) + 1
        db.commit()

    return total_tokens


def get_next_tier(current_tier: str) -> str:
    """Get the next tier for upgrade suggestions"""
    tier_order = ["free", "pro", "business"]
    try:
        current_index = tier_order.index(current_tier)
        if current_index < len(tier_order) - 1:
            return TIER_LIMITS[tier_order[current_index + 1]]["name"]
    except:
        pass
    return "Professional"


def get_tier_info(user: Optional[User]) -> Dict[str, Any]:
    """Get detailed tier information for AI context"""
    tier = user.ai_tier if user else "free"
    tier_config = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    return {
        "tier": tier,
        "tier_name": tier_config["name"],
        "price": tier_config["price"],
        "features": tier_config["business_features"],
        "priority": tier_config["priority"],
        "is_premium": tier in ["pro", "business", "admin"]
    }
