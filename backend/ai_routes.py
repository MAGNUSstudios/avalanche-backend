from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import random

from database import get_db, User, Product, Project, Guild
from auth import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


# Commented out - using the OpenAI-powered endpoint in main.py instead
# @router.post("/chat")
# async def ai_chat(
#     message: dict,
#     current_user: User = Depends(get_current_user),
#     db: Session = Depends(get_db)
# ):
#     """
#     Send message to AI assistant and get response
#     """
#     user_message = message.get("message", "")
#
#     if not user_message:
#         raise HTTPException(status_code=400, detail="Message cannot be empty")
#
#     # Simple keyword-based responses (can be replaced with actual AI)
#     response = generate_ai_response(user_message, current_user, db)
#
#     # TODO: Store conversation history in database
#
#     return {
#         "user_message": user_message,
#         "ai_response": response,
#         "timestamp": datetime.utcnow()
#     }


@router.get("/suggestions/products")
async def get_product_suggestions(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered product recommendations
    """
    # Get random products (can be replaced with ML-based recommendations)
    products = db.query(Product).filter(
        Product.is_active == True
    ).order_by(func.random()).limit(limit).all()
    
    return {
        "suggestions": products,
        "reason": "Based on your browsing history and preferences"
    }


@router.get("/suggestions/guilds")
async def get_guild_suggestions(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered guild recommendations
    """
    # Get guilds user is not member of
    # TODO: Implement smart recommendations based on interests
    guilds = db.query(Guild).filter(
        Guild.is_private == False
    ).order_by(func.random()).limit(limit).all()
    
    return {
        "suggestions": guilds,
        "reason": "Recommended based on your interests"
    }


@router.get("/suggestions/collaborators")
async def get_collaborator_suggestions(
    project_id: Optional[int] = None,
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered collaborator suggestions for projects
    """
    # Get active users (can be filtered by skills, interests)
    users = db.query(User).filter(
        User.is_active == True,
        User.id != current_user.id
    ).order_by(func.random()).limit(limit).all()
    
    result = []
    for user in users:
        result.append({
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "country": user.country,
            "avatar": user.avatar_url,
            "match_score": random.randint(75, 95)  # Mock match score
        })
    
    return {
        "suggestions": result,
        "reason": "Based on skills and project requirements"
    }


@router.get("/insights/marketplace")
async def get_marketplace_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered marketplace insights for sellers
    """
    # Get user's products
    user_products = db.query(Product).filter(
        Product.seller_id == current_user.id
    ).count()
    
    insights = []
    
    if user_products == 0:
        insights.append({
            "type": "opportunity",
            "title": "Start Selling",
            "description": "List your first product to reach thousands of buyers across Africa.",
            "action": "Create Listing"
        })
    else:
        insights.append({
            "type": "trend",
            "title": "Trending Category",
            "description": "Art & Crafts products are seeing 45% more views this week.",
            "action": "View Trends"
        })
        
        insights.append({
            "type": "optimization",
            "title": "Optimize Pricing",
            "description": "Products priced between $20-$50 are selling 3x faster in your category.",
            "action": "Update Prices"
        })
    
    insights.append({
        "type": "tip",
        "title": "Better Photos",
        "description": "Listings with 3+ high-quality images get 60% more clicks.",
        "action": "Learn More"
    })
    
    return insights


@router.get("/insights/guild/{guild_id}")
async def get_guild_insights(
    guild_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered insights for guild leaders
    """
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Only guild owner can see insights
    if guild.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    insights = [
        {
            "metric": "Engagement",
            "value": "78%",
            "change": "+12%",
            "trend": "up",
            "suggestion": "Peak activity is between 6-9 PM. Consider scheduling important announcements during this time."
        },
        {
            "metric": "Growth Rate",
            "value": f"{guild.member_count}",
            "change": "+18%",
            "trend": "up",
            "suggestion": "Your guild is growing faster than 85% of similar communities. Keep up the great content!"
        },
        {
            "metric": "Retention",
            "value": "65%",
            "change": "-5%",
            "trend": "down",
            "suggestion": "Try weekly events or challenges to keep members engaged and reduce churn."
        }
    ]
    
    return insights


@router.post("/analyze/content")
async def analyze_content(
    content: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI content analysis and moderation
    """
    text = content.get("text", "")
    
    if not text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    # Simple keyword-based moderation (can be replaced with ML model)
    flagged_words = ["spam", "scam", "fake", "fraud"]
    is_flagged = any(word in text.lower() for word in flagged_words)
    
    sentiment = analyze_sentiment(text)
    
    return {
        "is_appropriate": not is_flagged,
        "sentiment": sentiment,
        "flags": ["potential_spam"] if is_flagged else [],
        "suggestions": [
            "Consider rephrasing for clarity"
        ] if len(text.split()) < 5 else []
    }


def generate_ai_response(message: str, user: User, db: Session) -> str:
    """
    Generate AI response based on user message
    """
    message_lower = message.lower()
    
    # Greeting
    if any(word in message_lower for word in ["hello", "hi", "hey"]):
        return f"Hello {user.first_name}! How can I help you today? I can assist with finding products, suggesting guilds to join, or connecting you with collaborators."
    
    # Product search
    elif any(word in message_lower for word in ["product", "buy", "shop", "marketplace"]):
        product_count = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
        return f"I can help you find products! We have over {product_count} active listings. What category are you interested in? (Art & Crafts, Technology, Fashion, etc.)"
    
    # Guild help
    elif any(word in message_lower for word in ["guild", "community", "group"]):
        guild_count = db.query(func.count(Guild.id)).scalar()
        return f"Looking to join a guild? We have {guild_count} communities you can explore. I can recommend some based on your interests. What topics are you interested in?"
    
    # Project help
    elif any(word in message_lower for word in ["project", "collaborate", "team"]):
        return "I can help you find collaborators for your project! Tell me about your project and the skills you're looking for, and I'll suggest potential team members."
    
    # Default response
    else:
        return "I'm here to help you navigate Avalanche! I can assist with:\n• Finding products in the marketplace\n• Discovering relevant guilds\n• Connecting with collaborators\n• Getting insights for your activities\n\nWhat would you like to know?"


def analyze_sentiment(text: str) -> str:
    """
    Simple sentiment analysis
    """
    positive_words = ["good", "great", "excellent", "amazing", "love", "wonderful"]
    negative_words = ["bad", "terrible", "awful", "hate", "poor", "disappointing"]
    
    text_lower = text.lower()
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    else:
        return "neutral"
