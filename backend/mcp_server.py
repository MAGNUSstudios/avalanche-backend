
"""
Avalanche Platform MCP Router
Model Context Protocol router for AI assistants to interact with the Avalanche platform
"""

from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, ValidationError, validator
from typing import List, Dict, Any, Optional, Union
import json
import os
import hashlib
import hmac
import time
import re
from datetime import datetime, timedelta
from functools import wraps
import logging
import bleach
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded

from database import get_db, User, Guild, Project, Product, Escrow
from auth import get_current_user_optional, get_current_user, verify_password
from schemas import (
    UserResponse, GuildResponse, ProjectResponse, ProductResponse,
    GuildCreate, ProjectCreate, ProductCreate
)

# Configure logging
logger = logging.getLogger(__name__)

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Security configuration
SECURITY_CONFIG = {
    "max_request_size": 1024 * 1024,  # 1MB
    "max_string_length": 10000,
    "max_list_length": 100,
    "allowed_html_tags": [],  # No HTML allowed
    "allowed_html_attrs": {},
    "sql_injection_patterns": [
        r';\s*--', r';\s*/\*', r'\*/', r'union\s+select', r'information_schema',
        r'load_file', r'into\s+outfile', r'script\s*>', r'<\s*script'
    ]
}

# Security Models
class APIKey(BaseModel):
    key: str
    secret: str
    user_id: int
    permissions: List[str] = Field(default_factory=lambda: ["read"])
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    is_active: bool = True

class RateLimitConfig(BaseModel):
    requests_per_minute: int = 60
    requests_per_hour: int = 1000
    burst_limit: int = 10

class SanitizedString(str):
    """String type that automatically sanitizes input"""

    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise ValueError('String required')
        if len(v) > SECURITY_CONFIG["max_string_length"]:
            raise ValueError(f'String too long (max {SECURITY_CONFIG["max_string_length"]} characters)')
        # Sanitize HTML and check for SQL injection
        sanitized = bleach.clean(v, tags=SECURITY_CONFIG["allowed_html_tags"], attributes=SECURITY_CONFIG["allowed_html_attrs"])
        cls._check_sql_injection(sanitized)
        return cls(sanitized)

    @classmethod
    def _check_sql_injection(cls, value: str):
        """Check for common SQL injection patterns"""
        for pattern in SECURITY_CONFIG["sql_injection_patterns"]:
            if re.search(pattern, value, re.IGNORECASE):
                raise ValueError('Potentially malicious input detected')

class SecureToolCall(BaseModel):
    """Secure tool call with input validation"""
    id: str
    type: str = "function"
    function: Dict[str, Any]

    @validator('function')
    def validate_function(cls, v):
        if not isinstance(v, dict) or 'name' not in v or 'arguments' not in v:
            raise ValueError('Invalid function call format')
        return v

# MCP Protocol Models
class MCPTool(BaseModel):
    name: str
    description: str
    input_schema: Dict[str, Any]

class MCPToolCall(BaseModel):
    id: str
    type: str = "function"
    function: Dict[str, Any]

class MCPMessage(BaseModel):
    role: str
    content: str
    tool_calls: Optional[List[MCPToolCall]] = None
    tool_call_id: Optional[str] = None

class MCPRequest(BaseModel):
    messages: List[MCPMessage]
    tools: Optional[List[MCPTool]] = None
    tool_choice: Optional[str] = None

    @validator('messages')
    def validate_messages(cls, v):
        if len(v) > 50:  # Prevent message spam
            raise ValueError('Too many messages (max 50)')
        return v

class MCPResponse(BaseModel):
    messages: List[MCPMessage]

    @validator('messages')
    def validate_response_messages(cls, v):
        if len(v) > 10:  # Limit response messages
            raise ValueError('Too many response messages (max 10)')
        return v

# Security Functions
def generate_api_key():
    """Generate a secure API key"""
    return hashlib.sha256(os.urandom(32)).hexdigest()[:32]

def generate_api_secret():
    """Generate a secure API secret"""
    return hashlib.sha256(os.urandom(32)).hexdigest()

def verify_hmac_signature(api_key: str, api_secret: str, request_body: str, signature: str, timestamp: str) -> bool:
    """Verify HMAC signature for API key authentication"""
    message = f"{timestamp}.{request_body}"
    expected_signature = hmac.new(
        api_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_signature, signature)

def check_rate_limit(identifier: str, config: RateLimitConfig) -> bool:
    """Check if request is within rate limits"""
    now = datetime.utcnow()
    minute_ago = now - timedelta(minutes=1)
    hour_ago = now - timedelta(hours=1)

    # Clean old entries
    rate_limit_store[identifier] = [
        req_time for req_time in rate_limit_store.get(identifier, [])
        if req_time > hour_ago
    ]

    requests = rate_limit_store[identifier]

    # Check burst limit (requests in last 10 seconds)
    recent_requests = [req for req in requests if req > now - timedelta(seconds=10)]
    if len(recent_requests) >= config.burst_limit:
        return False

    # Check per minute limit
    minute_requests = [req for req in requests if req > minute_ago]
    if len(minute_requests) >= config.requests_per_minute:
        return False

    # Check per hour limit
    if len(requests) >= config.requests_per_hour:
        return False

    # Add current request
    requests.append(now)
    return True

def validate_request_size(request: Request) -> None:
    """Validate request size to prevent DoS attacks"""
    content_length = request.headers.get('content-length')
    if content_length:
        try:
            size = int(content_length)
            if size > SECURITY_CONFIG["max_request_size"]:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Request too large (max {SECURITY_CONFIG['max_request_size']} bytes)"
                )
        except ValueError:
            pass  # Invalid content-length header, let FastAPI handle it

