from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_, and_
from typing import List, Optional
from datetime import datetime
import json

from database import get_db, User, Guild, GuildChat, GuildChatMessage, guild_members
from auth import get_current_user
from schemas import GuildChatMessageCreate, GuildChatMessageResponse, GuildChatResponse
import ai_assistant
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/guild-chats", tags=["Guild Chats"])


@router.get("/", response_model=List[GuildChatResponse])
async def get_user_guild_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all guild chats for guilds the user is a member of
    """
    # Get all guilds user is member of or owns
    guild_ids_query = db.query(guild_members.c.guild_id).filter(
        guild_members.c.user_id == current_user.id
    )
    
    owned_guilds_query = db.query(Guild.id).filter(
        Guild.owner_id == current_user.id
    )
    
    # Combine member and owned guild IDs
    member_guild_ids = [row[0] for row in guild_ids_query.all()]
    owned_guild_ids = [row[0] for row in owned_guilds_query.all()]
    all_guild_ids = list(set(member_guild_ids + owned_guild_ids))
    
    if not all_guild_ids:
        return []
    
    # Get guild chats for these guilds
    guild_chats = db.query(GuildChat).filter(
        GuildChat.guild_id.in_(all_guild_ids)
    ).all()
    
    result = []
    for chat in guild_chats:
        guild = db.query(Guild).filter(Guild.id == chat.guild_id).first()
        if not guild:
            continue
        
        # Get last message
        last_message_obj = db.query(GuildChatMessage).filter(
            GuildChatMessage.guild_chat_id == chat.id,
            GuildChatMessage.is_deleted == False
        ).order_by(desc(GuildChatMessage.created_at)).first()
        
        last_message = None
        if last_message_obj:
            last_message = {
                "content": last_message_obj.content,
                "sent_at": last_message_obj.created_at,
                "sender_name": f"{last_message_obj.sender.first_name} {last_message_obj.sender.last_name}"
            }
        
        # Count unread messages (for now, all messages are "read")
        unread_count = 0
        
        result.append(GuildChatResponse(
            id=chat.id,
            guild_id=guild.id,
            guild_name=guild.name,
            guild_avatar=guild.avatar_url,
            created_at=chat.created_at,
            unread_count=unread_count,
            last_message=last_message
        ))
    
    # Sort by last message time
    result.sort(
        key=lambda x: x.last_message["sent_at"] if x.last_message else x.created_at,
        reverse=True
    )
    
    return result


@router.get("/{guild_id}/messages", response_model=List[GuildChatMessageResponse])
async def get_guild_chat_messages(
    guild_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages from a guild chat
    """
    # Verify guild exists
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Check if user is a member or owner
    is_member = db.query(guild_members).filter(
        guild_members.c.user_id == current_user.id,
        guild_members.c.guild_id == guild_id
    ).first() is not None
    
    is_owner = guild.owner_id == current_user.id
    
    if not is_member and not is_owner:
        raise HTTPException(status_code=403, detail="You are not a member of this guild")
    
    # Get or create guild chat
    guild_chat = db.query(GuildChat).filter(GuildChat.guild_id == guild_id).first()
    if not guild_chat:
        guild_chat = GuildChat(guild_id=guild_id)
        db.add(guild_chat)
        db.commit()
        db.refresh(guild_chat)
    
    # Get messages
    messages = db.query(GuildChatMessage).filter(
        GuildChatMessage.guild_chat_id == guild_chat.id,
        GuildChatMessage.is_deleted == False
    ).order_by(GuildChatMessage.created_at.asc()).offset(skip).limit(limit).all()

    # Format messages
    result = []
    for msg in messages:
        # Handle Ava messages (sender_id = 0)
        if msg.sender_id == 0:
            result.append(GuildChatMessageResponse(
                id=msg.id,
                guild_chat_id=msg.guild_chat_id,
                sender_id=0,
                sender_name="Ava AI",
                sender_avatar="/ava-avatar.png",  # Special avatar for Ava
                content=msg.content,
                created_at=msg.created_at,
                is_deleted=msg.is_deleted
            ))
        else:
            sender = db.query(User).filter(User.id == msg.sender_id).first()
            result.append(GuildChatMessageResponse(
                id=msg.id,
                guild_chat_id=msg.guild_chat_id,
                sender_id=msg.sender_id,
                sender_name=f"{sender.first_name} {sender.last_name}" if sender else "Unknown",
                sender_avatar=sender.avatar_url if sender else None,
                content=msg.content,
                created_at=msg.created_at,
                is_deleted=msg.is_deleted
            ))

    return result


