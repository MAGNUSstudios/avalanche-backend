from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel

from database import get_db, User
from auth import get_current_user, get_current_admin

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime


# TODO: Create Notification model in database.py
# For now using mock data


@router.get("/list")
async def get_notifications(
    limit: int = 20,
    offset: int = 0,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user notifications with pagination
    """
    # TODO: Query from Notification table when model is created
    # For now returning mock data
    
    notifications = generate_mock_notifications(current_user.id)
    
    if unread_only:
        notifications = [n for n in notifications if not n["is_read"]]
    
    total = len(notifications)
    notifications = notifications[offset:offset + limit]
    
    return {
        "notifications": notifications,
        "total": total,
        "unread_count": sum(1 for n in notifications if not n["is_read"])
    }


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread notifications
    """
    # TODO: Query from Notification table
    notifications = generate_mock_notifications(current_user.id)
    unread_count = sum(1 for n in notifications if not n["is_read"])
    
    return {"unread_count": unread_count}


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark single notification as read
    """
    # TODO: Update Notification table
    # For now just returning success
    
    return {
        "message": "Notification marked as read",
        "notification_id": notification_id
    }


@router.post("/mark-all-read")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all notifications as read
    """
    # TODO: Bulk update Notification table
    
    return {
        "message": "All notifications marked as read"
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a notification
    """
    # TODO: Delete from Notification table
    
    return {
        "message": "Notification deleted",
        "notification_id": notification_id
    }


@router.get("/settings")
async def get_notification_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user notification preferences
    """
    # TODO: Query from UserNotificationSettings table
    
    return {
        "email_notifications": True,
        "push_notifications": True,
        "guild_updates": True,
        "marketplace_updates": True,
        "project_updates": True,
        "message_notifications": True,
        "ai_insights": True,
        "weekly_digest": False
    }


@router.put("/settings")
async def update_notification_settings(
    settings: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user notification preferences
    """
    # TODO: Update UserNotificationSettings table
    
    return {
        "message": "Notification settings updated",
        "settings": settings
    }


@router.get("/recent-activity")
async def get_recent_activity(
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's recent activity feed
    """
    # TODO: Query from ActivityLog table
    
    activities = [
        {
            "id": 1,
            "type": "purchase",
            "title": "Order Completed",
            "description": "Your order #1234 has been delivered",
            "timestamp": datetime.utcnow() - timedelta(hours=2),
            "icon": "shopping-bag"
        },
        {
            "id": 2,
            "type": "guild",
            "title": "New Guild Member",
            "description": "John Doe joined your guild 'Web Developers'",
            "timestamp": datetime.utcnow() - timedelta(hours=5),
            "icon": "users"
        },
        {
            "id": 3,
            "type": "project",
            "title": "Task Completed",
            "description": "Sarah completed 'Design Homepage' in Project Alpha",
            "timestamp": datetime.utcnow() - timedelta(hours=12),
            "icon": "check-circle"
        }
    ]
    
    return activities[:limit]


def generate_mock_notifications(user_id: int) -> List[dict]:
    """
    Generate mock notifications for testing
    """
    now = datetime.utcnow()

    return [
        {
            "id": 1,
            "type": "message",
            "title": "New Message",
            "message": "You have a new message from John Doe",
            "link": "/messages",
            "is_read": False,
            "created_at": now - timedelta(minutes=15)
        },
        {
            "id": 2,
            "type": "order",
            "title": "Order Shipped",
            "message": "Your order #1234 has been shipped",
            "link": "/orders/1234",
            "is_read": False,
            "created_at": now - timedelta(hours=2)
        },
        {
            "id": 3,
            "type": "guild",
            "title": "Guild Invitation",
            "message": "You've been invited to join 'Tech Innovators' guild",
            "link": "/guilds/invite/abc123",
            "is_read": True,
            "created_at": now - timedelta(hours=5)
        },
        {
            "id": 4,
            "type": "payment",
            "title": "Payment Received",
            "message": "You received $50.00 for Product Sale",
            "link": "/wallet",
            "is_read": True,
            "created_at": now - timedelta(hours=8)
        },
        {
            "id": 5,
            "type": "project",
            "title": "Task Assignment",
            "message": "You've been assigned to 'Design Landing Page' task",
            "link": "/projects/5",
            "is_read": False,
            "created_at": now - timedelta(hours=12)
        },
        {
            "id": 6,
            "type": "ai",
            "title": "AI Insight",
            "message": "Your marketplace listing could use better photos",
            "link": "/marketplace/my-listings",
            "is_read": True,
            "created_at": now - timedelta(days=1)
        },
        {
            "id": 7,
            "type": "system",
            "title": "Platform Update",
            "message": "New features available! Check out our marketplace improvements",
            "link": "/whats-new",
            "is_read": True,
            "created_at": now - timedelta(days=2)
        }
    ]


def generate_admin_mock_notifications(admin_id: int) -> List[dict]:
    """
    Generate mock admin notifications for testing
    """
    now = datetime.utcnow()

    return [
        {
            "id": 1,
            "type": "alert",
            "title": "High Transaction Volume",
            "message": "Transaction volume increased by 35% in the last hour",
            "link": "/admin/transactions",
            "is_read": False,
            "created_at": now - timedelta(minutes=10)
        },
        {
            "id": 2,
            "type": "user",
            "title": "New User Registration",
            "message": "5 new users registered in the last hour",
            "link": "/admin/users",
            "is_read": False,
            "created_at": now - timedelta(minutes=30)
        },
        {
            "id": 3,
            "type": "dispute",
            "title": "Payment Dispute",
            "message": "New payment dispute for Order #4521 requires attention",
            "link": "/admin/transactions",
            "is_read": False,
            "created_at": now - timedelta(hours=1)
        },
        {
            "id": 4,
            "type": "system",
            "title": "Server Performance",
            "message": "API response time increased to 450ms average",
            "link": "/admin/dashboard",
            "is_read": True,
            "created_at": now - timedelta(hours=3)
        },
        {
            "id": 5,
            "type": "guild",
            "title": "New Guild Created",
            "message": "'AI Developers Community' guild was created and pending approval",
            "link": "/admin/guilds",
            "is_read": False,
            "created_at": now - timedelta(hours=5)
        },
        {
            "id": 6,
            "type": "revenue",
            "title": "Revenue Milestone",
            "message": "Platform revenue reached $50,000 this month",
            "link": "/admin/dashboard",
            "is_read": True,
            "created_at": now - timedelta(hours=8)
        },
        {
            "id": 7,
            "type": "security",
            "title": "Security Alert",
            "message": "Multiple failed login attempts detected from IP 192.168.1.100",
            "link": "/admin/security",
            "is_read": True,
            "created_at": now - timedelta(days=1)
        },
        {
            "id": 8,
            "type": "ai",
            "title": "AI Usage Alert",
            "message": "AI query volume increased by 50% this week",
            "link": "/admin/ai-analytics",
            "is_read": True,
            "created_at": now - timedelta(days=1)
        }
    ]


# ===== ADMIN NOTIFICATION ENDPOINTS =====

@router.get("/admin/list")
async def get_admin_notifications(
    limit: int = 20,
    offset: int = 0,
    unread_only: bool = False,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get admin notifications with pagination
    """
    from database import Admin

    # TODO: Query from Notification table when model is created
    # For now returning mock data

    notifications = generate_admin_mock_notifications(current_admin.id)

    if unread_only:
        notifications = [n for n in notifications if not n["is_read"]]

    total = len(notifications)
    unread_count = sum(1 for n in notifications if not n["is_read"])
    notifications = notifications[offset:offset + limit]

    return {
        "notifications": notifications,
        "total": total,
        "unread_count": unread_count
    }


@router.get("/admin/unread-count")
async def get_admin_unread_count(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get count of unread admin notifications
    """
    from database import Admin

    # TODO: Query from Notification table
    notifications = generate_admin_mock_notifications(current_admin.id)
    unread_count = sum(1 for n in notifications if not n["is_read"])

    return {"unread_count": unread_count}


@router.post("/admin/{notification_id}/read")
async def mark_admin_notification_read(
    notification_id: int,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mark single admin notification as read
    """
    from database import Admin

    # TODO: Update Notification table
    # For now just returning success

    return {
        "message": "Notification marked as read",
        "notification_id": notification_id
    }


@router.post("/admin/mark-all-read")
async def mark_all_admin_read(
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mark all admin notifications as read
    """
    from database import Admin

    # TODO: Bulk update Notification table

    return {
        "message": "All notifications marked as read"
    }