def sanitize_input(data: Any) -> Any:
    """Recursively sanitize input data"""
    if isinstance(data, str):
        return bleach.clean(data, tags=SECURITY_CONFIG["allowed_html_tags"], attributes=SECURITY_CONFIG["allowed_html_attrs"])
    elif isinstance(data, dict):
        return {k: sanitize_input(v) for k, v in data.items()}
    elif isinstance(data, list):
        if len(data) > SECURITY_CONFIG["max_list_length"]:
            raise ValueError(f"List too long (max {SECURITY_CONFIG['max_list_length']} items)")
        return [sanitize_input(item) for item in data]
    else:
        return data

def require_permission(permission: str):
    """Decorator to require specific permission"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract user from kwargs (assuming it's passed by dependency)
            user = kwargs.get('user')
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )

            # Check if user has required permission
            # This would need to be implemented based on your user permission system
            user_permissions = getattr(user, 'permissions', [])
            if permission not in user_permissions and user.role != 'admin':
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission '{permission}' required"
                )

            return await func(*args, **kwargs)
        return wrapper
    return decorator

# Tool Registry with Security
class ToolRegistry:
    def __init__(self):
        self.tools = {}
        self.tool_permissions = {}  # tool_name -> required_permission

    def register(self, name: str, description: str, input_schema: Dict[str, Any], handler, permission: str = "read"):
        self.tools[name] = {
            "name": name,
            "description": description,
            "input_schema": input_schema,
            "handler": handler
        }
        self.tool_permissions[name] = permission

    def get_tool(self, name: str):
        return self.tools.get(name)

    def get_required_permission(self, name: str) -> str:
        return self.tool_permissions.get(name, "read")

    def list_tools(self, user_permissions: List[str] = None):
        """List tools accessible to user based on permissions"""
        if user_permissions is None:
            user_permissions = ["read"]

        accessible_tools = []
        for tool_name, tool in self.tools.items():
            required_perm = self.tool_permissions.get(tool_name, "read")
            if required_perm in user_permissions or "admin" in user_permissions:
                accessible_tools.append(tool)

        return accessible_tools

    def validate_tool_params(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Validate tool parameters against schema with enhanced security"""
        tool = self.get_tool(tool_name)
        if not tool:
            raise ValueError(f"Tool '{tool_name}' not found")

        schema = tool["input_schema"]
        required_fields = schema.get("required", [])

        # Sanitize all input parameters first
        sanitized_params = sanitize_input(params)

        # Check required fields
        for field in required_fields:
            if field not in sanitized_params:
                raise ValidationError(f"Missing required parameter: {field}")

        # Enhanced type validation with security checks
        properties = schema.get("properties", {})
        for param_name, param_value in sanitized_params.items():
            if param_name in properties:
                param_schema = properties[param_name]
                param_type = param_schema.get("type")

                # Type validation
                if param_type == "integer":
                    if not isinstance(param_value, int):
                        try:
                            sanitized_params[param_name] = int(param_value)
                        except (ValueError, TypeError):
                            raise ValidationError(f"Parameter '{param_name}' must be an integer")
                elif param_type == "number":
                    if not isinstance(param_value, (int, float)):
                        try:
                            sanitized_params[param_name] = float(param_value)
                        except (ValueError, TypeError):
                            raise ValidationError(f"Parameter '{param_name}' must be a number")
                elif param_type == "string":
                    if not isinstance(param_value, str):
                        raise ValidationError(f"Parameter '{param_name}' must be a string")
                    # Additional string validation
                    max_length = param_schema.get("maxLength", SECURITY_CONFIG["max_string_length"])
                    if len(param_value) > max_length:
                        raise ValidationError(f"Parameter '{param_name}' too long (max {max_length} characters)")
                elif param_type == "boolean":
                    if not isinstance(param_value, bool):
                        # Convert string booleans
                        if isinstance(param_value, str):
                            if param_value.lower() in ('true', '1', 'yes'):
                                sanitized_params[param_name] = True
                            elif param_value.lower() in ('false', '0', 'no'):
                                sanitized_params[param_name] = False
                            else:
                                raise ValidationError(f"Parameter '{param_name}' must be a boolean")
                        else:
                            raise ValidationError(f"Parameter '{param_name}' must be a boolean")

                # Range validation for numbers
                if param_type in ("integer", "number"):
                    minimum = param_schema.get("minimum")
                    maximum = param_schema.get("maximum")
                    if minimum is not None and param_value < minimum:
                        raise ValidationError(f"Parameter '{param_name}' must be >= {minimum}")
                    if maximum is not None and param_value > maximum:
                        raise ValidationError(f"Parameter '{param_name}' must be <= {maximum}")

        return sanitized_params

    def register_tool_with_decorator(self, permission: str = "read"):
        """Decorator for registering tools with automatic schema generation"""
        def decorator(func):
            tool_name = func.__name__
            docstring = func.__doc__ or f"Execute {tool_name}"

            # Generate schema from function annotations (basic implementation)
            input_schema = {"type": "object", "properties": {}, "required": []}

            # This would be enhanced to parse function signatures
            # For now, tools are registered manually

            self.register(
                name=tool_name,
                description=docstring,
                input_schema=input_schema,
                handler=func,
                permission=permission
            )

            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return decorator

# Initialize tool registry
tool_registry = ToolRegistry()

# FastAPI MCP Router
from fastapi import APIRouter

router = APIRouter(
    prefix="/mcp",
    tags=["MCP Server"]
)