@router.post("/{guild_id}/messages")
async def send_guild_chat_message(
    guild_id: int,
    message_data: GuildChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message to guild chat
    """
    # Verify guild exists
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Check if user is a member or owner
    is_member = db.query(guild_members).filter(
        guild_members.c.user_id == current_user.id,
        guild_members.c.guild_id == guild_id
    ).first() is not None
    
    is_owner = guild.owner_id == current_user.id
    
    if not is_member and not is_owner:
        raise HTTPException(status_code=403, detail="You are not a member of this guild")
    
    # Get or create guild chat
    guild_chat = db.query(GuildChat).filter(GuildChat.guild_id == guild_id).first()
    if not guild_chat:
        guild_chat = GuildChat(guild_id=guild_id)
        db.add(guild_chat)
        db.commit()
        db.refresh(guild_chat)
    
    # Create message
    new_message = GuildChatMessage(
        guild_chat_id=guild_chat.id,
        sender_id=current_user.id,
        content=message_data.content
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Check if message mentions @Ava
    if "@ava" in message_data.content.lower() or "@Ava" in message_data.content:
        logger.info(f"🤖 @Ava mentioned in guild {guild_id} by user {current_user.id}")

        # Get recent messages for context (last 10 messages)
        recent_messages = db.query(GuildChatMessage).filter(
            GuildChatMessage.guild_chat_id == guild_chat.id,
            GuildChatMessage.is_deleted == False
        ).order_by(desc(GuildChatMessage.created_at)).limit(10).all()

        # Build conversation context
        conversation_context = []
        for msg in reversed(recent_messages):
            sender = db.query(User).filter(User.id == msg.sender_id).first()
            role = "assistant" if msg.sender_id == 0 else "user"  # 0 = Ava
            conversation_context.append({
                "role": role,
                "content": f"{sender.first_name if sender else 'User'}: {msg.content}"
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

            # Create Ava's response message
            # If links are present, append them to the content in a parseable format
            message_content = ai_response["response"]
            if ai_response.get("links"):
                links_json = json.dumps(ai_response["links"])
                message_content += f"\n\n__LINKS__:{links_json}"

            ava_message = GuildChatMessage(
                guild_chat_id=guild_chat.id,
                sender_id=0,  # Special ID for Ava
                content=message_content
            )

            db.add(ava_message)
            db.commit()
            logger.info(f"✅ Ava responded in guild {guild_id}")

        except Exception as e:
            logger.error(f"❌ Error getting Ava response: {e}")

    message_response = GuildChatMessageResponse(
        id=new_message.id,
        guild_chat_id=new_message.guild_chat_id,
        sender_id=new_message.sender_id,
        sender_name=f"{current_user.first_name} {current_user.last_name}",
        sender_avatar=current_user.avatar_url,
        content=new_message.content,
        created_at=new_message.created_at,
        is_deleted=new_message.is_deleted
    )

    return message_response


@router.delete("/messages/{message_id}")
async def delete_guild_chat_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a guild chat message (only sender or guild owner can delete)
    """
    message = db.query(GuildChatMessage).filter(GuildChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Get guild chat and guild
    guild_chat = db.query(GuildChat).filter(GuildChat.id == message.guild_chat_id).first()
    if not guild_chat:
        raise HTTPException(status_code=404, detail="Guild chat not found")
    
    guild = db.query(Guild).filter(Guild.id == guild_chat.guild_id).first()
    
    # Check if user is sender or guild owner
    if message.sender_id != current_user.id and guild.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this message")
    
    message.is_deleted = True
    db.commit()
    
    return {"message": "Message deleted successfully"}
