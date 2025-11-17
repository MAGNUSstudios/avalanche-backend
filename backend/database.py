from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./avalanche.db")

# Configure connection pool for better handling of concurrent requests
# pool_size: number of connections to keep open
# max_overflow: number of additional connections that can be created under high load
# pool_timeout: seconds to wait before giving up on getting a connection from the pool
# pool_recycle: recycle connections after this many seconds (prevents stale connections)
# pool_pre_ping: verify connection is alive before using it
engine_config = {
    "connect_args": {"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    "pool_size": 20,  # Increased from default 5
    "max_overflow": 40,  # Increased from default 10
    "pool_timeout": 60,  # Increased from default 30
    "pool_recycle": 3600,  # Recycle connections after 1 hour
    "pool_pre_ping": True  # Test connections before using them
}

engine = create_engine(DATABASE_URL, **engine_config)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association tables for many-to-many relationships
guild_members = Table(
    'guild_members',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('guild_id', Integer, ForeignKey('guilds.id')),
    Column('joined_at', DateTime, default=datetime.utcnow)
)

project_members = Table(
    'project_members',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('project_id', Integer, ForeignKey('projects.id')),
    Column('joined_at', DateTime, default=datetime.utcnow)
)


class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    # AI Subscription Tier - Admins get "admin" tier with full access
    ai_tier = Column(String, default="admin", nullable=False)  # admin tier (unlimited access)
    plan_selected = Column(Boolean, default=True)  # Admins always have plan selected


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    country = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user")  # user (remove admin from here)
    avatar_url = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # AI Subscription Tier (Business-Level)
    ai_tier = Column(String, default=None, nullable=True)  # free, pro, business (None = not selected yet)
    ai_tier_expires_at = Column(DateTime, nullable=True)
    ai_requests_used = Column(Integer, default=0)  # Message count
    ai_tokens_used = Column(Integer, default=0)  # Token count (more accurate)
    ai_tokens_reset_at = Column(DateTime, default=datetime.utcnow)  # Monthly reset
    ai_requests_reset_at = Column(DateTime, default=datetime.utcnow)
    plan_selected = Column(Boolean, default=False)  # Track if user has chosen a plan

    # Notification Settings
    notify_account_activity = Column(Boolean, default=True)
    notify_security_alerts = Column(Boolean, default=True)
    notify_new_bids = Column(Boolean, default=True)
    notify_item_sold = Column(Boolean, default=False)

    # Privacy Settings
    share_anonymized_data = Column(Boolean, default=True)
    contribute_to_ai = Column(Boolean, default=False)
    personalized_recommendations = Column(Boolean, default=True)

    # Language Preference
    preferred_language = Column(String, default="en", nullable=False)  # en, es, fr, de

    # Relationships
    owned_guilds = relationship("Guild", back_populates="owner", foreign_keys="Guild.owner_id")
    guilds = relationship("Guild", secondary=guild_members, back_populates="members")
    owned_projects = relationship("Project", back_populates="owner", foreign_keys="Project.owner_id")
    projects = relationship("Project", secondary=project_members, back_populates="members")
    products = relationship("Product", back_populates="seller")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")


class Guild(Base):
    __tablename__ = "guilds"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    is_private = Column(Boolean, default=False)
    member_count = Column(Integer, default=1)
    owner_id = Column(Integer, ForeignKey('users.id'))
    rules = Column(Text, nullable=True)  # JSON string of rules array
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="owned_guilds", foreign_keys=[owner_id])
    members = relationship("User", secondary=guild_members, back_populates="guilds")
    projects = relationship("Project", back_populates="guild")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(String, default="active")  # active, completed, archived
    budget = Column(Float, nullable=True)
    deadline = Column(DateTime, nullable=True)
    owner_id = Column(Integer, ForeignKey('users.id'))
    creator_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Alias for compatibility
    guild_id = Column(Integer, ForeignKey('guilds.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # New escrow workflow fields
    freelancer_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Accepted freelancer
    workflow_status = Column(String, default="posted")  # posted, accepted, negotiating, price_agreed, escrow_funded, in_progress, completed, paid
    agreed_price = Column(Float, nullable=True)  # Price agreed upon by poster and freelancer
    subscription_paid = Column(Boolean, default=False)  # Has poster paid $25 subscription
    subscription_payment_ref = Column(String, nullable=True)  # Payment reference
    escrow_funded = Column(Boolean, default=False)  # Is money in escrow
    escrow_amount = Column(Float, nullable=True)  # Amount in escrow
    escrow_funded_at = Column(DateTime, nullable=True)  # When escrow was funded
    completed_at = Column(DateTime, nullable=True)  # When project was completed
    payment_released_at = Column(DateTime, nullable=True)  # When payment was released to freelancer

    # Relationships
    owner = relationship("User", back_populates="owned_projects", foreign_keys=[owner_id])
    guild = relationship("Guild", back_populates="projects")
    members = relationship("User", secondary=project_members, back_populates="projects")
    tasks = relationship("Task", back_populates="project")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, in_progress, completed
    priority = Column(String, default="medium")  # low, medium, high
    assignee_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    project_id = Column(Integer, ForeignKey('projects.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="tasks")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=True, index=True)
    image_url = Column(String, nullable=True)
    stock = Column(Integer, default=0)
    seller_id = Column(Integer, ForeignKey('users.id'))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    seller = relationship("User", back_populates="products")


class ProductKeyword(Base):
    """Store product category keywords for intelligent search expansion"""
    __tablename__ = "product_keywords"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False, index=True)  # e.g., 'shoe', 'laptop'
    keyword = Column(String, nullable=False, index=True)  # e.g., 'sneaker', 'macbook'
    weight = Column(Float, default=1.0)  # Relevance weight (higher = more relevant)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AIConversation(Base):
    """Store AI conversation history for context and memory"""
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)  # Null for anonymous
    session_id = Column(String, nullable=False, index=True)  # Unique session identifier
    user_message = Column(Text, nullable=False)
    ai_response = Column(Text, nullable=False)
    intent = Column(String, nullable=True)  # Detected intent
    context_summary = Column(Text, nullable=True)  # Summary of context for this message
    tokens_used = Column(Integer, default=0)  # Tokens consumed in this exchange
    session_total_tokens = Column(Integer, default=0)  # Running total for session
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    last_activity_at = Column(DateTime, default=datetime.utcnow)  # For session timeout tracking

    # Relationship
    user = relationship("User", backref="ai_conversations")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'))
    recipient_id = Column(Integer, ForeignKey('users.id'))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])


