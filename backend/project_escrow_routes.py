"""
Project Escrow Workflow Routes
Handles the complete project escrow workflow:
1. Poster posts job (pays $25 subscription)
2. Freelancer accepts job
3. They negotiate price in DM
4. AI prompts poster to move money to escrow
5. AI notifies freelancer money is in escrow
6. Freelancer completes work
7. Escrow releases payment to freelancer wallet
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db, Project, User, Wallet, WalletTransaction, Payment, Order, WorkSubmission
from auth import get_current_user
from pydantic import BaseModel
from typing import Optional, List
import cloudinary
import cloudinary.uploader
import json
import os

router = APIRouter(prefix="/projects/escrow", tags=["project-escrow"])

PROJECT_SUBSCRIPTION_FEE = 25.00  # $25 subscription to post a project


# Pydantic models
class ProjectPostRequest(BaseModel):
    title: str
    description: str
    budget: float
    deadline: Optional[str] = None
    payment_reference: str  # Paystack/Stripe payment reference


class ProjectAcceptRequest(BaseModel):
    project_id: int


class NegotiatePriceRequest(BaseModel):
    project_id: int
    agreed_price: float


class FundEscrowRequest(BaseModel):
    project_id: int


class CompleteProjectRequest(BaseModel):
    project_id: int


# 1. POST PROJECT - Poster pays $25 subscription and creates project
@router.post("/post")
async def post_project(
    request: ProjectPostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Step 1: Poster posts a project
    - Verifies $25 subscription payment
    - Creates project with workflow_status = 'posted'
    """

    # Verify payment (in real scenario, verify with Paystack/Stripe)
    # For now, we'll just check the reference exists
    if not request.payment_reference:
        raise HTTPException(status_code=400, detail="Payment reference required")

    # Create project
    new_project = Project(
        title=request.title,
        description=request.description,
        budget=request.budget,
        deadline=datetime.fromisoformat(request.deadline) if request.deadline else None,
        owner_id=current_user.id,
        creator_id=current_user.id,
        workflow_status="posted",
        subscription_paid=True,
        subscription_payment_ref=request.payment_reference,
        status="active"
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Project posted successfully",
        "project_id": new_project.id,
        "workflow_status": new_project.workflow_status,
        "subscription_fee": PROJECT_SUBSCRIPTION_FEE,
        "next_step": "Wait for freelancers to accept your project"
    }


