from fastapi import FastAPI, Depends, HTTPException, status, Query, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import timedelta, datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os
import shutil
import time
import random
from pathlib import Path
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import requests

from cloudinary_ai_generator import get_ai_guild_avatar

from database import (
    get_db, init_db, User, Guild, Project, Task, Product, Message, Order, Escrow, Payment, Post,
    GuildChat, ProjectChat, ProjectChatMessage, guild_members, project_members, SellerPaymentInfo, Admin, SessionLocal
)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from schemas import (
    UserCreate, UserLogin, UserResponse, UserUpdate, LoginResponse, AdminProfileUpdate,
    GuildCreate, GuildUpdate, GuildResponse,
    ProjectCreate, ProjectUpdate, ProjectResponse,
    TaskCreate, TaskUpdate, TaskResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    MessageCreate, MessageResponse,
    OrderCreate, OrderResponse, OrderUpdate,
    EscrowCreate, EscrowResponse, EscrowAction,
    PaymentInitialize, PaymentResponse, PaymentVerify
)
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
    get_current_admin,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
import payment_escrow
import stripe_integration
import admin_routes
import marketplace_routes
import chat_routes
import ai_routes
import ai_subscription_routes
import oauth_routes
import notification_routes
import guild_chat_routes
import project_chat
import cart_checkout
import seller_payment_routes
import qdrant_service
import ai_recommendations
import ai_assistant
import ai_actions
import user_settings_routes
import wallet_routes
import stripe_connect_routes
import simple_payout_routes
import stripe_payout_routes
import paystack_payout_routes
import project_escrow_routes
import mcp_server
import mcp_openai_integration

load_dotenv()

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title="Avalanche API",
    description="Backend API for Avalanche Platform",
    version="1.0.0"
)

# Attach limiter to app state (required by SlowAPIMiddleware)
app.state.limiter = limiter

# Add rate limiting middleware
app.add_middleware(SlowAPIMiddleware)

