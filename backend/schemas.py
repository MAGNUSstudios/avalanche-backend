from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ===== USER SCHEMAS =====
class UserCreate(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    country: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: Optional[str] = None
    first_name: str
    last_name: str
    country: str
    role: str = "user"
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    created_at: datetime
    ai_tier: Optional[str] = None
    plan_selected: bool = False

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None


class AdminProfileUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    avatar_url: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ===== GUILD SCHEMAS =====
class GuildCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_private: bool = False


class GuildUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_private: Optional[bool] = None


class GuildResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    is_private: bool
    member_count: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== PROJECT SCHEMAS =====
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[str] = None  # Accept string, will be converted in endpoint
    guild_id: Optional[int] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    budget: Optional[float] = None
    deadline: Optional[datetime] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    budget: Optional[float] = None
    deadline: Optional[datetime] = None
    owner_id: int
    guild_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== TASK SCHEMAS =====
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: str = "medium"
    project_id: int
    assignee_id: Optional[int] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee_id: Optional[int] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    assignee_id: Optional[int] = None
    project_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== PRODUCT SCHEMAS =====
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    stock: int = 0
    image_url: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    image_url: Optional[str] = None
    stock: int
    seller_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== MESSAGE SCHEMAS =====
class MessageCreate(BaseModel):
    content: str
    recipient_id: int


class MessageResponse(BaseModel):
    id: int
    content: str
    sender_id: int
    recipient_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===== ORDER SCHEMAS =====
class OrderCreate(BaseModel):
    product_id: Optional[int] = None
    project_id: Optional[int] = None
    seller_id: int
    item_name: str
    item_description: Optional[str] = None
    item_cost: float
    service_fee: float = 0.0
    payment_method: str  # card, bank_transfer, crypto


class OrderResponse(BaseModel):
    id: int
    order_number: str
    buyer_id: int
    seller_id: int
    product_id: Optional[int] = None
    project_id: Optional[int] = None
    item_name: str
    item_description: Optional[str] = None
    item_cost: float
    service_fee: float
    total_amount: float
    status: str
    payment_method: Optional[str] = None
    payment_provider: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderUpdate(BaseModel):
    status: Optional[str] = None


# ===== ESCROW SCHEMAS =====
class EscrowCreate(BaseModel):
    order_id: int
    amount: float
    auto_release_days: int = 7
    requires_buyer_approval: bool = True
    requires_delivery_confirmation: bool = True


class EscrowResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    status: str
    auto_release_days: int
    requires_buyer_approval: bool
    requires_delivery_confirmation: bool
    buyer_approved: bool
    delivery_confirmed: bool
    dispute_reason: Optional[str] = None
    created_at: datetime
    released_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EscrowAction(BaseModel):
    action: str  # approve, confirm_delivery, dispute, release, refund
    reason: Optional[str] = None


# ===== PAYMENT SCHEMAS =====
class PaymentInitialize(BaseModel):
    order_id: int
    payment_method: str  # card, bank_transfer
    payment_provider: str  # paystack, flutterwave


class PaymentResponse(BaseModel):
    id: int
    order_id: int
    amount: float
    currency: str
    payment_method: str
    payment_provider: str
    provider_reference: Optional[str] = None
    provider_transaction_id: Optional[str] = None
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    checkout_url: Optional[str] = None
    authorization_url: Optional[str] = None

    class Config:
        from_attributes = True


class PaymentVerify(BaseModel):
    provider_reference: str
    payment_provider: str


# ===== GUILD CHAT SCHEMAS =====
class GuildChatMessageCreate(BaseModel):
    content: str


class GuildChatMessageResponse(BaseModel):
    id: int
    guild_chat_id: int
    sender_id: int
    sender_name: str
    sender_avatar: Optional[str] = None
    content: str
    created_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True


class GuildChatResponse(BaseModel):
    id: int
    guild_id: int
    guild_name: str
    guild_avatar: Optional[str] = None
    created_at: datetime
    unread_count: int = 0
    last_message: Optional[dict] = None

    class Config:
        from_attributes = True


# ===== PROJECT CHAT SCHEMAS =====
class ProjectChatCreate(BaseModel):
    project_id: int
    freelancer_id: int


class ProjectChatMessageCreate(BaseModel):
    content: str


class ProjectChatMessageResponse(BaseModel):
    id: int
    chat_id: int
    sender_id: int
    content: str
    created_at: datetime
    is_deleted: bool

    class Config:
        from_attributes = True


class ProjectChatResponse(BaseModel):
    id: int
    project_id: int
    freelancer_id: int
    status: str
    last_message_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ===== WALLET SCHEMAS =====
class WalletResponse(BaseModel):
    id: int
    user_id: int
    balance: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WalletTransactionResponse(BaseModel):
    id: int
    wallet_id: int
    transaction_type: str
    amount: float
    description: str
    related_order_id: Optional[int] = None
    related_project_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WithdrawalRequestCreate(BaseModel):
    amount: float
    payout_method: str  # e.g., "bank_transfer", "paypal"
    payout_details: dict # e.g., {"account_number": "...", "bank_code": "..."}


class WithdrawalRequestResponse(BaseModel):
    id: int
    wallet_id: int
    amount: float
    status: str  # e.g., "pending", "approved", "rejected"
    payout_method: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