# Note: Middleware is handled at the app level in main.py
# Individual router middleware is not supported in FastAPI routers

# Authentication dependencies for MCP
def get_mcp_auth(request: Request, db: Session = Depends(get_db)):
    """Multi-method authentication for MCP requests"""
    # Method 1: Bearer token (JWT)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            user = get_current_user_optional(token, db)
            if user:
                return user
        except Exception as e:
            logger.warning(f"JWT authentication failed: {e}")

    # Method 2: API Key authentication
    api_key = request.headers.get("X-API-Key")
    api_secret = request.headers.get("X-API-Secret")
    signature = request.headers.get("X-Signature")
    timestamp = request.headers.get("X-Timestamp")

    if api_key and api_secret and signature and timestamp:
        try:
            # Verify timestamp (prevent replay attacks)
            req_timestamp = int(timestamp)
            now = int(time.time())
            if abs(now - req_timestamp) > 300:  # 5 minute window
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Request timestamp expired"
                )

            # Get request body for signature verification
            # Note: This needs to be called from within an async endpoint context
            # For now, we'll skip body verification in this auth function
            # Body verification should be done at the endpoint level

            # Find user by API key (this would need a database table in production)
            # For now, return a mock user - in production implement proper API key storage
            mock_user = User(
                id=999,
                email="api@example.com",
                first_name="API",
                last_name="User",
                role="api_user"
            )
            return mock_user
        except Exception as e:
            logger.warning(f"API key authentication failed: {e}")

    return None

def get_mcp_auth_required(request: Request, db: Session = Depends(get_db)):
    """Required authentication for MCP requests - Business users only"""
    user = get_mcp_auth(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Use Bearer token or API key authentication."
        )

    # Check if user has business tier
    if user.ai_tier != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to Business tier users only. Please upgrade your plan to access MCP features."
        )

    return user

# JWT Bearer token authentication
security = HTTPBearer(auto_error=False)

def get_current_user_jwt(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="JWT token required"
        )

    try:
        # Decode and verify JWT token
        user = get_current_user(credentials.credentials, db)
        return user
    except Exception as e:
        logger.warning(f"JWT authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT token"
        )

def get_mcp_rate_limited(request: Request, user: User = Depends(get_mcp_auth)):
    """Rate limiting dependency"""
    # Use user ID or IP as identifier
    identifier = f"user_{user.id}" if user else f"ip_{request.client.host}"

    config = RateLimitConfig()
    if not check_rate_limit(identifier, config):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )

    return user

# Tool Handlers
def search_products_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Search products with filters"""
    query = db.query(Product).filter(Product.is_active == True)

    if params.get("search"):
        search_term = f"%{params['search']}%"
        query = query.filter(
            (Product.name.ilike(search_term)) | (Product.description.ilike(search_term))
        )

    if params.get("category"):
        query = query.filter(Product.category.ilike(params["category"]))

    if params.get("min_price"):
        query = query.filter(Product.price >= params["min_price"])

    if params.get("max_price"):
        query = query.filter(Product.price <= params["max_price"])

    limit = min(params.get("limit", 10), 50)
    products = query.limit(limit).all()

    return {
        "products": [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "price": p.price,
                "category": p.category,
                "seller_id": p.seller_id,
                "image_url": p.image_url
            } for p in products
        ],
        "count": len(products)
    }

def get_product_details_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Get detailed product information"""
    product_id = params.get("product_id")
    if not product_id:
        raise ValueError("product_id is required")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError(f"Product with id {product_id} not found")

    return {
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "stock": product.stock,
        "seller_id": product.seller_id,
        "image_url": product.image_url,
        "is_active": product.is_active,
        "created_at": product.created_at.isoformat() if product.created_at else None
    }

def create_product_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Create a new product (requires authentication)"""
    if not user:
        raise ValueError("Authentication required to create products")

    required_fields = ["name", "price"]
    for field in required_fields:
        if field not in params:
            raise ValueError(f"{field} is required")

    new_product = Product(
        name=params["name"],
        description=params.get("description", ""),
        price=params["price"],
        category=params.get("category"),
        stock=params.get("stock", 0),
        image_url=params.get("image_url"),
        seller_id=user.id
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return {
        "id": new_product.id,
        "name": new_product.name,
        "message": "Product created successfully"
    }

def update_product_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Update product (requires ownership)"""
    if not user:
        raise ValueError("Authentication required to update products")

    product_id = params.get("product_id")
    if not product_id:
        raise ValueError("product_id is required")

    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise ValueError(f"Product with id {product_id} not found")

    if product.seller_id != user.id:
        raise ValueError("You can only update your own products")

    # Update allowed fields
    allowed_fields = ["name", "description", "price", "category", "stock", "image_url"]
    for field in allowed_fields:
        if field in params:
            setattr(product, field, params[field])

    db.commit()
    db.refresh(product)

    return {
        "id": product.id,
        "name": product.name,
        "message": "Product updated successfully"
    }

def search_users_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Search users by name or email"""
    search_term = params.get("search", "").strip()
    if not search_term:
        raise ValueError("search term is required")

    limit = min(params.get("limit", 10), 50)
    users = db.query(User).filter(
        (User.first_name.ilike(f"%{search_term}%")) |
        (User.last_name.ilike(f"%{search_term}%")) |
        (User.email.ilike(f"%{search_term}%"))
    ).limit(limit).all()

    return {
        "users": [
            {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                "country": u.country,
                "avatar_url": u.avatar_url
            } for u in users
        ],
        "count": len(users)
    }

def get_user_profile_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Get user profile by ID"""
    user_id = params.get("user_id")
    if not user_id:
        raise ValueError("user_id is required")

    profile_user = db.query(User).filter(User.id == user_id).first()
    if not profile_user:
        raise ValueError(f"User with id {user_id} not found")

    return {
        "id": profile_user.id,
        "first_name": profile_user.first_name,
        "last_name": profile_user.last_name,
        "email": profile_user.email,
        "country": profile_user.country,
        "avatar_url": profile_user.avatar_url,
        "bio": profile_user.bio,
        "username": profile_user.username
    }