# Rate limit exceeded handler
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
# Support multiple frontend URLs (comma-separated in env var)
allowed_origins = [origin.strip() for origin in FRONTEND_URL.split(",")]
# Add localhost for development and production frontend
allowed_origins.extend([
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "https://avalanche-frontend-indol.vercel.app"
])
# Remove duplicates
allowed_origins = list(set(allowed_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(payment_escrow.router, tags=["Payments & Escrow"])
app.include_router(stripe_integration.router, prefix="/stripe", tags=["Stripe"])
app.include_router(cart_checkout.router, tags=["Cart Checkout"])
app.include_router(seller_payment_routes.router, tags=["Seller Payment Info"])
app.include_router(admin_routes.router, tags=["Admin"])
app.include_router(marketplace_routes.router, tags=["Marketplace"])
app.include_router(chat_routes.router, tags=["Chat"])
app.include_router(guild_chat_routes.router, tags=["Guild Chats"])
app.include_router(project_chat.router, tags=["Project Chats"])
app.include_router(ai_routes.router, tags=["AI Assistant"])
app.include_router(ai_subscription_routes.router, tags=["AI Subscription"])
app.include_router(oauth_routes.router, tags=["OAuth"])
app.include_router(notification_routes.router, tags=["Notifications"])
app.include_router(user_settings_routes.router, tags=["User Settings"])
app.include_router(wallet_routes.router, tags=["Wallet"])
app.include_router(stripe_connect_routes.router, tags=["Stripe Connect"])
app.include_router(simple_payout_routes.router, tags=["Simple Payout"])
app.include_router(stripe_payout_routes.router, tags=["Stripe Automatic Payout"])
app.include_router(paystack_payout_routes.router, tags=["Paystack African Payout"])
app.include_router(project_escrow_routes.router, tags=["Project Escrow Workflow"])
app.include_router(mcp_server.router, tags=["MCP Server"])
app.include_router(mcp_openai_integration.router, tags=["MCP OpenAI Integration"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
(UPLOAD_DIR / "guilds").mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Helper function to get random placeholder images
def get_random_placeholder_image(category: str = None, image_type: str = "banner") -> str:
    """
    Generate a random placeholder image using Picsum Photos (reliable Lorem Ipsum for photos).
    This service is more reliable than Unsplash and doesn't require API keys.
    """
    # Dimensions based on image type
    width = 200 if image_type == "icon" else 1200
    height = 200 if image_type == "icon" else 400
    
    # Category-specific color gradients for fallback
    category_colors = {
        "Technology": "667eea/764ba2",
        "Gaming": "fc466b/3f5efb",
        "Art & Design": "f093fb/f5576c",
        "Music": "4facfe/00f2fe",
        "Business": "43e97b/38f9d7",
        "Education": "fa709a/fee140",
        "Sports & Fitness": "30cfd0/330867",
        "Food & Cooking": "ffecd2/fcb69f",
        "Travel": "a8edea/fed6e3",
        "Photography": "ff9a56/ff6a00",
        "Science": "96fbc4/f9f586",
        "Health & Wellness": "fbc2eb/a6c1ee",
    }
    
    # Generate random seed for consistent variety
    seed = random.randint(1, 1000)
    
    # Use Picsum Photos - reliable, no API key required, great quality
    # Add blur for banners to make text readable
    if image_type == "banner":
        picsum_url = f"https://picsum.photos/seed/{seed}/{width}/{height}?blur=2"
    else:
        picsum_url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    
    return picsum_url


def create_default_admin():
    """Create default admin user if it doesn't exist"""
    db = SessionLocal()
    try:
        existing_admin = db.query(Admin).filter(Admin.email == "admin@avalanche.com").first()
        if not existing_admin:
            admin = Admin(
                username="admin",
                email="admin@avalanche.com",
                first_name="Admin",
                last_name="User",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                ai_tier="admin",
                plan_selected=True,
                created_at=datetime.utcnow(),
                last_login=None
            )
            db.add(admin)
            db.commit()
            print("✅ Default admin user created (admin@avalanche.com / admin123)")
        else:
            print("✅ Admin user already exists")
    except Exception as e:
        print(f"⚠️  Error creating admin: {e}")
        db.rollback()
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    create_default_admin()
    qdrant_service.init_qdrant_clients() # Initialize Qdrant and OpenAI clients
    qdrant_service.initialize_collections() # Ensure collections exist
    print("✅ Database initialized")
    print(f"✅ CORS enabled for: {FRONTEND_URL}")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Avalanche API is running",
        "version": "1.0.0",
        "status": "healthy"
    }


@app.post("/auth/signup", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user account
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        country=user_data.country,
        hashed_password=hashed_password,
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(new_user)
    )


@app.post("/auth/login", response_model=LoginResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return JWT token
    """
    # Find user by email
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.from_orm(user)
    )


@app.post("/auth/admin/login")
async def admin_login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Admin login endpoint - separate from user login
    """
    from database import Admin

    # Find admin by email in Admin table only
    admin = db.query(Admin).filter(Admin.email == credentials.email).first()

    if not admin or not verify_password(credentials.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive admin account"
        )

    # Update last login
    admin.last_login = datetime.utcnow()
    db.commit()

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/auth/refresh")
async def refresh_token(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Refresh access token for regular users
    """
    # Create new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_user.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.post("/auth/admin/refresh")
async def refresh_admin_token(current_admin = Depends(get_current_admin), db: Session = Depends(get_db)):
    """
    Refresh access token for admin users
    """
    from database import Admin

    # Create new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": current_admin.email}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@app.get("/auth/admin/me")
async def get_admin_me(current_admin = Depends(get_current_admin)):
    """
    Get current admin information
    """
    return {
        "id": current_admin.id,
        "email": current_admin.email,
        "username": current_admin.username,
        "first_name": current_admin.first_name,
        "last_name": current_admin.last_name,
        "avatar_url": current_admin.avatar_url,
        "role": "admin",
        "ai_tier": current_admin.ai_tier if hasattr(current_admin, 'ai_tier') else "admin",
        "plan_selected": current_admin.plan_selected if hasattr(current_admin, 'plan_selected') else True,
        "created_at": current_admin.created_at.isoformat() if current_admin.created_at else None
    }


@app.put("/auth/admin/profile")
async def update_admin_profile(
    profile: AdminProfileUpdate,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update admin profile information
    """
    from database import Admin

    # Get admin from database with session
    admin = db.query(Admin).filter(Admin.id == current_admin.id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Update fields if provided
    if profile.username is not None:
        # Check if username is already taken by another admin
        existing = db.query(Admin).filter(
            Admin.username == profile.username,
            Admin.id != admin.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
        admin.username = profile.username

    if profile.first_name is not None:
        admin.first_name = profile.first_name

    if profile.last_name is not None:
        admin.last_name = profile.last_name

    if profile.email is not None:
        # Check if email is already taken by another admin
        existing = db.query(Admin).filter(
            Admin.email == profile.email,
            Admin.id != admin.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already taken")
        admin.email = profile.email

    if profile.avatar_url is not None:
        admin.avatar_url = profile.avatar_url

    db.commit()
    db.refresh(admin)

    return {
        "message": "Profile updated successfully",
        "admin": {
            "id": admin.id,
            "email": admin.email,
            "username": admin.username,
            "first_name": admin.first_name,
            "last_name": admin.last_name,
            "avatar_url": admin.avatar_url
        }
    }


@app.post("/auth/admin/avatar")
async def upload_admin_avatar(
    file: UploadFile = File(...),
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Upload admin profile picture to Cloudinary
    """
    from database import Admin

    # Get admin from database with session
    admin = db.query(Admin).filter(Admin.id == current_admin.id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG, and WebP images are allowed"
        )

    # Validate file size (max 5MB)
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to start

    if file_size > 5 * 1024 * 1024:  # 5MB
        raise HTTPException(status_code=400, detail="File size must be less than 5MB")

    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            file.file,
            folder="avalanche/admins/avatars",
            public_id=f"admin_{admin.id}_{int(time.time())}",
            overwrite=True,
            resource_type="image"
        )

        # Update admin avatar URL
        admin.avatar_url = result["secure_url"]
        db.commit()
        db.refresh(admin)

        return {
            "message": "Avatar uploaded successfully",
            "avatar_url": admin.avatar_url
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")


@app.post("/auth/admin/password")
async def change_admin_password(
    password_data: Dict,
    current_admin = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Change admin password
    """
    from database import Admin

    # Get admin from database with session
    admin = db.query(Admin).filter(Admin.id == current_admin.id).first()
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")

    # Validate current password
    if not verify_password(password_data.get("current_password", ""), admin.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Validate new password
    new_password = password_data.get("new_password", "")
    if len(new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters long")

    # Update password
    admin.hashed_password = get_password_hash(new_password)
    db.commit()

    return {"message": "Password changed successfully"}


@app.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information
    """
    return current_user


@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get public user profile by user ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.put("/users/me", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    """
    # Get the user from the current database session
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


@app.post("/users/me/avatar", response_model=UserResponse)
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload user avatar/profile picture
    """
    try:
        # Get the user from the database session
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(
            avatar.file,
            folder="avalanche/avatars",
            resource_type="auto",
            transformation=[
                {'width': 400, 'height': 400, 'crop': 'fill', 'gravity': 'face'},
                {'quality': 'auto'}
            ]
        )

        user.avatar_url = upload_result.get("secure_url")

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to upload avatar: {str(e)}")


# ===== GUILD ENDPOINTS =====
@app.post("/guilds", response_model=GuildResponse, status_code=status.HTTP_201_CREATED)
async def create_guild(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_private: bool = Form(False),
    icon: Optional[UploadFile] = File(None),
    banner: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new guild with optional icon and banner uploads to Cloudinary.
    If no images provided, random placeholder images are assigned based on category.
    """
    avatar_url = None
    banner_url = None
    
    # Handle icon upload to Cloudinary
    if icon and icon.filename:
        try:
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                icon.file,
                folder="avalanche/guilds/icons",
                public_id=f"guild_icon_{current_user.id}_{int(time.time() * 1000)}",
                resource_type="image"
            )
            avatar_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Error uploading icon to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload icon")
    else:
        # Generate AI-powered unique avatar if none provided
        avatar_url = get_ai_guild_avatar(name, category, "icon")
    
    # Handle banner upload to Cloudinary
    if banner and banner.filename:
        try:
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                banner.file,
                folder="avalanche/guilds/banners",
                public_id=f"guild_banner_{current_user.id}_{int(time.time() * 1000)}",
                resource_type="image"
            )
            banner_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Error uploading banner to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload banner")
    else:
        # Generate AI-powered unique banner if none provided
        banner_url = get_ai_guild_avatar(name, category, "banner")
    
    new_guild = Guild(
        name=name,
        description=description,
        category=category,
        avatar_url=avatar_url,
        banner_url=banner_url,
        is_private=is_private,
        owner_id=current_user.id,
        member_count=1  # Owner is the first member
    )
    
    db.add(new_guild)
    db.commit()
    db.refresh(new_guild)
    
    # Add creator as member
    db.execute(guild_members.insert().values(user_id=current_user.id, guild_id=new_guild.id))
    db.commit()
    
    # Auto-create guild chat
    guild_chat = GuildChat(guild_id=new_guild.id)
    db.add(guild_chat)
    db.commit()
    
    return new_guild


@app.get("/guilds", response_model=List[GuildResponse])
async def get_guilds(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of guilds
    """
    query = db.query(Guild).filter(Guild.is_private == False)
    
    if search:
        query = query.filter(
            or_(
                Guild.name.ilike(f"%{search}%"),
                Guild.description.ilike(f"%{search}%")
            )
        )
    
    if category:
        query = query.filter(Guild.category == category)
    
    guilds = query.offset(skip).limit(limit).all()
    return guilds


@app.get("/guilds/{guild_id}", response_model=GuildResponse)
async def get_guild(guild_id: int, db: Session = Depends(get_db)):
    """
    Get guild by ID
    """
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    return guild


@app.post("/guilds/populate-images")
async def populate_guild_images(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Add random placeholder images to guilds that don't have images.
    Requires authentication.
    """
    # Get all guilds without images
    guilds_without_avatar = db.query(Guild).filter(
        or_(Guild.avatar_url == None, Guild.avatar_url == "")
    ).all()
    
    guilds_without_banner = db.query(Guild).filter(
        or_(Guild.banner_url == None, Guild.banner_url == "")
    ).all()
    
    updated_count = 0
    
    # Update guilds without avatars
    for guild in guilds_without_avatar:
        guild.avatar_url = get_random_placeholder_image(guild.category, "icon")
        updated_count += 1
    
    # Update guilds without banners
    for guild in guilds_without_banner:
        guild.banner_url = get_random_placeholder_image(guild.category, "banner")
        updated_count += 1
    
    db.commit()
    
    return {
        "message": f"Successfully updated {updated_count} guild images",
        "guilds_updated": {
            "avatars": len(guilds_without_avatar),
            "banners": len(guilds_without_banner)
        }
    }


@app.put("/guilds/{guild_id}")
async def update_guild(
    guild_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    rules: Optional[str] = Form(None),
    icon: Optional[UploadFile] = File(None),
    banner: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update guild - only owner can update. Uploads images to Cloudinary.
    Rules should be sent as JSON string array.
    """
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    if guild.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only guild owner can update guild")
    
    # Update text fields
    if name:
        guild.name = name
    if description:
        guild.description = description
    if category:
        guild.category = category
    if rules is not None:
        guild.rules = rules
    
    # Handle icon upload to Cloudinary
    if icon and icon.filename:
        try:
            upload_result = cloudinary.uploader.upload(
                icon.file,
                folder="avalanche/guilds/icons",
                public_id=f"guild_icon_{current_user.id}_{int(time.time() * 1000)}",
                resource_type="image"
            )
            guild.avatar_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Error uploading icon to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload icon")
    
    # Handle banner upload to Cloudinary
    if banner and banner.filename:
        try:
            upload_result = cloudinary.uploader.upload(
                banner.file,
                folder="avalanche/guilds/banners",
                public_id=f"guild_banner_{current_user.id}_{int(time.time() * 1000)}",
                resource_type="image"
            )
            guild.banner_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Error uploading banner to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload banner")
    
    db.commit()
    db.refresh(guild)
    
    return guild


@app.post("/guilds/{guild_id}/join")
async def join_guild(
    guild_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Join a guild as a member
    """
    # Check if guild exists
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Check if user is already a member
    existing_membership = db.query(guild_members).filter(
        guild_members.c.user_id == current_user.id,
        guild_members.c.guild_id == guild_id
    ).first()
    
    if existing_membership:
        raise HTTPException(status_code=400, detail="You are already a member of this guild")
    
    # Check if user is the owner
    if guild.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You are the owner of this guild")
    
    # Add user to guild
    stmt = guild_members.insert().values(
        user_id=current_user.id,
        guild_id=guild_id,
        joined_at=datetime.utcnow()
    )
    db.execute(stmt)
    
    # Update member count
    guild.member_count += 1
    
    db.commit()
    
    return {
        "message": "Successfully joined the guild",
        "guild_id": guild_id,
        "member_count": guild.member_count
    }


@app.delete("/guilds/{guild_id}/leave")
async def leave_guild(
    guild_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Leave a guild
    """
    # Check if guild exists
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Check if user is the owner
    if guild.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="Guild owner cannot leave the guild. Transfer ownership or delete the guild instead.")
    
    # Check if user is a member
    existing_membership = db.query(guild_members).filter(
        guild_members.c.user_id == current_user.id,
        guild_members.c.guild_id == guild_id
    ).first()
    
    if not existing_membership:
        raise HTTPException(status_code=400, detail="You are not a member of this guild")
    
    # Remove user from guild
    stmt = guild_members.delete().where(
        guild_members.c.user_id == current_user.id,
        guild_members.c.guild_id == guild_id
    )
    db.execute(stmt)
    
    # Update member count
    guild.member_count = max(1, guild.member_count - 1)  # Keep minimum of 1 for the owner
    
    db.commit()
    
    return {
        "message": "Successfully left the guild",
        "guild_id": guild_id,
        "member_count": guild.member_count
    }


@app.get("/guilds/{guild_id}/members")
async def get_guild_members(
    guild_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get all members of a guild
    """
    # Check if guild exists
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Get members from the relationship
    members = db.query(User).join(
        guild_members,
        guild_members.c.user_id == User.id
    ).filter(
        guild_members.c.guild_id == guild_id
    ).offset(skip).limit(limit).all()
    
    # Get owner info
    owner = guild.owner
    
    # Format response
    return {
        "guild_id": guild_id,
        "guild_name": guild.name,
        "owner": {
            "id": owner.id,
            "name": f"{owner.first_name} {owner.last_name}",
            "email": owner.email,
            "avatar_url": owner.avatar_url,
            "role": "owner"
        },
        "members": [
            {
                "id": member.id,
                "name": f"{member.first_name} {member.last_name}",
                "email": member.email,
                "avatar_url": member.avatar_url,
                "role": "member"
            }
            for member in members
        ],
        "total_members": guild.member_count
    }


@app.get("/guilds/{guild_id}/posts")
async def get_guild_posts(
    guild_id: int,
    skip: int = 0,
    limit: int = 20,
    post_type: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get posts for a guild
    """
    from database import Post, post_likes, post_unlikes
    
    query = db.query(Post).filter(Post.guild_id == guild_id)
    
    if post_type:
        query = query.filter(Post.post_type == post_type)
    
    posts = query.order_by(Post.is_pinned.desc(), Post.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for post in posts:
        is_liked = False
        is_unliked = False
        if current_user:
            liked = db.query(post_likes).filter(
                post_likes.c.user_id == current_user.id,
                post_likes.c.post_id == post.id
            ).first()
            is_liked = liked is not None
            
            unliked = db.query(post_unlikes).filter(
                post_unlikes.c.user_id == current_user.id,
                post_unlikes.c.post_id == post.id
            ).first()
            is_unliked = unliked is not None
        
        result.append({
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "image_url": post.image_url,
            "author": {
                "id": post.author.id,
                "name": f"{post.author.first_name} {post.author.last_name}",
                "email": post.author.email,
            },
            "is_pinned": post.is_pinned,
            "post_type": post.post_type,
            "likes_count": post.likes_count,
            "unlikes_count": post.unlikes_count,
            "comments_count": post.comments_count,
            "is_liked": is_liked,
            "is_unliked": is_unliked,
            "created_at": post.created_at.isoformat(),
        })
    
    return result


@app.post("/guilds/{guild_id}/posts")
async def create_guild_post(
    guild_id: int,
    content: str = Form(...),
    title: Optional[str] = Form(None),
    post_type: str = Form("post"),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a post in a guild. Uploads images to Cloudinary.
    Only guild members can post.
    """
    from database import Post
    
    # Check if guild exists
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Check if user is a member of the guild or is the owner
    is_member = db.query(guild_members).filter(
        guild_members.c.user_id == current_user.id,
        guild_members.c.guild_id == guild_id
    ).first()
    
    is_owner = guild.owner_id == current_user.id
    
    if not is_member and not is_owner:
        raise HTTPException(
            status_code=403, 
            detail="Only guild members can post in this guild. Please join the guild first."
        )
    
    # Handle image upload to Cloudinary
    image_url = None
    if image and image.filename:
        try:
            upload_result = cloudinary.uploader.upload(
                image.file,
                folder="avalanche/guilds/posts",
                public_id=f"post_{current_user.id}_{int(time.time() * 1000)}",
                resource_type="image"
            )
            image_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Error uploading post image to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image")
    
    new_post = Post(
        title=title,
        content=content,
        image_url=image_url,
        author_id=current_user.id,
        guild_id=guild_id,
        post_type=post_type,
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return {
        "id": new_post.id,
        "title": new_post.title,
        "content": new_post.content,
        "image_url": new_post.image_url,
        "author": {
            "id": current_user.id,
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email,
        },
        "is_pinned": new_post.is_pinned,
        "post_type": new_post.post_type,
        "likes_count": new_post.likes_count,
        "comments_count": new_post.comments_count,
        "created_at": new_post.created_at.isoformat(),
    }


@app.post("/posts/{post_id}/like")
async def toggle_like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Like or unlike a post
    """
    from database import Post, post_likes, post_unlikes
    
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already liked the post
    existing_like = db.query(post_likes).filter(
        post_likes.c.user_id == current_user.id,
        post_likes.c.post_id == post_id
    ).first()
    
    # Remove any existing unlike
    existing_unlike = db.query(post_unlikes).filter(
        post_unlikes.c.user_id == current_user.id,
        post_unlikes.c.post_id == post_id
    ).first()
    
    if existing_unlike:
        db.execute(post_unlikes.delete().where(
            post_unlikes.c.user_id == current_user.id,
            post_unlikes.c.post_id == post_id
        ))
        post.unlikes_count = max(0, post.unlikes_count - 1)
    
    if existing_like:
        # Unlike
        db.execute(post_likes.delete().where(
            post_likes.c.user_id == current_user.id,
            post_likes.c.post_id == post_id
        ))
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"liked": False, "likes_count": post.likes_count, "unlikes_count": post.unlikes_count}
    else:
        # Like
        db.execute(post_likes.insert().values(
            user_id=current_user.id,
            post_id=post_id
        ))
        post.likes_count += 1
        db.commit()
        return {"liked": True, "likes_count": post.likes_count, "unlikes_count": post.unlikes_count}


@app.post("/posts/{post_id}/unlike")
async def toggle_unlike_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Unlike or remove unlike from a post
    """
    from database import Post, post_likes, post_unlikes
    
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user already unliked the post
    existing_unlike = db.query(post_unlikes).filter(
        post_unlikes.c.user_id == current_user.id,
        post_unlikes.c.post_id == post_id
    ).first()
    
    # Remove any existing like
    existing_like = db.query(post_likes).filter(
        post_likes.c.user_id == current_user.id,
        post_likes.c.post_id == post_id
    ).first()
    
    if existing_like:
        db.execute(post_likes.delete().where(
            post_likes.c.user_id == current_user.id,
            post_likes.c.post_id == post_id
        ))
        post.likes_count = max(0, post.likes_count - 1)
    
    if existing_unlike:
        # Remove unlike
        db.execute(post_unlikes.delete().where(
            post_unlikes.c.user_id == current_user.id,
            post_unlikes.c.post_id == post_id
        ))
        post.unlikes_count = max(0, post.unlikes_count - 1)
        db.commit()
        return {"unliked": False, "likes_count": post.likes_count, "unlikes_count": post.unlikes_count}
    else:
        # Unlike
        db.execute(post_unlikes.insert().values(
            user_id=current_user.id,
            post_id=post_id
        ))
        post.unlikes_count += 1
        db.commit()
        return {"unliked": True, "likes_count": post.likes_count, "unlikes_count": post.unlikes_count}


@app.get("/posts/{post_id}/reactions")
async def get_post_reactions(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of users who liked and unliked a post.
    Only accessible by the post author.
    """
    from database import Post, post_likes, post_unlikes
    
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Only post author can see who reacted
    if post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the post author can view reactions")
    
    # Get users who liked
    likes = db.execute(
        post_likes.select().where(post_likes.c.post_id == post_id)
    ).fetchall()
    
    liked_users = []
    for like in likes:
        user = db.query(User).filter(User.id == like.user_id).first()
        if user:
            liked_users.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "avatar_url": user.avatar_url,
            })
    
    # Get users who unliked
    unlikes = db.execute(
        post_unlikes.select().where(post_unlikes.c.post_id == post_id)
    ).fetchall()
    
    unliked_users = []
    for unlike in unlikes:
        user = db.query(User).filter(User.id == unlike.user_id).first()
        if user:
            unliked_users.append({
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "avatar_url": user.avatar_url,
            })
    
    return {
        "likes": liked_users,
        "unlikes": unliked_users,
    }


@app.get("/posts/{post_id}/comments")
async def get_post_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Get comments for a post with nested replies
    """
    from database import Comment
    
    # Get only top-level comments (no parent)
    top_level_comments = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.parent_id == None
    ).order_by(Comment.created_at.desc()).offset(skip).limit(limit).all()
    
    def format_comment(comment):
        # Get replies for this comment
        replies = db.query(Comment).filter(
            Comment.parent_id == comment.id
        ).order_by(Comment.created_at.asc()).all()
        
        return {
            "id": comment.id,
            "content": comment.content,
            "image_url": comment.image_url,
            "author": {
                "id": comment.author.id,
                "name": f"{comment.author.first_name} {comment.author.last_name}",
                "email": comment.author.email,
            },
            "created_at": comment.created_at.isoformat(),
            "replies": [format_comment(reply) for reply in replies]
        }
    
    return [format_comment(comment) for comment in top_level_comments]


@app.post("/posts/{post_id}/comments")
async def create_comment(
    post_id: int,
    content: str = Form(...),
    parent_id: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a comment to a post or reply to another comment with optional image
    """
    from database import Post, Comment
    
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # If parent_id is provided, verify it exists and belongs to the same post
    if parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == parent_id).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        if parent_comment.post_id != post_id:
            raise HTTPException(status_code=400, detail="Parent comment does not belong to this post")
    
    # Handle image upload to Cloudinary
    image_url = None
    if image and image.filename:
        try:
            upload_result = cloudinary.uploader.upload(
                image.file,
                folder="avalanche/comments",
                public_id=f"comment_{current_user.id}_{int(time.time() * 1000)}",
                resource_type="image"
            )
            image_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Error uploading comment image to Cloudinary: {e}")
            # Don't fail the comment if image upload fails
    
    new_comment = Comment(
        content=content,
        image_url=image_url,
        post_id=post_id,
        author_id=current_user.id,
        parent_id=parent_id
    )
    
    db.add(new_comment)
    # Increment post comment count for all comments (including replies)
    post.comments_count += 1
    db.commit()
    db.refresh(new_comment)
    
    return {
        "id": new_comment.id,
        "content": new_comment.content,
        "image_url": new_comment.image_url,
        "parent_id": new_comment.parent_id,
        "author": {
            "id": current_user.id,
            "name": f"{current_user.first_name} {current_user.last_name}",
            "email": current_user.email,
        },
        "created_at": new_comment.created_at.isoformat(),
        "replies": []
    }


@app.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a comment. Can be deleted by comment author or post author.
    """
    from database import Comment, Post
    
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    # Get the post to check if current user is post author
    post = db.query(Post).filter(Post.id == comment.post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if user is comment author or post author
    if comment.author_id != current_user.id and post.author_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Count all replies to this comment
    replies_count = db.query(Comment).filter(Comment.parent_id == comment_id).count()
    
    # Delete all replies to this comment first
    db.query(Comment).filter(Comment.parent_id == comment_id).delete()
    
    # Decrement post comment count for this comment and all its replies
    post.comments_count = max(0, post.comments_count - 1 - replies_count)
    
    db.delete(comment)
    db.commit()
    
    return {"message": "Comment deleted successfully"}


@app.put("/guilds/{guild_id}", response_model=GuildResponse)
async def update_guild(
    guild_id: int,
    guild_update: GuildUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update guild (owner only)
    """
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    if guild.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this guild")
    
    for field, value in guild_update.dict(exclude_unset=True).items():
        setattr(guild, field, value)
    
    db.commit()
    db.refresh(guild)
    return guild


@app.post("/guilds/{guild_id}/join")
async def join_guild(
    guild_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Join a guild
    """
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Check if already a member
    existing = db.execute(
        guild_members.select().where(
            guild_members.c.user_id == current_user.id,
            guild_members.c.guild_id == guild_id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")
    
    db.execute(guild_members.insert().values(user_id=current_user.id, guild_id=guild_id))
    guild.member_count += 1
    db.commit()
    
    return {"message": "Successfully joined guild"}


@app.get("/guilds/my/memberships", response_model=List[GuildResponse])
async def get_my_guilds(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get guilds user is a member of
    """
    guilds = db.query(Guild).join(guild_members).filter(
        guild_members.c.user_id == current_user.id
    ).all()
    return guilds


# ===== PROJECT ENDPOINTS =====
@app.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project with pending status
    Project will only become active after escrow payment is completed
    """
    # Convert deadline string to datetime if provided
    deadline = None
    if project_data.deadline:
        try:
            deadline = datetime.fromisoformat(project_data.deadline.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            pass

    # Create project with "pending_payment" status
    new_project = Project(
        title=project_data.title,
        description=project_data.description,
        budget=project_data.budget,
        deadline=deadline,
        guild_id=project_data.guild_id,
        owner_id=current_user.id,
        creator_id=current_user.id,
        status="pending_payment"  # Will change to "active" after payment
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Add creator as member
    db.execute(project_members.insert().values(user_id=current_user.id, project_id=new_project.id))
    db.commit()

    return new_project


@app.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    skip: int = 0,
    limit: int = 20,
    status: Optional[str] = None,
    guild_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of projects - only returns active projects (payment completed)
    Projects with status "pending_payment" are excluded
    """
    # Only show active projects (payment has been completed)
    query = db.query(Project).filter(
        Project.status == "active"
    )

    if guild_id:
        query = query.filter(Project.guild_id == guild_id)

    projects = query.offset(skip).limit(limit).all()
    return projects


@app.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """
    Get project by ID
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.get("/projects/my/all", response_model=List[ProjectResponse])
async def get_my_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's projects
    """
    projects = db.query(Project).join(project_members).filter(
        project_members.c.user_id == current_user.id
    ).all()
    return projects


# ===== PRODUCT ENDPOINTS =====
@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new product listing
    """
    new_product = Product(
        name=product_data.name,
        description=product_data.description,
        price=product_data.price,
        category=product_data.category,
        stock=product_data.stock,
        image_url=product_data.image_url,
        seller_id=current_user.id
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@app.get("/products", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 20,
    search: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    seller_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Get list of products
    """
    query = db.query(Product).filter(Product.is_active == True).order_by(Product.created_at.desc())

    if search:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.description.ilike(f"%{search}%")
            )
        )

    if category:
        query = query.filter(Product.category.ilike(category))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if seller_id is not None:
        query = query.filter(Product.seller_id == seller_id)

    products = query.offset(skip).limit(limit).all()
    return products


@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    """
    Get product by ID
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    category: Optional[str] = Form(None),
    stock: Optional[int] = Form(None),
    is_active: Optional[bool] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update product - only seller can update their own products
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if current user is the seller
    if product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this product")

    # Handle image upload to Cloudinary
    if image:
        try:
            upload_result = cloudinary.uploader.upload(
                image.file,
                folder="avalanche/products",
                resource_type="auto"
            )
            product.image_url = upload_result.get("secure_url")
        except Exception as e:
            print(f"Error uploading image to Cloudinary: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image")

    # Update fields if provided
    if name is not None:
        product.name = name
    if description is not None:
        product.description = description
    if price is not None:
        product.price = price
    if category is not None:
        product.category = category
    if stock is not None:
        product.stock = stock
    if is_active is not None:
        product.is_active = is_active

    db.commit()
    db.refresh(product)
    return product


# ===== MESSAGE ENDPOINTS =====
@app.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a message
    """
    new_message = Message(
        content=message_data.content,
        sender_id=current_user.id,
        recipient_id=message_data.recipient_id
    )
    
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


@app.get("/messages", response_model=List[MessageResponse])
async def get_messages(
    user_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages (conversation with specific user if user_id provided)
    """
    query = db.query(Message).filter(
        or_(
            Message.sender_id == current_user.id,
            Message.recipient_id == current_user.id
        )
    )
    
    if user_id:
        query = query.filter(
            or_(
                (Message.sender_id == current_user.id) & (Message.recipient_id == user_id),
                (Message.sender_id == user_id) & (Message.recipient_id == current_user.id)
            )
        )
    
    messages = query.order_by(Message.created_at.desc()).all()
    return messages


# ===================================
# Semantic Search Endpoints (Qdrant)
# ===================================

@app.get("/search/projects")
async def search_projects_semantic(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    score_threshold: float = Query(0.7, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Perform semantic search on projects using Qdrant
    """
    results = qdrant_service.semantic_search_projects(query, limit, score_threshold)

    # Enrich results with full project data from database
    enriched_results = []
    for result in results:
        project = db.query(Project).filter(Project.id == result["project_id"]).first()
        if project:
            enriched_results.append({
                **result,
                "project": {
                    "id": project.id,
                    "title": project.title,
                    "description": project.description,
                    "status": project.status,
                    "budget": project.budget,
                    "deadline": project.deadline,
                    "owner_id": project.owner_id,
                    "created_at": project.created_at,
                }
            })

    return {
        "query": query,
        "results": enriched_results,
        "count": len(enriched_results)
    }


@app.get("/search/products")
async def search_products_semantic(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    score_threshold: float = Query(0.7, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Perform semantic search on products using Qdrant
    """
    results = qdrant_service.semantic_search_products(query, limit, score_threshold)

    # Enrich results with full product data from database
    enriched_results = []
    for result in results:
        product = db.query(Product).filter(Product.id == result["product_id"]).first()
        if product:
            enriched_results.append({
                **result,
                "product": {
                    "id": product.id,
                    "name": product.name,
                    "description": product.description,
                    "price": product.price,
                    "image_url": product.image_url,
                    "seller_id": product.seller_id,
                    "created_at": product.created_at,
                }
            })

    return {
        "query": query,
        "results": enriched_results,
        "count": len(enriched_results)
    }


@app.get("/search/guilds")
async def search_guilds_semantic(
    query: str = Query(..., description="Search query"),
    limit: int = Query(10, ge=1, le=50),
    score_threshold: float = Query(0.7, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
):
    """
    Perform semantic search on guilds using Qdrant
    """
    results = qdrant_service.semantic_search_guilds(query, limit, score_threshold)

    # Enrich results with full guild data from database
    enriched_results = []
    for result in results:
        guild = db.query(Guild).filter(Guild.id == result["guild_id"]).first()
        if guild:
            enriched_results.append({
                **result,
                "guild": {
                    "id": guild.id,
                    "name": guild.name,
                    "description": guild.description,
                    "owner_id": guild.owner_id,
                    "created_at": guild.created_at,
                }
            })

    return {
        "query": query,
        "results": enriched_results,
        "count": len(enriched_results)
    }


@app.post("/index/project/{project_id}")
async def index_project_endpoint(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Index a project in Qdrant for semantic search
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Only project owner can index
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to index this project")

    success = qdrant_service.index_project(
        project_id=project.id,
        title=project.title,
        description=project.description or "",
        metadata={
            "status": project.status,
            "budget": float(project.budget) if project.budget else 0,
            "owner_id": project.owner_id
        }
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to index project")

    return {"message": "Project indexed successfully", "project_id": project_id}


@app.post("/index/product/{product_id}")
async def index_product_endpoint(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Index a product in Qdrant for semantic search
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Only product seller can index
    if product.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to index this product")

    success = qdrant_service.index_product(
        product_id=product.id,
        name=product.name,
        description=product.description or "",
        metadata={
            "price": float(product.price) if product.price else 0,
            "seller_id": product.seller_id
        }
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to index product")

    return {"message": "Product indexed successfully", "product_id": product_id}


@app.post("/index/guild/{guild_id}")
async def index_guild_endpoint(
    guild_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Index a guild in Qdrant for semantic search
    """
    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")

    # Only guild owner can index
    if guild.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to index this guild")

    success = qdrant_service.index_guild(
        guild_id=guild.id,
        name=guild.name,
        description=guild.description or "",
        metadata={
            "owner_id": guild.owner_id
        }
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to index guild")

    return {"message": "Guild indexed successfully", "guild_id": guild_id}


# ===================================
# AI Recommendations Endpoints
# ===================================

@app.get("/recommendations/projects")
async def get_project_recommendations(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized project recommendations for the current user
    """
    recommendations = ai_recommendations.recommend_projects_for_user(
        user=current_user,
        db=db,
        limit=limit
    )

    return {
        "user_id": current_user.id,
        "recommendations": recommendations,
        "count": len(recommendations)
    }


@app.get("/recommendations/guilds")
async def get_guild_recommendations(
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized guild/community recommendations for the current user
    """
    recommendations = ai_recommendations.recommend_guilds_for_user(
        user=current_user,
        db=db,
        limit=limit
    )

    return {
        "user_id": current_user.id,
        "recommendations": recommendations,
        "count": len(recommendations)
    }


@app.get("/projects/{project_id}/similar")
async def get_similar_projects(
    project_id: int,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Find projects similar to the given project
    """
    similar = ai_recommendations.recommend_similar_projects(
        project_id=project_id,
        db=db,
        limit=limit
    )

    return {
        "project_id": project_id,
        "similar_projects": similar,
        "count": len(similar)
    }


@app.get("/projects/{project_id}/recommended-products")
async def get_recommended_products_for_project(
    project_id: int,
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db)
):
    """
    Get products/tools recommended for a specific project
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    recommendations = ai_recommendations.recommend_products_for_project(
        project=project,
        db=db,
        limit=limit
    )

    return {
        "project_id": project_id,
        "recommendations": recommendations,
        "count": len(recommendations)
    }


@app.get("/trending/projects")
async def get_trending_projects(
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Get trending projects with optional personalization
    """
    trending = ai_recommendations.get_trending_projects(
        db=db,
        user=current_user,
        limit=limit
    )

    return {
        "trending_projects": trending,
        "count": len(trending),
        "personalized": current_user is not None
    }


# ===================================
# AI Assistant (Google Box) Endpoints
# ===================================

class ChatMessage(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = None
    session_id: Optional[str] = None  # For conversation memory


@app.post("/ai/chat")
async def chat_with_assistant(
    chat_data: ChatMessage,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Chat with the AI assistant (AI Google Box)
    Provides intelligent responses with access to platform data and conversation memory
    """
    result = ai_assistant.chat_with_ai(
        message=chat_data.message,
        user=current_user,
        db=db,
        conversation_history=chat_data.conversation_history,
        session_id=chat_data.session_id
    )

    # Transform response field to ai_response for frontend compatibility
    if "response" in result and "ai_response" not in result:
        result["ai_response"] = result.pop("response")

    return result


@app.post("/ai/analyze-query")
async def analyze_user_query(
    chat_data: ChatMessage,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Analyze user query to understand intent and context
    """
    analysis = ai_assistant.analyze_user_query(
        query=chat_data.message,
        user=current_user,
        db=db
    )

    return analysis


@app.get("/ai/quick-answer")
async def get_quick_answer(
    question: str = Query(..., description="Question to get quick answer for"),
    db: Session = Depends(get_db)
):
    """
    Get quick answer to common questions without full AI processing
    """
    answer = ai_assistant.quick_answer(question, db)

    if answer:
        return {
            "question": question,
            "answer": answer,
            "source": "quick_response"
        }
    else:
        return {
            "question": question,
            "answer": None,
            "message": "No quick answer available. Try using /ai/chat for a detailed response."
        }


@app.post("/ai/track")
async def track_ai_interaction(
    interaction_data: dict,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Track AI interactions for analytics

    Expected payload:
    {
        "interaction_type": "assistant" | "recommendation" | "suggestion" | "verification",
        "feature": "product_recommendation" | "chatbot" | "project_suggestion" | "fraud_detection",
        "action": "query" | "click" | "view" | "accept" | "reject",
        "metadata": {}  # optional additional context
    }
    """
    try:
        from database import AIInteraction
        import json

        interaction = AIInteraction(
            user_id=current_user.id if current_user else None,
            interaction_type=interaction_data.get("interaction_type"),
            feature=interaction_data.get("feature"),
            action=interaction_data.get("action"),
            metadata=json.dumps(interaction_data.get("metadata", {}))
        )

        db.add(interaction)
        db.commit()

        return {"success": True, "message": "AI interaction tracked successfully"}
    except Exception as e:
        print(f"Error tracking AI interaction: {e}")
        return {"success": False, "message": str(e)}


# ============================================================================
# AI ACTIONS - Execute Actions on Behalf of User
# ============================================================================

class ActionRequest(BaseModel):
    message: str
    confirm: Optional[bool] = False


class DirectActionRequest(BaseModel):
    action: str
    parameters: Dict[str, Any]


@app.post("/ai/detect-action")
async def detect_action_from_message(
    request: ActionRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Detect if user message contains an action intent
    Returns action details and parameters without executing
    """
    detection = ai_actions.detect_action_intent(request.message, current_user)

    return {
        "has_action": detection.get("has_action", False),
        "action": detection.get("action"),
        "confidence": detection.get("confidence", 0),
        "parameters": detection.get("parameters", {}),
        "confirmation_needed": detection.get("confirmation_needed", False),
        "reasoning": detection.get("reasoning"),
        "message": request.message
    }


@app.post("/ai/execute-action")
async def execute_detected_action(
    request: DirectActionRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Execute a specific action with provided parameters
    Requires explicit confirmation from user
    """
    result = ai_actions.execute_action(
        action=request.action,
        user=current_user,
        db=db,
        parameters=request.parameters
    )

    return result


@app.get("/ai/available-actions")
async def get_available_actions(
    current_user: User = Depends(get_current_user_optional)
):
    """
    Get list of actions available to the current user
    """
    actions = ai_actions.get_available_actions_for_user(current_user)

    return {
        "actions": actions,
        "total": len(actions),
        "user_authenticated": current_user is not None
    }


@app.post("/ai/action-from-chat")
async def detect_and_execute_action(
    request: ActionRequest,
    current_user: User = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Detect action from message and execute if confirmed
    This is a combined endpoint for seamless UX
    """
    # Detect action
    detection = ai_actions.detect_action_intent(request.message, current_user)

    if not detection.get("has_action") or detection.get("confidence", 0) < 0.7:
        return {
            "has_action": False,
            "message": "No clear action detected in your message. Try being more specific.",
            "suggestions": [
                "Create a project called [name]",
                "Join [guild name] guild",
                "Search for products under $100"
            ]
        }

    # Check if confirmation is needed and not provided
    if detection.get("confirmation_needed", False) and not request.confirm:
        return {
            "has_action": True,
            "action": detection["action"],
            "parameters": detection.get("parameters", {}),
            "confirmation_needed": True,
            "message": f"I detected that you want to {detection['action'].replace('_', ' ')}. Please confirm to proceed.",
            "requires_confirmation": True
        }

    # Execute action
    result = ai_actions.execute_action(
        action=detection["action"],
        user=current_user,
        db=db,
        parameters=detection.get("parameters", {})
    )

    return {
        "has_action": True,
        "action": detection["action"],
        "executed": True,
        "result": result
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
