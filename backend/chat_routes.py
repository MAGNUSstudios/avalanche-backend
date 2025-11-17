from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_, and_
from typing import List, Optional
from datetime import datetime
import json

from database import get_db, User, Message
from auth import get_current_user
from schemas import MessageCreate, MessageResponse
import ai_assistant
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of conversations for current user
    """
    # Get all users current user has messaged with
    sent_to = db.query(Message.recipient_id).filter(
        Message.sender_id == current_user.id
    ).distinct()
    
    received_from = db.query(Message.sender_id).filter(
        Message.recipient_id == current_user.id
    ).distinct()
    
    # Combine and get unique user IDs
    user_ids = set([uid[0] for uid in sent_to] + [uid[0] for uid in received_from])
    
    conversations = []
    for user_id in user_ids:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            continue
        
        # Get last message
        last_message = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
                and_(Message.sender_id == user_id, Message.recipient_id == current_user.id)
            )
        ).order_by(desc(Message.created_at)).first()
        
        # Count unread messages
        unread_count = db.query(func.count(Message.id)).filter(
            Message.sender_id == user_id,
            Message.recipient_id == current_user.id,
            Message.is_read == False
        ).scalar() or 0
        
        conversations.append({
            "user_id": user.id,
            "user_name": f"{user.first_name} {user.last_name}",
            "user_avatar": user.avatar_url,
            "last_message": {
                "content": last_message.content,
                "sent_at": last_message.created_at,
                "is_from_me": last_message.sender_id == current_user.id
            } if last_message else None,
            "unread_count": unread_count,
            "is_online": False  # TODO: Implement online status
        })
    
    # Sort by last message time
    conversations.sort(
        key=lambda x: x["last_message"]["sent_at"] if x["last_message"] else datetime.min,
        reverse=True
    )
    
    return conversations


@router.get("/conversation/{user_id}")
async def get_conversation_messages(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages in a conversation with specific user
    """
    # Verify other user exists
    other_user = db.query(User).filter(User.id == user_id).first()
    if not other_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get messages between users (including Ava messages with sender_id=0)
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user.id, Message.recipient_id == user_id),
            and_(Message.sender_id == user_id, Message.recipient_id == current_user.id),
            and_(Message.sender_id == 0, Message.recipient_id == current_user.id)  # Ava messages
        )
    ).order_by(Message.created_at.asc()).offset(skip).limit(limit).all()
    
    # Mark received messages as read
    db.query(Message).filter(
        Message.sender_id == user_id,
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    # Format messages
    result = []
    for msg in messages:
        # Handle Ava messages (sender_id = 0)
        if msg.sender_id == 0:
            result.append({
                "id": msg.id,
                "content": msg.content,
                "is_from_me": False,
                "sent_at": msg.created_at,
                "is_read": msg.is_read,
                "sender_name": "Ava AI",
                "sender_avatar": "/ava-avatar.png"
            })
        else:
            result.append({
                "id": msg.id,
                "content": msg.content,
                "is_from_me": msg.sender_id == current_user.id,
                "sent_at": msg.created_at,
                "is_read": msg.is_read
            })
    
    return {
        "other_user": {
            "id": other_user.id,
            "name": f"{other_user.first_name} {other_user.last_name}",
            "avatar": other_user.avatar_url,
            "is_online": False
        },
        "messages": result
    }


@router.post("/send")
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to another user
    """
    # Verify recipient exists
    recipient = db.query(User).filter(User.id == message_data.recipient_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient not found")
    
    # Prevent sending message to self
    if recipient.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send message to yourself")
    
    # Create message
    new_message = Message(
        content=message_data.content,
        sender_id=current_user.id,
        recipient_id=message_data.recipient_id
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Check if message mentions @Ava
    if "@ava" in message_data.content.lower() or "@Ava" in message_data.content:
        logger.info(f"🤖 @Ava mentioned in direct message by user {current_user.id}")

        # Get recent messages for context (last 10 messages between these users)
        recent_messages = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.recipient_id == message_data.recipient_id),
                and_(Message.sender_id == message_data.recipient_id, Message.recipient_id == current_user.id)
            )
        ).order_by(desc(Message.created_at)).limit(10).all()

        # Build conversation context
        conversation_context = []
        for msg in reversed(recent_messages):
            # Determine if message is from current user or recipient
            if msg.sender_id == current_user.id:
                sender_name = current_user.first_name
                role = "user"
            elif msg.sender_id == message_data.recipient_id:
                other_user = db.query(User).filter(User.id == message_data.recipient_id).first()
                sender_name = other_user.first_name if other_user else "User"
                role = "user"
            else:
                # This is an Ava message (sender_id = 0)
                sender_name = "Ava"
                role = "assistant"

            conversation_context.append({
                "role": role,
                "content": f"{sender_name}: {msg.content}"
            })

        # Extract the query (remove @Ava mention)
        query = message_data.content.replace("@Ava", "").replace("@ava", "").strip()

        # Get AI response with chat context
        try:
            ai_response = ai_assistant.chat_with_ai(
                message=query,
                user=current_user,
                db=db,
                conversation_history=conversation_context
            )

            # Create Ava's response message (sender_id=0, sent to current user)
            # If links are present, append them to the content in a parseable format
            message_content = ai_response["response"]
            if ai_response.get("links"):
                links_json = json.dumps(ai_response["links"])
                message_content += f"\n\n__LINKS__:{links_json}"

            ava_message = Message(
                content=message_content,
                sender_id=0,  # Special ID for Ava
                recipient_id=current_user.id
            )

            db.add(ava_message)
            db.commit()
            logger.info(f"✅ Ava responded in direct message to user {current_user.id}")

        except Exception as e:
            logger.error(f"❌ Error getting Ava response: {e}")

    return {
        "id": new_message.id,
        "content": new_message.content,
        "is_from_me": True,
        "sent_at": new_message.created_at,
        "is_read": False
    }


@router.get("/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get count of unread messages
    """
    count = db.query(func.count(Message.id)).filter(
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).scalar() or 0
    
    return {"unread_count": count}


@router.delete("/{message_id}")
async def delete_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a message (only sender can delete)
    """
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")
    
    db.delete(message)
    db.commit()
    
    return {"message": "Message deleted successfully"}


@router.post("/mark-read/{message_id}")
async def mark_message_read(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark a specific message as read
    """
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.recipient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    message.is_read = True
    db.commit()
    
    return {"message": "Marked as read"}


@router.post("/mark-all-read/{user_id}")
async def mark_conversation_read(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all messages from a user as read
    """
    db.query(Message).filter(
        Message.sender_id == user_id,
        Message.recipient_id == current_user.id,
        Message.is_read == False
    ).update({"is_read": True})
    db.commit()
    
    return {"message": "All messages marked as read"}