def update_user_profile_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Update user profile (requires authentication)"""
    if not user:
        raise ValueError("Authentication required to update profile")

    # Update allowed fields
    allowed_fields = ["first_name", "last_name", "country", "avatar_url", "bio", "username"]
    for field in allowed_fields:
        if field in params:
            setattr(user, field, params[field])

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "message": "Profile updated successfully"
    }

def search_guilds_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Search guilds"""
    query = db.query(Guild).filter(Guild.is_private == False)

    if params.get("search"):
        search_term = f"%{params['search']}%"
        query = query.filter(
            (Guild.name.ilike(search_term)) | (Guild.description.ilike(search_term))
        )

    if params.get("category"):
        query = query.filter(Guild.category.ilike(params["category"]))

    limit = min(params.get("limit", 10), 50)
    guilds = query.limit(limit).all()

    return {
        "guilds": [
            {
                "id": g.id,
                "name": g.name,
                "description": g.description,
                "category": g.category,
                "member_count": g.member_count,
                "owner_id": g.owner_id,
                "avatar_url": g.avatar_url
            } for g in guilds
        ],
        "count": len(guilds)
    }

def get_guild_details_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Get detailed guild information"""
    guild_id = params.get("guild_id")
    if not guild_id:
        raise ValueError("guild_id is required")

    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise ValueError(f"Guild with id {guild_id} not found")

    return {
        "id": guild.id,
        "name": guild.name,
        "description": guild.description,
        "category": guild.category,
        "member_count": guild.member_count,
        "owner_id": guild.owner_id,
        "avatar_url": guild.avatar_url,
        "banner_url": guild.banner_url,
        "is_private": guild.is_private,
        "created_at": guild.created_at.isoformat() if guild.created_at else None
    }

def join_guild_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Join a guild (requires authentication)"""
    if not user:
        raise ValueError("Authentication required to join guilds")

    guild_id = params.get("guild_id")
    if not guild_id:
        raise ValueError("guild_id is required")

    guild = db.query(Guild).filter(Guild.id == guild_id).first()
    if not guild:
        raise ValueError(f"Guild with id {guild_id} not found")

    # Check if already a member
    from database import guild_members
    existing = db.query(guild_members).filter(
        guild_members.c.user_id == user.id,
        guild_members.c.guild_id == guild_id
    ).first()

    if existing:
        raise ValueError("Already a member of this guild")

    # Add to guild
    db.execute(guild_members.insert().values(user_id=user.id, guild_id=guild_id))
    guild.member_count += 1
    db.commit()

    return {
        "guild_id": guild_id,
        "message": "Successfully joined guild"
    }

def create_guild_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Create a new guild (requires authentication)"""
    if not user:
        raise ValueError("Authentication required to create guilds")

    required_fields = ["name"]
    for field in required_fields:
        if field not in params:
            raise ValueError(f"{field} is required")

    new_guild = Guild(
        name=params["name"],
        description=params.get("description", ""),
        category=params.get("category"),
        is_private=params.get("is_private", False),
        owner_id=user.id,
        member_count=1
    )

    db.add(new_guild)
    db.commit()
    db.refresh(new_guild)

    # Add creator as member
    from database import guild_members
    db.execute(guild_members.insert().values(user_id=user.id, guild_id=new_guild.id))
    db.commit()

    return {
        "id": new_guild.id,
        "name": new_guild.name,
        "message": "Guild created successfully"
    }

def search_projects_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Search projects"""
    query = db.query(Project).filter(Project.status == "active")

    if params.get("search"):
        search_term = f"%{params['search']}%"
        query = query.filter(
            (Project.title.ilike(search_term)) | (Project.description.ilike(search_term))
        )

    if params.get("guild_id"):
        query = query.filter(Project.guild_id == params["guild_id"])

    if params.get("status"):
        query = query.filter(Project.status == params["status"])

    limit = min(params.get("limit", 10), 50)
    projects = query.limit(limit).all()

    return {
        "projects": [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description,
                "status": p.status,
                "budget": p.budget,
                "deadline": p.deadline.isoformat() if p.deadline else None,
                "owner_id": p.owner_id,
                "guild_id": p.guild_id
            } for p in projects
        ],
        "count": len(projects)
    }

