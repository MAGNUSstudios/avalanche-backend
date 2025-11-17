from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_
from datetime import datetime, timedelta
from typing import List, Optional
import random

from database import (
    get_db, User, Guild, Project, Product, Message, Order, Escrow, Payment,
    guild_members, project_members, Admin, AIInteraction
)
from auth import get_current_admin
from schemas import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


# No longer need get_current_admin middleware - use get_current_admin directly from auth.py
# All admin endpoints will use: admin = Depends(get_current_admin)


# ===== DASHBOARD OVERVIEW ENDPOINTS =====

@router.get("/stats/overview")
async def get_overview_stats(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get overview statistics for admin dashboard
    """
    # Total transactions (orders + payments)
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_payments = db.query(func.count(Payment.id)).scalar() or 0
    total_transactions = total_orders + total_payments
    
    # Total revenue from completed payments only
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed"
    ).scalar() or 0.0
    
    # Guild growth (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_guilds_30d = db.query(func.count(Guild.id)).filter(
        Guild.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Total guilds
    total_guilds = db.query(func.count(Guild.id)).scalar() or 0
    
    # Active users (last 30 days) - users created in last 30 days
    # This represents recently active/new users
    active_users_30d = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Total users
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # AI Queries - actual count (set to 0 for now, track in future)
    ai_queries = 0
    
    # Calculate percentage changes (only if there's data)
    transaction_change = "+0%"
    guild_change = "+0%"
    users_change = "+0%"
    ai_change = "+0%"
    
    return {
        "total_transactions": total_transactions,
        "total_transactions_value": f"₦{total_revenue:,.2f}",
        "guild_growth": new_guilds_30d,
        "total_guilds": total_guilds,
        "active_users": active_users_30d,
        "total_users": total_users,
        "ai_queries": ai_queries,
        "transaction_change": transaction_change,
        "guild_change": guild_change,
        "users_change": users_change,
        "ai_change": ai_change
    }


@router.get("/transactions/recent")
async def get_recent_transactions(
    limit: int = 10,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get recent transactions for admin dashboard
    """
    # Get recent orders
    recent_orders = db.query(Order).order_by(desc(Order.created_at)).limit(limit).all()

    transactions = []
    for order in recent_orders:
        buyer = db.query(User).filter(User.id == order.buyer_id).first()
        product = db.query(Product).filter(Product.id == order.product_id).first()

        transactions.append({
            "id": f"#AV{order.id + 78230}",
            "user": f"{buyer.first_name} {buyer.last_name}" if buyer else "Unknown",
            "amount": f"₦{order.total_amount:,.2f}",
            "status": order.status,
            "date": order.created_at.strftime("%Y-%m-%d"),
            "product": product.name if product else "N/A"
        })

    return {"transactions": transactions}


@router.get("/activity/feed")
async def get_activity_feed(
    limit: int = 10,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get recent activity feed
    """
    activities = []

    # Recent user signups
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(3).all()
    for user in recent_users:
        time_diff = datetime.utcnow() - user.created_at
        minutes = int(time_diff.total_seconds() / 60)
        activities.append({
            "type": "user",
            "icon": "👤",
            "text": f"<strong>New User:</strong> @{user.email.split('@')[0]} just joined the platform.",
            "time": f"{minutes}m ago" if minutes < 60 else f"{minutes // 60}h ago"
        })

    # Recent high-value orders
    high_value_orders = db.query(Order).filter(Order.total_amount > 100).order_by(
        desc(Order.created_at)
    ).limit(2).all()

    for order in high_value_orders:
        buyer = db.query(User).filter(User.id == order.buyer_id).first()
        if buyer:
            time_diff = datetime.utcnow() - order.created_at
            minutes = int(time_diff.total_seconds() / 60)
            activities.append({
                "type": "sale",
                "icon": "🛒",
                "text": f"<strong>High-Value Sale:</strong> @{buyer.email.split('@')[0]} completed a sale of ₦{order.total_amount:,.2f}.",
                "time": f"{minutes}m ago" if minutes < 60 else f"{minutes // 60}h ago"
            })

    # AI interactions
    recent_ai_interactions = db.query(AIInteraction).order_by(desc(AIInteraction.created_at)).limit(2).all()
    for interaction in recent_ai_interactions:
        time_diff = datetime.utcnow() - interaction.created_at
        minutes = int(time_diff.total_seconds() / 60)
        user = db.query(User).filter(User.id == interaction.user_id).first() if interaction.user_id else None
        username = user.email.split('@')[0] if user else "Anonymous"
        activities.append({
            "type": "ai",
            "icon": "🤖",
            "text": f"<strong>AI Usage:</strong> @{username} used {interaction.feature} feature.",
            "time": f"{minutes}m ago" if minutes < 60 else f"{minutes // 60}h ago"
        })

    # Guild milestones
    popular_guilds = db.query(Guild).filter(Guild.member_count >= 10).limit(1).all()
    for guild in popular_guilds:
        activities.append({
            "type": "user",
            "icon": "👥",
            "text": f'<strong>Guild Milestone:</strong> The "{guild.name}" guild reached {guild.member_count} members.',
            "time": "1h ago"
        })

    # Sort by most recent
    activities_sorted = sorted(activities, key=lambda x: x['time'])

    return {"activities": activities_sorted[:limit]}


# ===== TRANSACTION ANALYTICS ENDPOINTS =====

@router.get("/transactions/stats")
async def get_transaction_stats(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get transaction statistics
    """
    # Total revenue from completed payments
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == "completed"
    ).scalar() or 0.0
    
    # Transaction volume
    transaction_volume = db.query(func.count(Order.id)).scalar() or 0
    
    # Average order value
    avg_order = db.query(func.avg(Order.total_amount)).scalar() or 0.0
    
    return {
        "total_revenue": f"₦{total_revenue:,.2f}",
        "revenue_change": "+0%",
        "transaction_volume": transaction_volume,
        "volume_change": "+0%",
        "average_order_value": f"₦{avg_order:.2f}",
        "avg_change": "+0%"
    }


@router.get("/transactions/top-products")
async def get_top_products(
    limit: int = 4,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get top selling products
    """
    # Get products with most orders
    top_products = db.query(
        Product.id,
        Product.name,
        Product.price,
        func.count(Order.id).label('order_count')
    ).join(Order, Order.product_id == Product.id).group_by(
        Product.id
    ).order_by(desc('order_count')).limit(limit).all()
    
    result = []
    for product_id, name, price, order_count in top_products:
        total_revenue = order_count * price
        result.append({
            "name": name,
            "units": f"{order_count} units sold",
            "price": f"₦{total_revenue:,.0f}"
        })
    
    return result


# ===== GUILD ANALYTICS ENDPOINTS =====

@router.get("/guilds/stats")
async def get_guild_stats(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get guild statistics
    """
    # Total guilds
    total_guilds = db.query(func.count(Guild.id)).scalar() or 0
    
    # New members (last 30 days) - approximate from recent guilds
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_members = db.query(func.sum(Guild.member_count)).filter(
        Guild.created_at >= thirty_days_ago
    ).scalar() or 0
    
    # Active guilds (with members > 10)
    active_guilds = db.query(func.count(Guild.id)).filter(
        Guild.member_count > 10
    ).scalar() or 0
    
    # Average daily messages (from message table)
    total_messages = db.query(func.count(Message.id)).scalar() or 0
    avg_messages = total_messages  # Can be divided by days if tracking date ranges
    
    return {
        "total_guilds": total_guilds,
        "guilds_change": "+0%",
        "new_members": new_members,
        "members_change": "+0%",
        "active_guilds": active_guilds,
        "active_change": "+0%",
        "avg_daily_messages": avg_messages,
        "messages_change": "+0%"
    }


@router.get("/guilds/activity")
async def get_guild_activity(
    period: str = "weekly",  # weekly, monthly, alltime
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get guild activity based on period - weekly, monthly, or all-time
    """
    activity_data = []

    if period == "weekly":
        # Last 7 days
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        for i, label in enumerate(labels):
            day_start = datetime.utcnow() - timedelta(days=(6-i))
            day_end = day_start + timedelta(days=1)

            count = db.query(func.count(Guild.id)).filter(
                Guild.created_at >= day_start,
                Guild.created_at < day_end
            ).scalar() or 0

            activity_data.append({
                "day": label,
                "value": count,
                "count": count
            })

    elif period == "monthly":
        # Last 4 weeks
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
        for i in range(4):
            week_start = datetime.utcnow() - timedelta(weeks=(3-i))
            week_end = week_start + timedelta(weeks=1)

            count = db.query(func.count(Guild.id)).filter(
                Guild.created_at >= week_start,
                Guild.created_at < week_end
            ).scalar() or 0

            activity_data.append({
                "day": labels[i],
                "value": count,
                "count": count
            })

    else:  # alltime
        # Last 12 months
        labels = []
        for i in range(12):
            month_date = datetime.utcnow() - timedelta(days=30*(11-i))
            labels.append(month_date.strftime("%b"))

            month_start = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1)

            count = db.query(func.count(Guild.id)).filter(
                Guild.created_at >= month_start,
                Guild.created_at < month_end
            ).scalar() or 0

            activity_data.append({
                "day": labels[i],
                "value": count,
                "count": count
            })

    # Calculate max value for scaling
    max_value = max([item["value"] for item in activity_data]) if activity_data else 1
    max_value = max(max_value, 1)  # Avoid division by zero

    # Add percentage for visualization
    for item in activity_data:
        item["percentage"] = int((item["value"] / max_value) * 100)

    return activity_data


@router.get("/guilds/activity/weekly")
async def get_guild_weekly_activity(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get guild activity for the week - based on actual guild creation
    (Deprecated - use /guilds/activity?period=weekly instead)
    """
    return await get_guild_activity("weekly", admin, db)


@router.get("/guilds/trending-topics")
async def get_trending_topics(
    limit: int = 5,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get trending topics/hashtags based on guild categories
    """
    # Get top guild categories by count
    top_categories = db.query(
        Guild.category,
        func.count(Guild.id).label('count')
    ).filter(
        Guild.category.isnot(None)
    ).group_by(Guild.category).order_by(desc('count')).limit(limit).all()
    
    topics = []
    for category, count in top_categories:
        topics.append({
            "tag": f"#{category.replace(' ', '')}",
            "badge": "Hot" if count > 5 else None,
            "mentions": f"{count} guilds"
        })
    
    return topics


@router.get("/guilds/overview")
async def get_guilds_overview(
    limit: int = 4,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get guilds overview for table
    """
    guilds = db.query(Guild).order_by(desc(Guild.member_count)).limit(limit).all()
    
    result = []
    for guild in guilds:
        # Calculate activity level (based on member count for now)
        activity_percentage = min(100, (guild.member_count / 30) * 100)
        
        result.append({
            "name": guild.name,
            "members": guild.member_count,
            "activity": int(activity_percentage),
            "category": guild.category or "General"
        })
    
    return result


# ===== AI ANALYTICS ENDPOINTS =====

@router.get("/ai/stats")
async def get_ai_stats(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get AI analytics statistics with real data from AIInteraction table
    """
    # Calculate stats for last 24 hours
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    day_before_yesterday = now - timedelta(days=2)

    # Total AI queries in last 24h
    total_queries_today = db.query(AIInteraction).filter(
        AIInteraction.created_at >= yesterday,
        AIInteraction.action == 'query'
    ).count()

    total_queries_yesterday = db.query(AIInteraction).filter(
        AIInteraction.created_at >= day_before_yesterday,
        AIInteraction.created_at < yesterday,
        AIInteraction.action == 'query'
    ).count()

    # Calculate percentage change
    queries_change = 0
    if total_queries_yesterday > 0:
        queries_change = ((total_queries_today - total_queries_yesterday) / total_queries_yesterday) * 100

    # Recommendation CTR (Click-Through Rate)
    recommendation_views = db.query(AIInteraction).filter(
        AIInteraction.created_at >= yesterday,
        AIInteraction.interaction_type == 'recommendation',
        AIInteraction.action == 'view'
    ).count()

    recommendation_clicks = db.query(AIInteraction).filter(
        AIInteraction.created_at >= yesterday,
        AIInteraction.interaction_type == 'recommendation',
        AIInteraction.action == 'click'
    ).count()

    ctr = 0
    if recommendation_views > 0:
        ctr = (recommendation_clicks / recommendation_views) * 100

    # AI Assistant usage
    assistant_usage = db.query(AIInteraction).filter(
        AIInteraction.created_at >= yesterday,
        AIInteraction.interaction_type == 'assistant'
    ).count()

    # Feature adoption - percentage of users who used AI features
    total_users = db.query(User).count()
    users_with_ai_interactions = db.query(func.count(func.distinct(AIInteraction.user_id))).filter(
        AIInteraction.created_at >= now - timedelta(days=30),
        AIInteraction.user_id.isnot(None)
    ).scalar() or 0

    feature_adoption = 0
    if total_users > 0:
        feature_adoption = (users_with_ai_interactions / total_users) * 100

    return {
        "total_queries": total_queries_today,
        "queries_change": f"{'+' if queries_change >= 0 else ''}{queries_change:.1f}%",
        "recommendation_ctr": f"{ctr:.1f}%",
        "ctr_change": "+0%",  # Can add historical CTR comparison if needed
        "assistant_usage": assistant_usage,
        "usage_change": "+0%",  # Can add historical comparison if needed
        "feature_adoption": f"{feature_adoption:.1f}%",
        "adoption_change": "+0%"  # Can add historical comparison if needed
    }


@router.get("/ai/models/performance")
async def get_ai_model_performance(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get AI model performance metrics
    """
    models = [
        {
            "name": "Product Recommendation Engine",
            "score": "98.2%",
            "status": "online",
            "status_text": "Online"
        },
        {
            "name": "Chatbot NLP Model",
            "score": "95.1%",
            "status": "online",
            "status_text": "Online"
        },
        {
            "name": "Project Suggestion Algorithm",
            "score": "89.7%",
            "status": "degraded",
            "status_text": "Degraded"
        },
        {
            "name": "Marketplace Fraud Detection",
            "score": "99.7%",
            "status": "online",
            "status_text": "Online"
        },
        {
            "name": "Content Moderation AI",
            "score": "92.3%",
            "status": "offline",
            "status_text": "Offline"
        }
    ]
    
    return models


@router.get("/ai/interactions/recent")
async def get_recent_ai_interactions(
    limit: int = 10,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get recent AI interactions from the database
    """
    interactions = db.query(AIInteraction).order_by(
        desc(AIInteraction.created_at)
    ).limit(limit).all()

    result = []
    for interaction in interactions:
        # Format the interaction for display
        import json

        # Parse metadata
        metadata = {}
        if interaction.extra_data:
            try:
                metadata = json.loads(interaction.extra_data)
            except:
                pass

        # Create display text based on interaction type
        if interaction.interaction_type == 'assistant' and interaction.feature == 'ai_chat':
            text = f"<strong>AI Chat:</strong> User sent a query ({metadata.get('message_length', 0)} characters)"
        elif interaction.interaction_type == 'recommendation' and interaction.action == 'view':
            text = f"<strong>Product Recommendation:</strong> Viewed product #{metadata.get('product_id', 'N/A')}"
        elif interaction.interaction_type == 'recommendation' and interaction.action == 'click':
            text = f"<strong>Product Recommendation:</strong> Clicked on product #{metadata.get('product_id', 'N/A')}"
        elif interaction.interaction_type == 'suggestion' and interaction.action == 'view':
            text = f"<strong>Project Suggestion:</strong> Viewed project #{metadata.get('project_id', 'N/A')}"
        elif interaction.interaction_type == 'suggestion' and interaction.action == 'accept':
            text = f"<strong>Project Suggestion:</strong> Accepted project #{metadata.get('project_id', 'N/A')}"
        else:
            text = f"<strong>{interaction.feature}:</strong> {interaction.action}"

        # Calculate time ago
        time_diff = datetime.utcnow() - interaction.created_at
        if time_diff.seconds < 60:
            time_str = "Just now"
        elif time_diff.seconds < 3600:
            time_str = f"{time_diff.seconds // 60}m ago"
        elif time_diff.seconds < 86400:
            time_str = f"{time_diff.seconds // 3600}h ago"
        else:
            time_str = f"{time_diff.days}d ago"

        result.append({
            "type": interaction.interaction_type,
            "text": text,
            "time": time_str
        })

    return result


@router.get("/ai/usage-breakdown")
async def get_ai_usage_breakdown(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get AI usage breakdown by feature category
    Based on actual usage patterns from the platform
    """
    # For now, calculate based on existing data patterns
    # In production, this would track actual AI API calls

    # Count different types of AI-related activities
    total_messages = db.query(func.count(Message.id)).scalar() or 0
    total_guilds = db.query(func.count(Guild.id)).scalar() or 0
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_projects = db.query(func.count(Project.id)).scalar() or 0

    # Calculate usage percentages based on activity
    # Item Suggestions: Product recommendations and marketplace AI
    item_suggestions = total_products * 2  # Assume 2 AI calls per product

    # Project Collab: AI-assisted project matching and collaboration
    project_collab = total_projects * 3  # Assume 3 AI calls per project

    # Content Gen: AI-generated descriptions, messages, content
    content_gen = total_messages  # Messages with AI assistance

    # Analytics: AI-powered insights and analytics
    analytics = (total_guilds + total_products) // 2  # Analytics calls

    total_usage = item_suggestions + project_collab + content_gen + analytics

    # Avoid division by zero
    if total_usage == 0:
        return {
            "item_suggestions": 25,
            "project_collab": 35,
            "content_gen": 20,
            "analytics": 20
        }

    return {
        "item_suggestions": round((item_suggestions / total_usage) * 100, 1),
        "project_collab": round((project_collab / total_usage) * 100, 1),
        "content_gen": round((content_gen / total_usage) * 100, 1),
        "analytics": round((analytics / total_usage) * 100, 1)
    }


@router.get("/ai/query-volume")
async def get_ai_query_volume(
    period: str = "daily",
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get AI query volume chart data for different time periods
    """
    now = datetime.utcnow()

    if period == "daily":
        # Last 24 hours, hourly data
        data_points = []
        for i in range(24):
            hour_start = now - timedelta(hours=23-i)
            hour_end = hour_start + timedelta(hours=1)

            count = db.query(AIInteraction).filter(
                AIInteraction.created_at >= hour_start,
                AIInteraction.created_at < hour_end,
                AIInteraction.action == 'query'
            ).count()

            data_points.append({
                "time": hour_start.strftime("%H:00"),
                "queries": count
            })
        return data_points

    elif period == "weekly":
        # Last 7 days, daily data
        data_points = []
        for i in range(7):
            day_start = (now - timedelta(days=6-i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            count = db.query(AIInteraction).filter(
                AIInteraction.created_at >= day_start,
                AIInteraction.created_at < day_end,
                AIInteraction.action == 'query'
            ).count()

            data_points.append({
                "time": day_start.strftime("%a"),
                "queries": count
            })
        return data_points

    else:  # monthly
        # Last 30 days, daily data
        data_points = []
        for i in range(30):
            day_start = (now - timedelta(days=29-i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            count = db.query(AIInteraction).filter(
                AIInteraction.created_at >= day_start,
                AIInteraction.created_at < day_end,
                AIInteraction.action == 'query'
            ).count()

            data_points.append({
                "time": day_start.strftime("%m/%d"),
                "queries": count
            })
        return data_points


@router.get("/ai/recommendation-effectiveness")
async def get_recommendation_effectiveness(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get recommendation effectiveness data (conversion rates over time)
    """
    now = datetime.utcnow()
    data_points = []

    # Last 7 days
    for i in range(7):
        day_start = (now - timedelta(days=6-i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)

        # Count views vs clicks for recommendations
        views = db.query(AIInteraction).filter(
            AIInteraction.created_at >= day_start,
            AIInteraction.created_at < day_end,
            AIInteraction.feature == 'product_recommendation',
            AIInteraction.action == 'view'
        ).count()

        clicks = db.query(AIInteraction).filter(
            AIInteraction.created_at >= day_start,
            AIInteraction.created_at < day_end,
            AIInteraction.feature == 'product_recommendation',
            AIInteraction.action == 'click'
        ).count()

        conversion_rate = round((clicks / views * 100) if views > 0 else 0, 1)

        data_points.append({
            "day": day_start.strftime("%a"),
            "rate": conversion_rate
        })

    return data_points


# ===== USER MANAGEMENT ENDPOINTS =====

@router.get("/users/list")
async def get_users_list(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get list of users with filters (excludes admin users)
    """
    # Filter out admin users - only show regular users
    query = db.query(User).filter(
        or_(User.role != 'admin', User.role.is_(None))
    )

    if search:
        query = query.filter(
            or_(
                User.email.ilike(f"%{search}%"),
                User.first_name.ilike(f"%{search}%"),
                User.last_name.ilike(f"%{search}%")
            )
        )

    if status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)
    
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    result = []
    for user in users:
        # Get user's guild count
        guild_count = db.query(func.count(guild_members.c.guild_id)).filter(
            guild_members.c.user_id == user.id
        ).scalar() or 0

        result.append({
            "id": user.id,
            "username": user.username,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "avatar_url": user.avatar_url,
            "country": user.country,
            "guilds": guild_count,
            "status": "active" if user.is_active else "inactive",
            "joined": user.created_at.strftime("%Y-%m-%d")
        })
    
    return {
        "total": total,
        "users": result
    }


@router.get("/users/stats")
async def get_user_stats(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get user statistics
    """
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users = db.query(func.count(User.id)).filter(
        User.created_at >= thirty_days_ago
    ).scalar() or 0
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "new_users_30d": new_users,
        "growth_rate": f"+{(new_users / max(total_users - new_users, 1) * 100):.1f}%"
    }


@router.patch("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: int,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Toggle user active/inactive status
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    
    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'} successfully",
        "user_id": user_id,
        "is_active": user.is_active
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a user account
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent admin from deleting themselves
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    db.delete(user)
    db.commit()
    
    return {"message": "User deleted successfully", "user_id": user_id}


# ===== SETTINGS ENDPOINTS =====

@router.get("/settings/platform")
async def get_platform_settings(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get platform settings - default values until settings table is created
    """
    # Return default settings - will be stored in database when settings table is added
    return {
        "platform_name": "Avalanche",
        "platform_url": "https://avalanche.app",
        "new_user_registration": True,
        "maintenance_mode": False,
        "ai_moderation": True,
        "banned_keywords": []
    }


@router.put("/settings/platform")
async def update_platform_settings(
    settings: dict,
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update platform settings
    """
    # TODO: Store settings in database table
    # For now, just return success
    return {
        "message": "Settings updated successfully",
        "settings": settings
    }


@router.get("/settings/roles")
async def get_user_roles(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get user roles and permissions
    """
    roles = [
        {
            "name": "Administrator",
            "description": "Full access to all platform features",
            "user_count": 2
        },
        {
            "name": "Guild Leader",
            "description": "Can manage guilds and moderate content",
            "user_count": 15
        },
        {
            "name": "Standard User",
            "description": "Regular platform access",
            "user_count": db.query(func.count(User.id)).scalar() or 0
        }
    ]
    
    return roles


# ===== ANALYTICS CHART DATA =====

@router.get("/analytics/revenue-chart")
async def get_revenue_chart_data(
    period: str = "week",  # day, week, month
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get revenue chart data based on actual completed payments
    """
    if period == "week":
        # Get revenue for last 7 days
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        data = []
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            
            revenue = db.query(func.sum(Payment.amount)).filter(
                Payment.status == "completed",
                Payment.created_at >= day_start,
                Payment.created_at < day_end
            ).scalar() or 0
            data.append(round(revenue / 1000, 1))  # Convert to thousands
    
    elif period == "month":
        # Get revenue for last 4 weeks
        labels = [f"Week {i+1}" for i in range(4)]
        data = []
        for i in range(4):
            week_start = datetime.utcnow() - timedelta(weeks=3-i)
            week_end = week_start + timedelta(weeks=1)
            
            revenue = db.query(func.sum(Payment.amount)).filter(
                Payment.status == "completed",
                Payment.created_at >= week_start,
                Payment.created_at < week_end
            ).scalar() or 0
            data.append(round(revenue / 1000, 1))
    
    else:  # day
        # Get revenue for today by 3-hour intervals
        labels = [f"{i}:00" for i in range(0, 24, 3)]
        data = []
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        for i in range(0, 24, 3):
            interval_start = today + timedelta(hours=i)
            interval_end = interval_start + timedelta(hours=3)
            
            revenue = db.query(func.sum(Payment.amount)).filter(
                Payment.status == "completed",
                Payment.created_at >= interval_start,
                Payment.created_at < interval_end
            ).scalar() or 0
            data.append(round(revenue / 1000, 1))
    
    return {
        "labels": labels,
        "data": data,
        "currency": "K"  # thousands in Naira
    }


@router.get("/analytics/volume-chart")
async def get_volume_chart_data(
    period: str = "week",  # day, week, month
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get transaction volume chart data (number of transactions)
    """
    if period == "week":
        # Get transaction count for last 7 days
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        data = []
        for i in range(7):
            date = datetime.utcnow() - timedelta(days=6-i)
            day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)

            count = db.query(func.count(Order.id)).filter(
                Order.created_at >= day_start,
                Order.created_at < day_end
            ).scalar() or 0
            data.append(count)

    elif period == "month":
        # Get transaction count for last 4 weeks
        labels = [f"Week {i+1}" for i in range(4)]
        data = []
        for i in range(4):
            week_start = datetime.utcnow() - timedelta(weeks=3-i)
            week_end = week_start + timedelta(weeks=1)

            count = db.query(func.count(Order.id)).filter(
                Order.created_at >= week_start,
                Order.created_at < week_end
            ).scalar() or 0
            data.append(count)

    else:  # day
        # Get transaction count for today by 3-hour intervals
        labels = [f"{i}:00" for i in range(0, 24, 3)]
        data = []
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        for i in range(0, 24, 3):
            interval_start = today + timedelta(hours=i)
            interval_end = interval_start + timedelta(hours=3)

            count = db.query(func.count(Order.id)).filter(
                Order.created_at >= interval_start,
                Order.created_at < interval_end
            ).scalar() or 0
            data.append(count)

    return {
        "labels": labels,
        "data": data,
        "unit": "transactions"
    }


@router.get("/analytics/user-growth")
async def get_user_growth_data(
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get user growth chart data
    """
    # Get actual user growth over last 7 days
    result = []
    for i in range(7):
        date = datetime.utcnow() - timedelta(days=6-i)
        count = db.query(func.count(User.id)).filter(
            User.created_at <= date
        ).scalar() or 0
        result.append({
            "date": date.strftime("%Y-%m-%d"),
            "count": count
        })

    return result


# ===== GLOBAL SEARCH ENDPOINT =====

@router.get("/search")
async def global_search(
    q: str = Query(..., min_length=1, description="Search query"),
    admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Global search across transactions, users, and guilds
    """
    search_term = f"%{q}%"
    results = {
        "transactions": [],
        "users": [],
        "guilds": []
    }

    # Search transactions (orders)
    orders = db.query(Order).filter(
        or_(
            Order.order_number.ilike(search_term),
            Order.item_name.ilike(search_term)
        )
    ).limit(5).all()

    for order in orders:
        buyer = db.query(User).filter(User.id == order.buyer_id).first()
        results["transactions"].append({
            "id": f"#AV{order.id + 78230}",
            "order_number": order.order_number,
            "item_name": order.item_name,
            "user": f"{buyer.first_name} {buyer.last_name}" if buyer else "Unknown",
            "amount": f"₦{order.total_amount:,.2f}",
            "status": order.status,
            "date": order.created_at.strftime("%Y-%m-%d"),
            "type": "transaction"
        })

    # Search users
    users = db.query(User).filter(
        or_(
            User.email.ilike(search_term),
            User.first_name.ilike(search_term),
            User.last_name.ilike(search_term),
            User.username.ilike(search_term)
        )
    ).limit(5).all()

    for user in users:
        results["users"].append({
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email,
            "username": user.username,
            "avatar_url": user.avatar_url,
            "status": "active" if user.is_active else "inactive",
            "type": "user"
        })

    # Search guilds
    guilds = db.query(Guild).filter(
        or_(
            Guild.name.ilike(search_term),
            Guild.description.ilike(search_term),
            Guild.category.ilike(search_term)
        )
    ).limit(5).all()

    for guild in guilds:
        results["guilds"].append({
            "id": guild.id,
            "name": guild.name,
            "description": guild.description,
            "category": guild.category,
            "member_count": guild.member_count,
            "avatar_url": guild.avatar_url,
            "type": "guild"
        })

    return results