# 2. APPLY TO PROJECT - Freelancer applies and opens chat with poster
@router.post("/apply")
async def apply_to_project(
    request: ProjectAcceptRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Step 2: Freelancer applies to a project
    - Creates/opens a ProjectChat with the poster
    - Sends initial application message
    - Returns chat_id to redirect freelancer to chat
    """
    from database import ProjectChat, ProjectChatMessage

    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot apply to your own project")

    # Check if chat already exists
    existing_chat = db.query(ProjectChat).filter(
        ProjectChat.project_id == project.id,
        ProjectChat.freelancer_id == current_user.id
    ).first()

    if existing_chat:
        chat = existing_chat
    else:
        # Create new project chat
        chat = ProjectChat(
            project_id=project.id,
            freelancer_id=current_user.id,
            status="active",
            last_message_at=datetime.utcnow()
        )
        db.add(chat)
        db.commit()
        db.refresh(chat)

        # Send initial application message
        initial_message = ProjectChatMessage(
            chat_id=chat.id,
            sender_id=current_user.id,
            content=f"Hi! I'm interested in your project: {project.title}. I'd love to discuss the details with you.",
            created_at=datetime.utcnow()
        )
        db.add(initial_message)
        db.commit()

    poster = db.query(User).filter(User.id == project.owner_id).first()

    return {
        "message": "Application sent successfully",
        "project_id": project.id,
        "chat_id": chat.id,
        "poster": {
            "id": poster.id,
            "name": f"{poster.first_name} {poster.last_name}",
            "avatar_url": poster.avatar_url
        },
        "redirect_to_chat": True,
        "next_step": "Discuss project details with the poster in the chat"
    }


# 3. AGREE ON PRICE - Both parties agree on final price
@router.post("/agree-price")
async def agree_on_price(
    request: NegotiatePriceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Step 3: Poster and freelancer agree on a price
    - Updates workflow_status to 'price_agreed'
    - Sets agreed_price
    - AI prompts poster to fund escrow
    """

    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Only poster or freelancer can set agreed price
    if current_user.id not in [project.owner_id, project.freelancer_id]:
        raise HTTPException(status_code=403, detail="Only project owner or freelancer can agree on price")

    if project.workflow_status not in ["accepted", "negotiating"]:
        raise HTTPException(status_code=400, detail=f"Cannot agree on price. Current status: {project.workflow_status}")

    # Set agreed price
    project.agreed_price = request.agreed_price
    project.workflow_status = "price_agreed"
    project.updated_at = datetime.utcnow()

    db.commit()

    # AI message for poster
    ai_message = f"""
    🤖 AI Assistant: Great news! You and the freelancer have agreed on a price of ${request.agreed_price}.

    Next Step: Please fund the escrow with ${request.agreed_price} to secure the project.
    The money will be held safely until the work is completed.

    Use the 'Fund Escrow' button to proceed.
    """

    return {
        "message": "Price agreed successfully",
        "project_id": project.id,
        "agreed_price": project.agreed_price,
        "workflow_status": project.workflow_status,
        "ai_prompt": ai_message,
        "next_step": "Poster should fund escrow"
    }


# 4. FUND ESCROW - Poster moves money to escrow
@router.post("/fund-escrow")
async def fund_escrow(
    request: FundEscrowRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Step 4: Poster funds escrow
    - Deducts money from poster's wallet
    - Updates workflow_status to 'escrow_funded'
    - AI notifies freelancer
    """

    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.id != project.owner_id:
        raise HTTPException(status_code=403, detail="Only project owner can fund escrow")

    if project.workflow_status != "price_agreed":
        raise HTTPException(status_code=400, detail=f"Escrow can only be funded after price is agreed. Current status: {project.workflow_status}")

    if not project.agreed_price:
        raise HTTPException(status_code=400, detail="Agreed price not set")

    # Get poster's wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found")

    if wallet.balance < project.agreed_price:
        raise HTTPException(status_code=400, detail=f"Insufficient balance. Required: ${project.agreed_price}, Available: ${wallet.balance}")

    # Deduct from wallet
    wallet.balance -= project.agreed_price

    # Create wallet transaction
    transaction = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type="debit",
        amount=project.agreed_price,
        description=f"Escrow funding for project: {project.title}",
        related_project_id=project.id
    )
    db.add(transaction)

    # Update project
    project.escrow_funded = True
    project.escrow_amount = project.agreed_price
    project.escrow_funded_at = datetime.utcnow()
    project.workflow_status = "escrow_funded"
    project.updated_at = datetime.utcnow()

    db.commit()

    # Get freelancer info
    freelancer = db.query(User).filter(User.id == project.freelancer_id).first()

    # AI message for freelancer
    ai_message_freelancer = f"""
    🤖 AI Assistant: Excellent news!

    The project owner has successfully funded the escrow with ${project.agreed_price}.
    The money is now securely held and will be released to your wallet upon project completion.

    You can now start working on the project with confidence!
    """

    return {
        "message": "Escrow funded successfully",
        "project_id": project.id,
        "escrow_amount": project.escrow_amount,
        "workflow_status": project.workflow_status,
        "freelancer_name": f"{freelancer.first_name} {freelancer.last_name}",
        "ai_notification_to_freelancer": ai_message_freelancer,
        "next_step": "Freelancer should start working on the project"
    }


# 5. COMPLETE PROJECT - Freelancer marks project as complete
@router.post("/complete")
async def complete_project(
    request: CompleteProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Step 5: Freelancer completes the project
    - Updates workflow_status to 'completed'
    - Notifies poster for review
    """

    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.id != project.freelancer_id:
        raise HTTPException(status_code=403, detail="Only assigned freelancer can mark project as complete")

    if project.workflow_status != "escrow_funded":
        raise HTTPException(status_code=400, detail=f"Project must be in escrow_funded status. Current: {project.workflow_status}")

    # Mark as completed
    project.workflow_status = "completed"
    project.completed_at = datetime.utcnow()
    project.status = "completed"
    project.updated_at = datetime.utcnow()

    db.commit()

    return {
        "message": "Project marked as complete",
        "project_id": project.id,
        "workflow_status": project.workflow_status,
        "next_step": "Waiting for poster to release payment from escrow"
    }


# 6. RELEASE PAYMENT - Release escrow to freelancer's wallet
@router.post("/release-payment")
async def release_payment(
    request: CompleteProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Step 6: Release payment from escrow to freelancer
    - Can be done by poster or admin
    - Credits freelancer's wallet
    - Updates workflow_status to 'paid'
    """

    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Only poster can release payment (or admin in future)
    if current_user.id != project.owner_id:
        raise HTTPException(status_code=403, detail="Only project owner can release payment")

    if project.workflow_status != "completed":
        raise HTTPException(status_code=400, detail=f"Payment can only be released after project completion. Current: {project.workflow_status}")

    if not project.escrow_funded:
        raise HTTPException(status_code=400, detail="No escrow to release")

    # Get freelancer's wallet
    freelancer_wallet = db.query(Wallet).filter(Wallet.user_id == project.freelancer_id).first()
    if not freelancer_wallet:
        raise HTTPException(status_code=404, detail="Freelancer wallet not found")

    # Credit freelancer wallet
    freelancer_wallet.balance += project.escrow_amount

    # Create wallet transaction
    transaction = WalletTransaction(
        wallet_id=freelancer_wallet.id,
        transaction_type="credit",
        amount=project.escrow_amount,
        description=f"Payment received for project: {project.title}",
        related_project_id=project.id
    )
    db.add(transaction)

    # Update project
    project.workflow_status = "paid"
    project.payment_released_at = datetime.utcnow()
    project.escrow_funded = False  # Escrow is now empty
    project.updated_at = datetime.utcnow()

    db.commit()

    freelancer = db.query(User).filter(User.id == project.freelancer_id).first()

    return {
        "message": "Payment released successfully",
        "project_id": project.id,
        "amount_released": project.escrow_amount,
        "freelancer_name": f"{freelancer.first_name} {freelancer.last_name}",
        "workflow_status": project.workflow_status,
        "project_completed": True
    }


# GET PROJECT STATUS - Check current workflow status
@router.get("/{project_id}/status")
async def get_project_escrow_status(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current escrow workflow status of a project
    """

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Build response
    response = {
        "project_id": project.id,
        "title": project.title,
        "workflow_status": project.workflow_status,
        "subscription_paid": project.subscription_paid,
        "agreed_price": project.agreed_price,
        "escrow_funded": project.escrow_funded,
        "escrow_amount": project.escrow_amount,
        "completed_at": project.completed_at.isoformat() if project.completed_at else None,
        "payment_released_at": project.payment_released_at.isoformat() if project.payment_released_at else None,
    }

    # Add role-specific info
    if project.owner_id:
        owner = db.query(User).filter(User.id == project.owner_id).first()
        response["poster"] = f"{owner.first_name} {owner.last_name}"

    if project.freelancer_id:
        freelancer = db.query(User).filter(User.id == project.freelancer_id).first()
        response["freelancer"] = f"{freelancer.first_name} {freelancer.last_name}"

    return response


# ===== NEW ENHANCED ENDPOINTS FOR FRONTEND INTEGRATION =====

class PlaceInEscrowRequest(BaseModel):
    project_id: int
    amount: float
    freelancer_id: int


# NEW: Place funds in escrow (after AI detects agreement in DM)
@router.post("/place")
async def place_in_escrow(
    request: PlaceInEscrowRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Place funds in escrow after AI detects agreement in chat.
    This endpoint creates a Stripe checkout session.
    """
    import stripe
    import stripe_integration

    project = db.query(Project).filter(Project.id == request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.id != project.owner_id:
        raise HTTPException(status_code=403, detail="Only project owner can place funds in escrow")

    # Assign freelancer to project
    project.freelancer_id = request.freelancer_id
    project.agreed_price = request.amount
    project.workflow_status = "price_agreed"

    # Calculate platform fee (5%)
    platform_fee = request.amount * 0.05
    total_amount = request.amount + platform_fee

    # Create Stripe checkout session
    try:
        stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': f'Escrow for: {project.title}',
                        'description': f'Project escrow amount + 5% platform fee',
                    },
                    'unit_amount': int(total_amount * 100),  # Convert to cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=os.getenv("FRONTEND_URL") + f'/projects/{project.id}?escrow=success',
            cancel_url=os.getenv("FRONTEND_URL") + f'/projects/{project.id}?escrow=cancel',
            metadata={
                'project_id': project.id,
                'escrow_amount': request.amount,
                'platform_fee': platform_fee,
                'freelancer_id': request.freelancer_id,
                'type': 'project_escrow'
            }
        )

        db.commit()

        return {
            "message": "Checkout session created",
            "checkout_url": session.url,
            "session_id": session.id,
            "project_id": project.id,
            "amount": request.amount,
            "platform_fee": platform_fee,
            "total": total_amount
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")


# NEW: Submit completed work with file uploads
@router.post("/{project_id}/submit-work")
async def submit_work(
    project_id: int,
    description: str = Form(...),
    files: List[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Freelancer submits completed work with deliverables.
    Uploads files to Cloudinary and creates WorkSubmission record.
    """

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.id != project.freelancer_id:
        raise HTTPException(status_code=403, detail="Only assigned freelancer can submit work")

    if project.workflow_status != "escrow_funded":
        raise HTTPException(status_code=400, detail=f"Work can only be submitted after escrow is funded. Current status: {project.workflow_status}")

    # Upload files to Cloudinary
    file_urls = []
    try:
        for file in files:
            # Read file content
            file_content = await file.read()

            # Upload to Cloudinary
            result = cloudinary.uploader.upload(
                file_content,
                folder=f"projects/{project_id}/submissions",
                resource_type="auto"  # auto-detect file type
            )

            file_urls.append({
                "filename": file.filename,
                "url": result["secure_url"],
                "public_id": result["public_id"],
                "size": len(file_content)
            })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    # Create WorkSubmission record
    submission = WorkSubmission(
        project_id=project_id,
        freelancer_id=current_user.id,
        description=description,
        files=json.dumps(file_urls),  # Store as JSON string
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(submission)

    # Update project status
    project.workflow_status = "pending_approval"
    project.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    return {
        "message": "Work submitted successfully",
        "submission_id": submission.id,
        "project_id": project.id,
        "files_uploaded": len(file_urls),
        "status": "pending_approval",
        "next_step": "Waiting for client approval"
    }


# NEW: Approve submitted work and release escrow
@router.post("/{project_id}/approve-work")
async def approve_work(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Client approves submitted work and releases escrow to freelancer's wallet.
    """

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if current_user.id != project.owner_id:
        raise HTTPException(status_code=403, detail="Only project owner can approve work")

    if project.workflow_status != "pending_approval":
        raise HTTPException(status_code=400, detail=f"No work to approve. Current status: {project.workflow_status}")

    # Get the work submission
    submission = db.query(WorkSubmission).filter(
        WorkSubmission.project_id == project_id,
        WorkSubmission.status == "pending"
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="No pending work submission found")

    # Get or create freelancer's wallet
    freelancer_wallet = db.query(Wallet).filter(Wallet.user_id == project.freelancer_id).first()
    if not freelancer_wallet:
        # Create wallet if it doesn't exist
        freelancer_wallet = Wallet(
            user_id=project.freelancer_id,
            balance=0.0
        )
        db.add(freelancer_wallet)
        db.flush()

    # Release escrow to freelancer wallet
    freelancer_wallet.balance += project.escrow_amount

    # Create wallet transaction
    transaction = WalletTransaction(
        wallet_id=freelancer_wallet.id,
        transaction_type="credit",
        amount=project.escrow_amount,
        description=f"Escrow released for project: {project.title}",
        related_project_id=project.id
    )
    db.add(transaction)

    # Update submission status
    submission.status = "approved"
    submission.reviewed_at = datetime.utcnow()
    submission.reviewed_by = current_user.id

    # Update project status
    project.workflow_status = "paid"
    project.status = "completed"
    project.completed_at = datetime.utcnow()
    project.payment_released_at = datetime.utcnow()
    project.escrow_funded = False  # Escrow is now released
    project.updated_at = datetime.utcnow()

    db.commit()

    freelancer = db.query(User).filter(User.id == project.freelancer_id).first()

    return {
        "message": "Work approved and payment released",
        "project_id": project.id,
        "amount_released": project.escrow_amount,
        "freelancer_wallet_balance": freelancer_wallet.balance,
        "freelancer_name": f"{freelancer.first_name} {freelancer.last_name}",
        "status": "completed",
        "payment_released": True
    }


# NEW: Get escrow status for a project
@router.get("/{project_id}/escrow-status")
async def get_escrow_status(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed escrow status for a project.
    """

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if user is involved in this project
    if current_user.id not in [project.owner_id, project.freelancer_id]:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")

    # Get work submission if exists
    submission = db.query(WorkSubmission).filter(
        WorkSubmission.project_id == project_id
    ).order_by(WorkSubmission.created_at.desc()).first()

    response = {
        "project_id": project.id,
        "title": project.title,
        "workflow_status": project.workflow_status,
        "escrow_funded": project.escrow_funded,
        "escrow_amount": project.escrow_amount,
        "agreed_price": project.agreed_price,
        "escrow_funded_at": project.escrow_funded_at.isoformat() if project.escrow_funded_at else None,
        "completed_at": project.completed_at.isoformat() if project.completed_at else None,
        "payment_released_at": project.payment_released_at.isoformat() if project.payment_released_at else None,
    }

    if submission:
        files = json.loads(submission.files) if submission.files else []
        response["submission"] = {
            "id": submission.id,
            "description": submission.description,
            "files": files,
            "status": submission.status,
            "created_at": submission.created_at.isoformat()
        }

    # Add user info
    if project.owner_id:
        owner = db.query(User).filter(User.id == project.owner_id).first()
        response["owner"] = {
            "id": owner.id,
            "name": f"{owner.first_name} {owner.last_name}",
            "avatar_url": owner.avatar_url
        }

    if project.freelancer_id:
        freelancer = db.query(User).filter(User.id == project.freelancer_id).first()
        response["freelancer"] = {
            "id": freelancer.id,
            "name": f"{freelancer.first_name} {freelancer.last_name}",
            "avatar_url": freelancer.avatar_url
        }

    return response