def get_project_details_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Get detailed project information"""
    project_id = params.get("project_id")
    if not project_id:
        raise ValueError("project_id is required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with id {project_id} not found")

    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "status": project.status,
        "budget": project.budget,
        "deadline": project.deadline.isoformat() if project.deadline else None,
        "owner_id": project.owner_id,
        "guild_id": project.guild_id,
        "created_at": project.created_at.isoformat() if project.created_at else None
    }

def create_project_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Create a new project (requires authentication)"""
    if not user:
        raise ValueError("Authentication required to create projects")

    required_fields = ["title"]
    for field in required_fields:
        if field not in params:
            raise ValueError(f"{field} is required")

    new_project = Project(
        title=params["title"],
        description=params.get("description", ""),
        budget=params.get("budget"),
        deadline=params.get("deadline"),
        guild_id=params.get("guild_id"),
        owner_id=user.id,
        creator_id=user.id,
        status="pending_payment"
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Add creator as member
    from database import project_members
    db.execute(project_members.insert().values(user_id=user.id, project_id=new_project.id))
    db.commit()

    return {
        "id": new_project.id,
        "title": new_project.title,
        "message": "Project created successfully"
    }

def apply_to_project_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Apply to work on a project (requires authentication)"""
    if not user:
        raise ValueError("Authentication required to apply to projects")

    project_id = params.get("project_id")
    if not project_id:
        raise ValueError("project_id is required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with id {project_id} not found")

    # Check if already applied
    from database import project_members
    existing = db.query(project_members).filter(
        project_members.c.user_id == user.id,
        project_members.c.project_id == project_id
    ).first()

    if existing:
        raise ValueError("Already applied to this project")

    # Add to project
    db.execute(project_members.insert().values(user_id=user.id, project_id=project_id))
    db.commit()

    return {
        "project_id": project_id,
        "message": "Successfully applied to project"
    }

# Escrow Tool Handlers
def get_escrow_status_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Get escrow status for an order"""
    order_id = params.get("order_id")
    if not order_id:
        raise ValueError("order_id is required")

    escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
    if not escrow:
        raise ValueError(f"No escrow found for order {order_id}")

    order = escrow.order

    return {
        "order_id": order_id,
        "escrow_id": escrow.id,
        "amount": escrow.amount,
        "status": escrow.status,
        "buyer_approved": escrow.buyer_approved,
        "delivery_confirmed": escrow.delivery_confirmed,
        "auto_release_days": escrow.auto_release_days,
        "requires_buyer_approval": escrow.requires_buyer_approval,
        "requires_delivery_confirmation": escrow.requires_delivery_confirmation,
        "dispute_reason": escrow.dispute_reason,
        "created_at": escrow.created_at.isoformat() if escrow.created_at else None,
        "released_at": escrow.released_at.isoformat() if escrow.released_at else None,
        "refunded_at": escrow.refunded_at.isoformat() if escrow.refunded_at else None,
        "order_details": {
            "item_name": order.item_name,
            "item_cost": order.item_cost,
            "buyer_id": order.buyer_id,
            "seller_id": order.seller_id
        }
    }

def release_escrow_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Release escrow funds to seller (requires buyer authentication)"""
    if not user:
        raise ValueError("Authentication required to release escrow")

    order_id = params.get("order_id")
    if not order_id:
        raise ValueError("order_id is required")

    escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
    if not escrow:
        raise ValueError(f"No escrow found for order {order_id}")

    order = escrow.order

    # Check if user is the buyer
    if order.buyer_id != user.id:
        raise ValueError("Only the buyer can release escrow funds")

    # Check escrow status
    if escrow.status != "held":
        raise ValueError(f"Escrow is already {escrow.status}")

    # Update escrow
    escrow.status = "released"
    escrow.buyer_approved = True
    escrow.delivery_confirmed = True
    escrow.released_at = datetime.utcnow()

    # Update order status
    order.status = "completed"
    order.completed_at = datetime.utcnow()

    db.commit()

    return {
        "order_id": order_id,
        "escrow_id": escrow.id,
        "amount_released": escrow.amount,
        "status": "released",
        "message": f"Escrow funds of ${escrow.amount:.2f} released to seller"
    }

def dispute_escrow_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Raise a dispute on an escrow (requires buyer or seller authentication)"""
    if not user:
        raise ValueError("Authentication required to dispute escrow")

    order_id = params.get("order_id")
    if not order_id:
        raise ValueError("order_id is required")

    dispute_reason = params.get("dispute_reason", "").strip()
    if not dispute_reason:
        raise ValueError("dispute_reason is required")

    escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
    if not escrow:
        raise ValueError(f"No escrow found for order {order_id}")

    order = escrow.order

    # Check if user is buyer or seller
    if order.buyer_id != user.id and order.seller_id != user.id:
        raise ValueError("Only buyer or seller can dispute escrow")

    # Check escrow status
    if escrow.status != "held":
        raise ValueError(f"Cannot dispute escrow that is {escrow.status}")

    # Update escrow with dispute
    escrow.status = "disputed"
    escrow.dispute_reason = dispute_reason

    db.commit()

    return {
        "order_id": order_id,
        "escrow_id": escrow.id,
        "status": "disputed",
        "dispute_reason": dispute_reason,
        "message": "Dispute raised on escrow. Admin will review the case."
    }

def get_project_escrow_status_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Get escrow status for a project"""
    project_id = params.get("project_id")
    if not project_id:
        raise ValueError("project_id is required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with id {project_id} not found")

    return {
        "project_id": project_id,
        "title": project.title,
        "workflow_status": project.workflow_status,
        "agreed_price": project.agreed_price,
        "escrow_funded": project.escrow_funded,
        "escrow_amount": project.escrow_amount,
        "freelancer_id": project.freelancer_id,
        "owner_id": project.owner_id,
        "escrow_funded_at": project.escrow_funded_at.isoformat() if project.escrow_funded_at else None,
        "completed_at": project.completed_at.isoformat() if project.completed_at else None,
        "payment_released_at": project.payment_released_at.isoformat() if project.payment_released_at else None
    }

def fund_project_escrow_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Fund escrow for a project (requires project owner authentication)"""
    if not user:
        raise ValueError("Authentication required to fund project escrow")

    project_id = params.get("project_id")
    if not project_id:
        raise ValueError("project_id is required")

    amount = params.get("amount")
    if not amount or amount <= 0:
        raise ValueError("Valid amount is required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with id {project_id} not found")

    # Check if user is project owner
    if project.owner_id != user.id:
        raise ValueError("Only project owner can fund escrow")

    # Check workflow status
    if project.workflow_status != "price_agreed":
        raise ValueError(f"Project must be in price_agreed status. Current: {project.workflow_status}")

    # Check if already funded
    if project.escrow_funded:
        raise ValueError("Project escrow is already funded")

    # Check user wallet balance
    from database import Wallet
    wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
    if not wallet or wallet.balance < amount:
        raise ValueError("Insufficient wallet balance")

    # Deduct from wallet
    wallet.balance -= amount

    # Update project
    project.escrow_funded = True
    project.escrow_amount = amount
    project.escrow_funded_at = datetime.utcnow()
    project.workflow_status = "escrow_funded"

    # Create wallet transaction
    from database import WalletTransaction
    transaction = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type="debit",
        amount=amount,
        description=f"Escrow funding for project: {project.title}"
    )
    db.add(transaction)

    db.commit()

    return {
        "project_id": project_id,
        "amount_funded": amount,
        "workflow_status": "escrow_funded",
        "message": f"Successfully funded escrow with ${amount:.2f}"
    }