class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    author_id = Column(Integer, ForeignKey('users.id'))
    guild_id = Column(Integer, ForeignKey('guilds.id'))
    is_pinned = Column(Boolean, default=False)
    post_type = Column(String, default="post")  # post, announcement, project
    likes_count = Column(Integer, default=0)
    unlikes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User")
    guild = relationship("Guild")


# Post likes association table
post_likes = Table(
    'post_likes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True),
    Column('created_at', DateTime, default=datetime.utcnow)
)

# Post unlikes association table
post_unlikes = Table(
    'post_unlikes',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('post_id', Integer, ForeignKey('posts.id'), primary_key=True),
    Column('created_at', DateTime, default=datetime.utcnow)
)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    post_id = Column(Integer, ForeignKey('posts.id'))
    author_id = Column(Integer, ForeignKey('users.id'))
    parent_id = Column(Integer, ForeignKey('comments.id'), nullable=True)  # For nested replies
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User")
    post = relationship("Post")
    parent = relationship("Comment", remote_side=[id], backref="replies")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    buyer_id = Column(Integer, ForeignKey('users.id'))
    seller_id = Column(Integer, ForeignKey('users.id'))
    product_id = Column(Integer, ForeignKey('products.id'), nullable=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)

    # Order details
    item_name = Column(String, nullable=False)
    item_description = Column(Text, nullable=True)
    item_cost = Column(Float, nullable=False)
    service_fee = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)

    # Order status
    status = Column(String, default="pending")  # pending, paid, processing, completed, cancelled, refunded
    payment_method = Column(String, nullable=True)  # card, bank_transfer, crypto
    payment_provider = Column(String, nullable=True)  # paystack, flutterwave, avalanche

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
    product = relationship("Product", foreign_keys=[product_id])
    project = relationship("Project", foreign_keys=[project_id])


