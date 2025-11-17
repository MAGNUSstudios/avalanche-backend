"""
Project Chat Management Endpoints
Handles chat/negotiation between project creator and freelancer
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from typing import List
import json

from database import get_db, Project, User, ProjectChat, ProjectChatMessage
from schemas import ProjectChatCreate, ProjectChatResponse, ProjectChatMessageCreate, ProjectChatMessageResponse
from auth import get_current_user
import ai_assistant
import ai_actions
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/project-chats", response_model=ProjectChatResponse, status_code=status.HTTP_201_CREATED)
async def create_project_chat(
    chat_data: ProjectChatCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a chat for a project between creator and freelancer
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == chat_data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if chat already exists
    existing_chat = db.query(ProjectChat).filter(
        ProjectChat.project_id == chat_data.project_id,
        ProjectChat.freelancer_id == chat_data.freelancer_id
    ).first()

    if existing_chat:
        return existing_chat

    # Create new chat
    new_chat = ProjectChat(
        project_id=chat_data.project_id,
        freelancer_id=chat_data.freelancer_id,
        status="active"
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    return new_chat


@router.get("/project-chats", response_model=List[ProjectChatResponse])
async def get_project_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all project chats for the current user
    """
    # Get chats where user is either the project creator or the freelancer
    chats = db.query(ProjectChat).join(Project).filter(
        (Project.creator_id == current_user.id) | (ProjectChat.freelancer_id == current_user.id)
    ).all()

    return chats