def release_project_payment_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Release project escrow payment to freelancer (requires project owner authentication)"""
    if not user:
        raise ValueError("Authentication required to release project payment")

    project_id = params.get("project_id")
    if not project_id:
        raise ValueError("project_id is required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with id {project_id} not found")

    # Check if user is project owner
    if project.owner_id != user.id:
        raise ValueError("Only project owner can release payment")

    # Check workflow status
    if project.workflow_status != "completed":
        raise ValueError(f"Project must be completed before releasing payment. Current: {project.workflow_status}")

    # Check if escrow is funded
    if not project.escrow_funded:
        raise ValueError("No escrow to release")

    # Check if payment already released
    if project.payment_released_at:
        raise ValueError("Payment already released")

    # Get freelancer wallet
    from database import Wallet
    freelancer_wallet = db.query(Wallet).filter(Wallet.user_id == project.freelancer_id).first()
    if not freelancer_wallet:
        raise ValueError("Freelancer wallet not found")

    # Credit freelancer wallet
    freelancer_wallet.balance += project.escrow_amount

    # Create wallet transaction
    from database import WalletTransaction
    transaction = WalletTransaction(
        wallet_id=freelancer_wallet.id,
        transaction_type="credit",
        amount=project.escrow_amount,
        description=f"Payment received for project: {project.title}"
    )
    db.add(transaction)

    # Update project
    project.payment_released_at = datetime.utcnow()
    project.escrow_funded = False  # Escrow is now empty

    db.commit()

    return {
        "project_id": project_id,
        "amount_released": project.escrow_amount,
        "freelancer_wallet_balance": freelancer_wallet.balance,
        "message": f"Payment of ${project.escrow_amount:.2f} released to freelancer"
    }

def submit_project_work_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Submit work for a project (requires freelancer authentication)"""
    if not user:
        raise ValueError("Authentication required to submit work")

    project_id = params.get("project_id")
    if not project_id:
        raise ValueError("project_id is required")

    description = params.get("description", "").strip()
    if not description:
        raise ValueError("Work description is required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with id {project_id} not found")

    # Check if user is the assigned freelancer
    if project.freelancer_id != user.id:
        raise ValueError("Only assigned freelancer can submit work")

    # Check workflow status
    if project.workflow_status != "escrow_funded":
        raise ValueError(f"Project must be in escrow_funded status. Current: {project.workflow_status}")

    # Create work submission
    from database import WorkSubmission
    submission = WorkSubmission(
        project_id=project_id,
        freelancer_id=user.id,
        description=description,
        files=params.get("files"),  # JSON string of file URLs
        status="pending"
    )
    db.add(submission)

    # Update project status
    project.workflow_status = "work_submitted"

    db.commit()
    db.refresh(submission)

    return {
        "project_id": project_id,
        "submission_id": submission.id,
        "description": description,
        "status": "pending",
        "message": "Work submitted successfully. Waiting for client approval."
    }

def approve_project_work_handler(params: Dict[str, Any], user: Optional[User], db: Session) -> Dict[str, Any]:
    """Approve submitted work and release escrow (requires project owner authentication)"""
    if not user:
        raise ValueError("Authentication required to approve work")

    project_id = params.get("project_id")
    if not project_id:
        raise ValueError("project_id is required")

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError(f"Project with id {project_id} not found")

    # Check if user is project owner
    if project.owner_id != user.id:
        raise ValueError("Only project owner can approve work")

    # Check workflow status
    if project.workflow_status != "work_submitted":
        raise ValueError(f"Project must have submitted work. Current: {project.workflow_status}")

    # Update project
    project.workflow_status = "completed"
    project.completed_at = datetime.utcnow()

    db.commit()

    return {
        "project_id": project_id,
        "workflow_status": "completed",
        "message": "Work approved. You can now release the payment from escrow."
    }

