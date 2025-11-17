"""
User Settings Management
Handles password changes, email changes, notification settings, privacy settings, data export, and account deletion
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import json
import os

from database import get_db, User
from auth import get_current_user, get_password_hash, verify_password

router = APIRouter(prefix="/settings", tags=["User Settings"])


# Pydantic models
class PasswordChange(BaseModel):
    current_password: str
    new_password: str


class EmailChange(BaseModel):
    new_email: EmailStr
    password: str


class NotificationSettings(BaseModel):
    account_activity: bool
    security_alerts: bool
    new_bids: bool
    item_sold: bool


class PrivacySettings(BaseModel):
    share_anonymized_data: bool
    contribute_to_ai: bool
    personalized_recommendations: bool


class AccountDeletion(BaseModel):
    password: str
    confirmation: str  # Must be "DELETE" to confirm


# Password change endpoint
@router.post("/password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    # Verify current password
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )

    # Validate new password
    if len(password_data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 8 characters long"
        )

    # Update password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()

    return {
        "success": True,
        "message": "Password changed successfully"
    }


# Email change endpoint
@router.post("/email")
async def change_email(
    email_data: EmailChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Change user email address
    """
    # Verify password
    if not verify_password(email_data.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )

    # Check if email is already in use
    existing_user = db.query(User).filter(User.email == email_data.new_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address is already in use"
        )

    # Update email
    current_user.email = email_data.new_email
    db.commit()

    return {
        "success": True,
        "message": "Email address updated successfully",
        "new_email": email_data.new_email
    }


# Notification settings
@router.get("/notifications")
async def get_notification_settings(
    current_user: User = Depends(get_current_user)
):
    """
    Get current notification settings
    """
    return {
        "account_activity": current_user.notify_account_activity,
        "security_alerts": current_user.notify_security_alerts,
        "new_bids": current_user.notify_new_bids,
        "item_sold": current_user.notify_item_sold
    }


@router.put("/notifications")
async def update_notification_settings(
    settings: NotificationSettings,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update notification settings
    """
    current_user.notify_account_activity = settings.account_activity
    current_user.notify_security_alerts = settings.security_alerts
    current_user.notify_new_bids = settings.new_bids
    current_user.notify_item_sold = settings.item_sold

    db.commit()

    return {
        "success": True,
        "message": "Notification settings updated successfully",
        "settings": {
            "account_activity": settings.account_activity,
            "security_alerts": settings.security_alerts,
            "new_bids": settings.new_bids,
            "item_sold": settings.item_sold
        }
    }


# Privacy settings
@router.get("/privacy")
async def get_privacy_settings(
    current_user: User = Depends(get_current_user)
):
    """
    Get current privacy settings
    """
    return {
        "share_anonymized_data": current_user.share_anonymized_data,
        "contribute_to_ai": current_user.contribute_to_ai,
        "personalized_recommendations": current_user.personalized_recommendations
    }


@router.put("/privacy")
async def update_privacy_settings(
    settings: PrivacySettings,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update privacy settings
    """
    current_user.share_anonymized_data = settings.share_anonymized_data
    current_user.contribute_to_ai = settings.contribute_to_ai
    current_user.personalized_recommendations = settings.personalized_recommendations

    db.commit()

    return {
        "success": True,
        "message": "Privacy settings updated successfully",
        "settings": {
            "share_anonymized_data": settings.share_anonymized_data,
            "contribute_to_ai": settings.contribute_to_ai,
            "personalized_recommendations": settings.personalized_recommendations
        }
    }


# Data export endpoint
@router.get("/export-data")
async def export_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Export all user data in JSON format
    """
    # Collect user data
    user_data = {
        "profile": {
            "id": current_user.id,
            "email": current_user.email,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "country": current_user.country,
            "bio": current_user.bio,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        },
        "subscription": {
            "ai_tier": current_user.ai_tier,
            "ai_tier_expires_at": current_user.ai_tier_expires_at.isoformat() if current_user.ai_tier_expires_at else None,
            "ai_requests_used": current_user.ai_requests_used
        },
        "notification_settings": {
            "account_activity": current_user.notify_account_activity,
            "security_alerts": current_user.notify_security_alerts,
            "new_bids": current_user.notify_new_bids,
            "item_sold": current_user.notify_item_sold
        },
        "privacy_settings": {
            "share_anonymized_data": current_user.share_anonymized_data,
            "contribute_to_ai": current_user.contribute_to_ai,
            "personalized_recommendations": current_user.personalized_recommendations
        },
        "guilds": [
            {
                "id": guild.id,
                "name": guild.name,
                "joined_at": guild.created_at.isoformat() if guild.created_at else None
            } for guild in current_user.guilds
        ],
        "owned_guilds": [
            {
                "id": guild.id,
                "name": guild.name,
                "created_at": guild.created_at.isoformat() if guild.created_at else None
            } for guild in current_user.owned_guilds
        ],
        "projects": [
            {
                "id": project.id,
                "title": project.title,
                "status": project.status,
                "created_at": project.created_at.isoformat() if project.created_at else None
            } for project in current_user.projects
        ],
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "created_at": product.created_at.isoformat() if product.created_at else None
            } for product in current_user.products
        ]
    }

    return {
        "success": True,
        "data": user_data,
        "exported_at": datetime.utcnow().isoformat(),
        "message": "User data exported successfully"
    }


# Clear recommendation history
@router.post("/clear-history")
async def clear_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Clear user's recommendation history
    This resets personalized recommendations
    """
    # Reset AI usage to clear recommendation patterns
    current_user.ai_requests_used = 0

    db.commit()

    return {
        "success": True,
        "message": "Recommendation history cleared successfully"
    }


# Account deletion endpoint
@router.delete("/account")
async def delete_account(
    deletion_data: AccountDeletion,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Permanently delete user account
    """
    # Verify password
    if not verify_password(deletion_data.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is incorrect"
        )

    # Verify confirmation
    if deletion_data.confirmation != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Confirmation must be 'DELETE'"
        )

    # Instead of hard deleting, mark as inactive (soft delete)
    # This preserves referential integrity with related records
    current_user.is_active = False
    current_user.email = f"deleted_{current_user.id}@avalanche.deleted"
    current_user.username = f"deleted_{current_user.id}"

    db.commit()

    return {
        "success": True,
        "message": "Account deleted successfully"
    }


# Language preference endpoint
@router.get("/language")
async def get_language_preference(
    current_user: User = Depends(get_current_user)
):
    """
    Get user's preferred language
    """
    return {
        "language": current_user.preferred_language or "en"
    }


@router.put("/language")
async def update_language_preference(
    language: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user's preferred language
    """
    # Validate language code
    valid_languages = ["en", "es", "fr", "de"]
    if language not in valid_languages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid language code. Must be one of: {', '.join(valid_languages)}"
        )

    current_user.preferred_language = language
    db.commit()

    return {
        "success": True,
        "message": "Language preference updated successfully",
        "language": language
    }