@router.get("/project-chats/{chat_id}", response_model=ProjectChatResponse)
async def get_project_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific project chat
    """
    chat = db.query(ProjectChat).filter(ProjectChat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Check if user has access
    project = chat.project
    if project.creator_id != current_user.id and chat.freelancer_id != current_user.id:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to view this chat")

    return chat


@router.post("/project-chats/{chat_id}/messages", response_model=ProjectChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def send_project_chat_message(
    chat_id: int,
    message_data: ProjectChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message in a project chat
    """
    chat = db.query(ProjectChat).filter(ProjectChat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Check if user has access
    project = chat.project
    if project.creator_id != current_user.id and chat.freelancer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to send messages in this chat")

    # Create message
    new_message = ProjectChatMessage(
        chat_id=chat_id,
        sender_id=current_user.id,
        content=message_data.content
    )

    db.add(new_message)
    chat.last_message_at = datetime.utcnow()
    db.commit()
    db.refresh(new_message)

    # Check if message mentions @Ava
    if "@ava" in message_data.content.lower() or "@Ava" in message_data.content:
        logger.info(f"🤖 @Ava mentioned in project chat {chat_id} by user {current_user.id}")

        # Get recent messages for context (last 15 messages for better context)
        recent_messages = db.query(ProjectChatMessage).filter(
            ProjectChatMessage.chat_id == chat_id
        ).order_by(desc(ProjectChatMessage.created_at)).limit(15).all()

        # Build enhanced conversation context with project details
        conversation_context = []
        project_context = {
            "project_id": chat.project.id,
            "project_title": chat.project.title,
            "project_budget": float(chat.project.budget) if chat.project.budget else None,
            "project_status": chat.project.status,
            "is_creator": chat.project.creator_id == current_user.id,
            "is_freelancer": chat.freelancer_id == current_user.id
        }

        for msg in reversed(recent_messages):
            sender = db.query(User).filter(User.id == msg.sender_id).first()
            role = "assistant" if msg.sender_id == 0 else "user"  # 0 = Ava
            conversation_context.append({
                "role": role,
                "content": f"{sender.first_name if sender else 'User'}: {msg.content}"
            })

        # Extract the query (remove @Ava mention)
        query = message_data.content.replace("@Ava", "").replace("@ava", "").strip()

        # Enhanced negotiation detection using AI actions
        negotiation_detection = ai_actions.detect_action_intent(query, current_user)
        is_negotiation_end = (
            negotiation_detection.get("action") == "detect_negotiation_end" or
            any(keyword in query.lower() for keyword in [
                "agreed", "terms agreed", "we agree", "deal closed", "negotiation complete",
                "ready to start", "let's proceed", "terms finalized", "we have a deal",
                "terms are good", "ready to proceed", "let's get started"
            ])
        )

        if is_negotiation_end:
            logger.info(f"🎯 Negotiation end detected in project chat {chat_id}")
            # Use AI action for escrow prompting
            try:
                escrow_action = ai_actions.execute_action(
                    "prompt_escrow",
                    current_user,
                    db,
                    {
                        "project_id": chat.project_id,
                        "chat_id": chat_id,
                        "amount": float(chat.project.budget) if chat.project.budget else None,
                        "terms": f"Project: {chat.project.title}"
                    }
                )

                if escrow_action.get("success"):
                    # Create detailed escrow prompt message from Ava
                    escrow_content = f"""🎉 Great! I detected that you've reached an agreement on the project terms.

**Project:** {chat.project.title}
**Budget:** ₦{chat.project.budget:,} (if agreed upon)

{escrow_action['message']}

**Next Steps:**
{chr(10).join(f'• {step}' for step in escrow_action.get('next_steps', []))}

**Security Note:** All payments are protected by our trusted escrow system. Funds are held securely until work is completed and approved.

Would you like me to help you set up the escrow payment now? Just reply with 'yes' to proceed or 'no' to continue discussing."""

                    escrow_message = ProjectChatMessage(
                        chat_id=chat_id,
                        sender_id=0,  # Ava
                        content=escrow_content
                    )
                    db.add(escrow_message)
                    db.commit()
                    logger.info(f"✅ Enhanced escrow prompt sent in project chat {chat_id}")
                    return new_message  # Return early, escrow prompt sent

            except Exception as e:
                logger.error(f"❌ Error triggering escrow prompt: {e}")

        # Get AI response with enhanced project context
        try:
            # Add project context to the message for better AI understanding
            enhanced_query = f"[Project Context: {chat.project.title} - Budget: ₦{chat.project.budget:,} - Status: {chat.project.status}]\n\n{query}"

            ai_response = ai_assistant.chat_with_ai(
                message=enhanced_query,
                user=current_user,
                db=db,
                conversation_history=conversation_context
            )

            # Create Ava's response message with enhanced formatting
            message_content = ai_response["response"]

            # Add project-specific guidance if relevant
            if any(word in query.lower() for word in ["payment", "pay", "escrow", "fund", "money"]):
                message_content += "\n\n💰 **Payment Security:** All transactions on Avalanche are protected by our escrow system. Funds are held securely until work is completed and approved."

            # If links are present, append them to the content in a parseable format
            if ai_response.get("links"):
                links_json = json.dumps(ai_response["links"])
                message_content += f"\n\n__LINKS__:{links_json}"

            ava_message = ProjectChatMessage(
                chat_id=chat_id,
                sender_id=0,  # Special ID for Ava
                content=message_content
            )

            db.add(ava_message)
            db.commit()
            logger.info(f"✅ Ava responded in project chat {chat_id} with enhanced context")

        except Exception as e:
            logger.error(f"❌ Error getting Ava response: {e}")

    # Check for negotiation completion and prompt escrow
    try:
        # Get recent messages to analyze conversation
        recent_messages = db.query(ProjectChatMessage).filter(
            ProjectChatMessage.chat_id == chat_id
        ).order_by(ProjectChatMessage.created_at.desc()).limit(10).all()

        # Reverse to get chronological order
        recent_messages.reverse()

        conversation_text = "\n".join([f"{msg.sender_id}: {msg.content}" for msg in recent_messages])

        # Use AI to detect if negotiation is complete
        if ai_assistant.detect_negotiation_end(conversation_text):
            logger.info(f"🎯 Negotiation end detected in project chat {chat_id}")

            # Get project details for escrow prompt
            project = chat.project
            escrow_prompt = f"""Great! It looks like you've reached an agreement on the project terms. To protect both parties, I recommend setting up escrow for the payment.

Project: {project.title}
Budget: ₦{project.budget:,}

Would you like me to guide you through the escrow setup process? This will:
1. Securely hold the funds until work is completed
2. Release payment automatically when the project is approved
3. Provide protection for both buyer and freelancer

Type 'yes' to start escrow setup or 'no' to continue discussing."""

            # Send escrow prompt as Ava message
            escrow_message = ProjectChatMessage(
                chat_id=chat_id,
                sender_id=0,  # Special ID for Ava
                content=escrow_prompt
            )
            db.add(escrow_message)
            db.commit()
            logger.info(f"💰 Escrow prompt sent in project chat {chat_id}")

    except Exception as e:
        logger.error(f"❌ Error checking negotiation status: {e}")

    return new_message


@router.get("/project-chats/{chat_id}/messages", response_model=List[ProjectChatMessageResponse])
async def get_project_chat_messages(
    chat_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages from a project chat
    """
    chat = db.query(ProjectChat).filter(ProjectChat.id == chat_id).first()

    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Check if user has access
    project = chat.project
    if project.creator_id != current_user.id and chat.freelancer_id != current_user.id:
        # Check if user is admin
        if current_user.role != "admin":
            raise HTTPException(status_code=403, detail="Not authorized to view messages")

    messages = db.query(ProjectChatMessage).filter(
        ProjectChatMessage.chat_id == chat_id
    ).order_by(ProjectChatMessage.created_at.asc()).offset(skip).limit(limit).all()

    return messages


@router.get("/projects/{project_id}/chats", response_model=List[ProjectChatResponse])
async def get_chats_for_project(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all chats for a specific project (admin only or project creator)
    """
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if user is project creator or admin
    if project.creator_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")

    chats = db.query(ProjectChat).filter(ProjectChat.project_id == project_id).all()

    return chats