# Register Tools with Permissions
def register_tools():
    # Products tools
    tool_registry.register(
        "search_products",
        "Search for products with optional filters",
        {
            "type": "object",
            "properties": {
                "search": {"type": "string", "description": "Search term for product name or description"},
                "category": {"type": "string", "description": "Product category filter"},
                "min_price": {"type": "number", "description": "Minimum price filter"},
                "max_price": {"type": "number", "description": "Maximum price filter"},
                "limit": {"type": "integer", "description": "Maximum number of results", "default": 10}
            }
        },
        search_products_handler,
        "read"
    )

    tool_registry.register(
        "get_product_details",
        "Get detailed information about a specific product",
        {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer", "description": "Product ID"}
            },
            "required": ["product_id"]
        },
        get_product_details_handler,
        "read"
    )

    tool_registry.register(
        "create_product",
        "Create a new product listing (requires authentication)",
        {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Product name"},
                "description": {"type": "string", "description": "Product description"},
                "price": {"type": "number", "description": "Product price"},
                "category": {"type": "string", "description": "Product category"},
                "stock": {"type": "integer", "description": "Stock quantity", "default": 0},
                "image_url": {"type": "string", "description": "Product image URL"}
            },
            "required": ["name", "price"]
        },
        create_product_handler,
        "write"
    )

    tool_registry.register(
        "update_product",
        "Update an existing product (requires ownership)",
        {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer", "description": "Product ID"},
                "name": {"type": "string", "description": "Product name"},
                "description": {"type": "string", "description": "Product description"},
                "price": {"type": "number", "description": "Product price"},
                "category": {"type": "string", "description": "Product category"},
                "stock": {"type": "integer", "description": "Stock quantity"},
                "image_url": {"type": "string", "description": "Product image URL"}
            },
            "required": ["product_id"]
        },
        update_product_handler,
        "write"
    )

    # Users tools
    tool_registry.register(
        "search_users",
        "Search for users by name or email",
        {
            "type": "object",
            "properties": {
                "search": {"type": "string", "description": "Search term"},
                "limit": {"type": "integer", "description": "Maximum number of results", "default": 10}
            },
            "required": ["search"]
        },
        search_users_handler,
        "read"
    )

    tool_registry.register(
        "get_user_profile",
        "Get detailed user profile information",
        {
            "type": "object",
            "properties": {
                "user_id": {"type": "integer", "description": "User ID"}
            },
            "required": ["user_id"]
        },
        get_user_profile_handler,
        "read"
    )

    tool_registry.register(
        "update_user_profile",
        "Update user profile information (requires authentication)",
        {
            "type": "object",
            "properties": {
                "first_name": {"type": "string", "description": "First name"},
                "last_name": {"type": "string", "description": "Last name"},
                "country": {"type": "string", "description": "Country"},
                "avatar_url": {"type": "string", "description": "Avatar URL"},
                "bio": {"type": "string", "description": "User bio"},
                "username": {"type": "string", "description": "Username"}
            }
        },
        update_user_profile_handler,
        "write"
    )

    # Guilds tools
    tool_registry.register(
        "search_guilds",
        "Search for guilds with optional filters",
        {
            "type": "object",
            "properties": {
                "search": {"type": "string", "description": "Search term for guild name or description"},
                "category": {"type": "string", "description": "Guild category filter"},
                "limit": {"type": "integer", "description": "Maximum number of results", "default": 10}
            }
        },
        search_guilds_handler,
        "read"
    )

    tool_registry.register(
        "get_guild_details",
        "Get detailed information about a specific guild",
        {
            "type": "object",
            "properties": {
                "guild_id": {"type": "integer", "description": "Guild ID"}
            },
            "required": ["guild_id"]
        },
        get_guild_details_handler,
        "read"
    )

    tool_registry.register(
        "join_guild",
        "Join a guild (requires authentication)",
        {
            "type": "object",
            "properties": {
                "guild_id": {"type": "integer", "description": "Guild ID to join"}
            },
            "required": ["guild_id"]
        },
        join_guild_handler,
        "write"
    )

    tool_registry.register(
        "create_guild",
        "Create a new guild (requires authentication)",
        {
            "type": "object",
            "properties": {
                "name": {"type": "string", "description": "Guild name"},
                "description": {"type": "string", "description": "Guild description"},
                "category": {"type": "string", "description": "Guild category"},
                "is_private": {"type": "boolean", "description": "Whether guild is private", "default": False}
            },
            "required": ["name"]
        },
        create_guild_handler,
        "write"
    )

    # Projects tools
    tool_registry.register(
        "search_projects",
        "Search for projects with optional filters",
        {
            "type": "object",
            "properties": {
                "search": {"type": "string", "description": "Search term for project title or description"},
                "guild_id": {"type": "integer", "description": "Filter by guild ID"},
                "status": {"type": "string", "description": "Project status filter"},
                "limit": {"type": "integer", "description": "Maximum number of results", "default": 10}
            }
        },
        search_projects_handler,
        "read"
    )

    tool_registry.register(
        "get_project_details",
        "Get detailed information about a specific project",
        {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID"}
            },
            "required": ["project_id"]
        },
        get_project_details_handler,
        "read"
    )

    tool_registry.register(
        "create_project",
        "Create a new project (requires authentication)",
        {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Project title"},
                "description": {"type": "string", "description": "Project description"},
                "budget": {"type": "number", "description": "Project budget"},
                "deadline": {"type": "string", "description": "Project deadline (ISO format)"},
                "guild_id": {"type": "integer", "description": "Associated guild ID"}
            },
            "required": ["title"]
        },
        create_project_handler,
        "write"
    )

    tool_registry.register(
        "apply_to_project",
        "Apply to work on a project (requires authentication)",
        {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID to apply for"}
            },
            "required": ["project_id"]
        },
        apply_to_project_handler,
        "write"
    )

    # Escrow tools
    tool_registry.register(
        "get_escrow_status",
        "Get escrow status for an order",
        {
            "type": "object",
            "properties": {
                "order_id": {"type": "integer", "description": "Order ID"}
            },
            "required": ["order_id"]
        },
        get_escrow_status_handler,
        "read"
    )

    tool_registry.register(
        "release_escrow",
        "Release escrow funds to seller (requires buyer authentication)",
        {
            "type": "object",
            "properties": {
                "order_id": {"type": "integer", "description": "Order ID"}
            },
            "required": ["order_id"]
        },
        release_escrow_handler,
        "write"
    )

    tool_registry.register(
        "dispute_escrow",
        "Raise a dispute on an escrow (requires buyer or seller authentication)",
        {
            "type": "object",
            "properties": {
                "order_id": {"type": "integer", "description": "Order ID"},
                "dispute_reason": {"type": "string", "description": "Reason for the dispute"}
            },
            "required": ["order_id", "dispute_reason"]
        },
        dispute_escrow_handler,
        "write"
    )

    # Project Escrow tools
    tool_registry.register(
        "get_project_escrow_status",
        "Get escrow status for a project",
        {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID"}
            },
            "required": ["project_id"]
        },
        get_project_escrow_status_handler,
        "read"
    )

    tool_registry.register(
        "fund_project_escrow",
        "Fund escrow for a project (requires project owner authentication)",
        {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID"},
                "amount": {"type": "number", "description": "Amount to fund"}
            },
            "required": ["project_id", "amount"]
        },
        fund_project_escrow_handler,
        "write"
    )

    tool_registry.register(
        "release_project_payment",
        "Release project escrow payment to freelancer (requires project owner authentication)",
        {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID"}
            },
            "required": ["project_id"]
        },
        release_project_payment_handler,
        "write"
    )

    tool_registry.register(
        "submit_project_work",
        "Submit work for a project (requires freelancer authentication)",
        {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID"},
                "description": {"type": "string", "description": "Work description"},
                "files": {"type": "string", "description": "JSON string of file URLs"}
            },
            "required": ["project_id", "description"]
        },
        submit_project_work_handler,
        "write"
    )

    tool_registry.register(
        "approve_project_work",
        "Approve submitted work and release escrow (requires project owner authentication)",
        {
            "type": "object",
            "properties": {
                "project_id": {"type": "integer", "description": "Project ID"}
            },
            "required": ["project_id"]
        },
        approve_project_work_handler,
        "write"
    )