class Escrow(Base):
    __tablename__ = "escrows"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'), unique=True)

    # Escrow details
    amount = Column(Float, nullable=False)
    status = Column(String, default="held")  # held, released, refunded, disputed

    # Conditions
    auto_release_days = Column(Integer, default=7)  # Auto-release after N days
    requires_buyer_approval = Column(Boolean, default=True)
    requires_delivery_confirmation = Column(Boolean, default=True)

    # Tracking
    buyer_approved = Column(Boolean, default=False)
    delivery_confirmed = Column(Boolean, default=False)
    dispute_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    released_at = Column(DateTime, nullable=True)
    refunded_at = Column(DateTime, nullable=True)

    # Relationships
    order = relationship("Order", backref="escrow")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    reference = Column(String, unique=True, index=True, nullable=True)

    # Payment details
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    payment_method = Column(String, nullable=False)  # card, bank_transfer, crypto
    payment_provider = Column(String, nullable=False)  # paystack, flutterwave, avalanche

    # Provider references
    provider_reference = Column(String, unique=True, index=True, nullable=True)
    provider_transaction_id = Column(String, nullable=True)
    provider_response = Column(Text, nullable=True)  # JSON response from provider

    # Status
    status = Column(String, default="pending")  # pending, processing, success, failed, cancelled

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    order = relationship("Order", backref="payments")


class SellerPaymentInfo(Base):
    __tablename__ = "seller_payment_info"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)

    # Payment method type
    payment_method = Column(String, nullable=False)  # card, bank_account

    # Card details (encrypted in production)
    card_holder_name = Column(String, nullable=True)
    card_last_four = Column(String, nullable=True)
    card_type = Column(String, nullable=True)  # visa, mastercard, etc.

    # Bank account details
    bank_name = Column(String, nullable=True)
    account_number = Column(String, nullable=True)
    account_holder_name = Column(String, nullable=True)
    routing_number = Column(String, nullable=True)
    country_code = Column(String, nullable=True)  # ISO country code (e.g., 'NG', 'US', 'GB')

    # Payment provider integration
    stripe_account_id = Column(String, nullable=True)  # Stripe Connect account ID
    provider_customer_id = Column(String, nullable=True)

    # Verification status
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="payment_info")


class GuildChat(Base):
    __tablename__ = "guild_chats"

    id = Column(Integer, primary_key=True, index=True)
    guild_id = Column(Integer, ForeignKey('guilds.id'), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    guild = relationship("Guild", backref="guild_chat")
    messages = relationship("GuildChatMessage", back_populates="guild_chat", cascade="all, delete-orphan")


class GuildChatMessage(Base):
    __tablename__ = "guild_chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    guild_chat_id = Column(Integer, ForeignKey('guild_chats.id'), nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    guild_chat = relationship("GuildChat", back_populates="messages")
    sender = relationship("User")


class ProjectChat(Base):
    __tablename__ = "project_chats"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    freelancer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String, default="active")  # active, completed, closed
    last_message_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project")
    freelancer = relationship("User")
    messages = relationship("ProjectChatMessage", back_populates="chat", cascade="all, delete-orphan")


class ProjectChatMessage(Base):
    __tablename__ = "project_chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey('project_chats.id'), nullable=False)
    sender_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    chat = relationship("ProjectChat", back_populates="messages")
    sender = relationship("User")


class AIInteraction(Base):
    __tablename__ = "ai_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Nullable for anonymous tracking
    interaction_type = Column(String, nullable=False)  # 'assistant', 'recommendation', 'suggestion', 'verification'
    feature = Column(String, nullable=False)  # 'product_recommendation', 'chatbot', 'project_suggestion', 'fraud_detection'
    action = Column(String, nullable=False)  # 'query', 'click', 'view', 'accept', 'reject'
    extra_data = Column(Text, nullable=True)  # JSON string for additional context
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User")


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True, nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="wallet")
    transactions = relationship("WalletTransaction", back_populates="wallet")


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey('wallets.id'), nullable=False)
    transaction_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    related_order_id = Column(Integer, ForeignKey('orders.id'), nullable=True)
    related_project_id = Column(Integer, ForeignKey('projects.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    wallet = relationship("Wallet", back_populates="transactions")


class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"

    id = Column(Integer, primary_key=True, index=True)
    wallet_id = Column(Integer, ForeignKey('wallets.id'), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, default="pending", nullable=False)
    payout_method = Column(String, nullable=False)
    payout_details = Column(Text, nullable=False) # Storing as JSON string
    stripe_transfer_id = Column(String, nullable=True)  # Stripe transfer/payout ID
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    wallet = relationship("Wallet")


class WorkSubmission(Base):
    __tablename__ = "work_submissions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey('projects.id'), nullable=False)
    freelancer_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    description = Column(Text, nullable=False)
    files = Column(Text, nullable=True)  # JSON string of file URLs
    status = Column(String, default="pending", nullable=False)  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)
    reviewed_by = Column(Integer, ForeignKey('users.id'), nullable=True)

    # Relationships
    project = relationship("Project")
    freelancer = relationship("User", foreign_keys=[freelancer_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


def get_db():
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