# Initialize tools on import
register_tools()

# MCP Endpoints
@router.get("/")
async def mcp_root(current_user: User = Depends(get_mcp_auth_required)):
    """MCP server health check - Business users only"""
    return {
        "message": "Avalanche MCP Server is running",
        "version": "1.0.0",
        "protocol": "MCP",
        "tools_available": len(tool_registry.list_tools()),
        "user_tier": current_user.ai_tier,
        "access_level": "business"
    }

@router.get("/tools")
async def list_tools(current_user: User = Depends(get_mcp_auth_required)):
    """List all available MCP tools - Business users only"""
    tools = tool_registry.list_tools()
    return {
        "tools": [
            {
                "name": tool["name"],
                "description": tool["description"],
                "input_schema": tool["input_schema"],
                "permission": tool["permission"]
            } for tool in tools
        ],
        "user_tier": current_user.ai_tier,
        "access_level": "business"
    }

@router.post("/tools/{tool_name}/call")
@limiter.limit("60/minute")
async def call_tool(
    tool_name: str,
    request: Request,
    user: Optional[User] = Depends(get_mcp_auth_required),
    db: Session = Depends(get_db)
):
    """Execute a specific MCP tool with enhanced security"""
    try:
        # Validate tool exists
        tool = tool_registry.get_tool(tool_name)
        if not tool:
            raise HTTPException(status_code=404, detail=f"Tool '{tool_name}' not found")

        # Check user permissions
        required_permission = tool_registry.get_required_permission(tool_name)
        if required_permission == "authenticated" and not user:
            raise HTTPException(status_code=401, detail="Authentication required for this tool")

        # Parse and validate request body
        body = await request.json()
        params = body.get("parameters", {})

        # Validate and sanitize parameters
        validated_params = tool_registry.validate_tool_params(tool_name, params)

        # Log tool execution for security monitoring
        logger.info(f"Tool executed: {tool_name} by user {user.id if user else 'anonymous'}")

        # Execute tool
        result = tool["handler"](validated_params, user, db)

        return {
            "tool_name": tool_name,
            "result": result,
            "success": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    except ValidationError as e:
        logger.warning(f"Parameter validation failed for tool {tool_name}: {e}")
        raise HTTPException(status_code=400, detail=f"Parameter validation error: {str(e)}")
    except ValueError as e:
        logger.warning(f"Tool execution error for {tool_name}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Tool execution failed for {tool_name}: {e}")
        raise HTTPException(status_code=500, detail=f"Tool execution failed: {str(e)}")

@router.post("/chat/completions")
async def mcp_chat_completions(
    request: MCPRequest,
    user: User = Depends(get_mcp_auth_required),
    db: Session = Depends(get_db)
):
    """MCP-compatible chat completions endpoint - Business users only"""
    # This is a simplified implementation - in production you'd integrate with actual LLM
    # For now, return a mock response showing tool availability

    tools_info = tool_registry.list_tools()
    tool_names = [t["name"] for t in tools_info]

    response_message = {
        "role": "assistant",
        "content": f"Welcome to Avalanche Business MCP! As a Business tier user, I have access to {len(tools_info)} powerful tools to help you manage your projects, products, and escrow operations. Available tools: {', '.join(tool_names)}. How can I assist you today?"
    }

    return {
        "messages": [response_message],
        "tools": tools_info,
        "user_tier": user.ai_tier,
        "access_level": "business"
    }
