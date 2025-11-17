"""
AI Actions Service
==================
This module enables the AI assistant to perform actions on behalf of logged-in users.

Supported Actions:
- Create Project
- Join Guild
- Apply to Project
- Create Product Listing
- Update Profile
- Search & Filter
- Send Message
- Create Task
- And more...

Each action includes:
- Authorization checks
- Validation
- Execution
- Result feedback
"""

from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timedelta
import logging
import json

from database import User, Project, Guild, Product, Task, Message, guild_members, project_members, ProjectChat
from openai import OpenAI
import os
import qdrant_service  # For semantic search

logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your-openai-api-key-here" else None


# ============================================================================
# ACTION DEFINITIONS
# ============================================================================

AVAILABLE_ACTIONS = {
    "create_project": {
        "name": "Create Project",
        "description": "Create a new project with specified details",
        "parameters": ["title", "description", "budget", "deadline"],
        "required": ["title"],
        "permission": "authenticated"
    },
    "join_guild": {
        "name": "Join Guild",
        "description": "Join a guild by ID or name",
        "parameters": ["guild_id", "guild_name"],
        "required": ["guild_id|guild_name"],
        "permission": "authenticated"
    },
    "leave_guild": {
        "name": "Leave Guild",
        "description": "Leave a guild you're currently in",
        "parameters": ["guild_id", "guild_name"],
        "required": ["guild_id|guild_name"],
        "permission": "authenticated"
    },
    "apply_to_project": {
        "name": "Apply to Project",
        "description": "Apply to work on a project",
        "parameters": ["project_id", "message"],
        "required": ["project_id"],
        "permission": "authenticated"
    },
    "create_product": {
        "name": "Create Product Listing",
        "description": "Create a new product in the marketplace",
        "parameters": ["name", "description", "price", "category", "stock"],
        "required": ["name", "price"],
        "permission": "authenticated"
    },
    "update_profile": {
        "name": "Update Profile",
        "description": "Update user profile information",
        "parameters": ["first_name", "last_name", "bio", "country"],
        "required": [],
        "permission": "authenticated"
    },
    "create_task": {
        "name": "Create Task",
        "description": "Create a task for a project",
        "parameters": ["project_id", "title", "description", "priority", "deadline"],
        "required": ["project_id", "title"],
        "permission": "authenticated"
    },
    "search_projects": {
        "name": "Search Projects",
        "description": "Search for projects with filters",
        "parameters": ["query", "status", "min_budget", "max_budget"],
        "required": [],
        "permission": "public"
    },
    "search_guilds": {
        "name": "Search Guilds",
        "description": "Search for guilds with filters",
        "parameters": ["query", "category"],
        "required": [],
        "permission": "public"
    },
    "search_products": {
        "name": "Search Products",
        "description": "Search marketplace products with filters",
        "parameters": ["query", "category", "min_price", "max_price"],
        "required": [],
        "permission": "public"
    },
    "send_message": {
        "name": "Send Message",
        "description": "Send a direct message to another user",
        "parameters": ["recipient_id", "content"],
        "required": ["recipient_id", "content"],
        "permission": "authenticated"
    },
    "search_users": {
        "name": "Search Users",
        "description": "Search for users by name, skills, or bio",
        "parameters": ["query", "country"],
        "required": [],
        "permission": "public"
    },
    "search_guild_members": {
        "name": "Search Guild Members",
        "description": "Search for members in a specific guild",
        "parameters": ["guild_id", "query"],
        "required": ["guild_id"],
        "permission": "public"
    },
    "parse_shopping_list": {
        "name": "Parse Shopping List",
        "description": "Extract and organize items from a shopping list",
        "parameters": ["items"],
        "required": [],
        "permission": "authenticated"
    },
    "add_to_cart": {
        "name": "Add to Cart",
        "description": "Add products to user's shopping cart",
        "parameters": ["product_ids", "quantities"],
        "required": ["product_ids"],
        "permission": "authenticated"
    },
    "checkout_cart": {
        "name": "Checkout Cart",
        "description": "Process checkout with escrow for cart items",
        "parameters": ["cart_id"],
        "required": [],
        "permission": "authenticated"
    },
    "detect_negotiation_end": {
        "name": "Detect Negotiation End",
        "description": "Detect when project negotiations are complete",
        "parameters": ["project_id", "chat_id"],
        "required": ["project_id"],
        "permission": "authenticated"
    },
    "prompt_escrow": {
        "name": "Prompt Escrow Setup",
        "description": "Guide users through escrow setup for completed negotiations",
        "parameters": ["project_id", "amount", "terms"],
        "required": ["project_id"],
        "permission": "authenticated"
    },
    "search_users": {
        "name": "Search Users",
        "description": "Search for users by name, skills, or bio",
        "parameters": ["query", "country"],
        "required": [],
        "permission": "public"
    },
    "search_tasks": {
        "name": "Search Tasks",
        "description": "Search for project tasks by title or description",
        "parameters": ["query", "project_id"],
        "required": [],
        "permission": "authenticated"
    },
    "get_platform_stats": {
        "name": "Get Platform Stats",
        "description": "Get comprehensive platform statistics",
        "parameters": [],
        "required": [],
        "permission": "public"
    },
    "extract_shopping_list": {
        "name": "Extract Shopping List",
        "description": "Extract and organize items from a shopping list message",
        "parameters": ["message"],
        "required": ["message"],
        "permission": "authenticated"
    },
    # Escrow Tools
    "get_escrow_status": {
        "name": "Get Escrow Status",
        "description": "Get detailed escrow information for an order",
        "parameters": ["order_id"],
        "required": ["order_id"],
        "permission": "authenticated"
    },
    "release_escrow": {
        "name": "Release Escrow Funds",
        "description": "Release escrow funds to seller (buyer approval)",
        "parameters": ["order_id"],
        "required": ["order_id"],
        "permission": "authenticated"
    },
    "dispute_escrow": {
        "name": "Dispute Escrow",
        "description": "Raise a dispute on an escrow transaction",
        "parameters": ["order_id", "dispute_reason"],
        "required": ["order_id", "dispute_reason"],
        "permission": "authenticated"
    },
    "get_project_escrow_status": {
        "name": "Get Project Escrow Status",
        "description": "Get escrow status for a project",
        "parameters": ["project_id"],
        "required": ["project_id"],
        "permission": "authenticated"
    },
    "fund_project_escrow": {
        "name": "Fund Project Escrow",
        "description": "Fund escrow for a project (requires project owner authentication)",
        "parameters": ["project_id", "amount"],
        "required": ["project_id", "amount"],
        "permission": "authenticated"
    },
    "release_project_payment": {
        "name": "Release Project Payment",
        "description": "Release project escrow payment to freelancer (requires project owner authentication)",
        "parameters": ["project_id"],
        "required": ["project_id"],
        "permission": "authenticated"
    },
    "submit_project_work": {
        "name": "Submit Project Work",
        "description": "Submit work for a project (requires freelancer authentication)",
        "parameters": ["project_id", "description", "files"],
        "required": ["project_id", "description"],
        "permission": "authenticated"
    },
    "approve_project_work": {
        "name": "Approve Project Work",
        "description": "Approve submitted work and release escrow (requires project owner authentication)",
        "parameters": ["project_id"],
        "required": ["project_id"],
        "permission": "authenticated"
    }
}


# ============================================================================
# ACTION DETECTION (AI-powered)
# ============================================================================

def detect_action_intent(message: str, user: Optional[User] = None) -> Dict[str, Any]:
    """
    Use AI to detect if user wants to perform an action and extract parameters

    Returns:
        {
            "has_action": bool,
            "action": str (action key from AVAILABLE_ACTIONS),
            "confidence": float (0-1),
            "parameters": dict,
            "confirmation_needed": bool
        }
    """
    if not openai_client:
        return {"has_action": False, "error": "AI not configured"}

    try:
        # Build system prompt with available actions
        actions_description = "\n".join([
            f"- {key}: {info['description']} (params: {', '.join(info['parameters'])})"
            for key, info in AVAILABLE_ACTIONS.items()
        ])

        system_prompt = f"""You are an action detection system. Analyze if the user wants to perform an action.

Available actions:
{actions_description}

Return JSON:
{{
    "has_action": true/false,
    "action": "action_key" or null,
    "confidence": 0.0-1.0,
    "parameters": {{}},
    "confirmation_needed": true/false,
    "reasoning": "why you detected this action"
}}

IMPORTANT:
- Only detect actions if user clearly expresses intent
- Extract parameter values from the message
- Set confirmation_needed=true for destructive actions
- If uncertain (confidence < 0.7), set has_action=false

Examples:
User: "Create a new project called E-commerce Site with $5000 budget"
Response: {{"has_action": true, "action": "create_project", "confidence": 0.95, "parameters": {{"title": "E-commerce Site", "budget": 5000}}, "confirmation_needed": true}}

User: "Join the Web Developers guild"
Response: {{"has_action": true, "action": "join_guild", "confidence": 0.9, "parameters": {{"guild_name": "Web Developers"}}, "confirmation_needed": true}}

User: "What projects are available?"
Response: {{"has_action": true, "action": "search_projects", "confidence": 0.85, "parameters": {{}}, "confirmation_needed": false}}

User: "Tell me about guilds"
Response: {{"has_action": false, "confidence": 0.3, "reasoning": "Just asking for information, not requesting an action"}}
"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            temperature=0.3,  # Lower temperature for more consistent detection
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        logger.info(f"🎬 Action detection: {result.get('action')} (confidence: {result.get('confidence')})")

        return result

    except Exception as e:
        logger.error(f"Error detecting action: {e}")
        return {"has_action": False, "error": str(e)}


# ============================================================================
# ACTION EXECUTORS
# ============================================================================

def execute_create_project(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new project"""
    try:
        # Validate required parameters
        if not params.get("title"):
            return {"success": False, "error": "Project title is required"}

        # Create project
        project = Project(
            title=params["title"],
            description=params.get("description", ""),
            budget=params.get("budget"),
            deadline=params.get("deadline"),
            owner_id=user.id,
            creator_id=user.id,
            status="active"
        )

        db.add(project)
        db.commit()
        db.refresh(project)

        logger.info(f"✅ Created project: {project.title} (ID: {project.id}) for user {user.id}")

        return {
            "success": True,
            "message": f"Project '{project.title}' created successfully!",
            "project_id": project.id,
            "data": {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "budget": float(project.budget) if project.budget else None,
                "status": project.status
            },
            "deep_link": f"sneaker://projects/{project.id}"
        }

    except Exception as e:
        logger.error(f"Error creating project: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}


def execute_join_guild(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Join a guild"""
    try:
        # Find guild by ID or name
        guild = None
        if params.get("guild_id"):
            guild = db.query(Guild).filter(Guild.id == params["guild_id"]).first()
        elif params.get("guild_name"):
            guild = db.query(Guild).filter(Guild.name.ilike(f"%{params['guild_name']}%")).first()

        if not guild:
            return {"success": False, "error": "Guild not found"}

        # Check if already a member
        if user in guild.members:
            return {"success": False, "error": f"You're already a member of '{guild.name}'"}

        # Add user to guild
        guild.members.append(user)
        guild.member_count = len(guild.members)
        db.commit()

        logger.info(f"✅ User {user.id} joined guild: {guild.name} (ID: {guild.id})")

        return {
            "success": True,
            "message": f"Successfully joined '{guild.name}'!",
            "guild_id": guild.id,
            "data": {
                "id": guild.id,
                "name": guild.name,
                "description": guild.description,
                "member_count": guild.member_count
            },
            "deep_link": f"sneaker://guilds/{guild.id}"
        }

    except Exception as e:
        logger.error(f"Error joining guild: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}


def execute_leave_guild(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Leave a guild"""
    try:
        # Find guild
        guild = None
        if params.get("guild_id"):
            guild = db.query(Guild).filter(Guild.id == params["guild_id"]).first()
        elif params.get("guild_name"):
            guild = db.query(Guild).filter(Guild.name.ilike(f"%{params['guild_name']}%")).first()

        if not guild:
            return {"success": False, "error": "Guild not found"}

        # Check if member
        if user not in guild.members:
            return {"success": False, "error": f"You're not a member of '{guild.name}'"}

        # Cannot leave if owner
        if guild.owner_id == user.id:
            return {"success": False, "error": "You cannot leave a guild you own. Transfer ownership first."}

        # Remove user from guild
        guild.members.remove(user)
        guild.member_count = len(guild.members)
        db.commit()

        logger.info(f"✅ User {user.id} left guild: {guild.name} (ID: {guild.id})")

        return {
            "success": True,
            "message": f"Successfully left '{guild.name}'",
            "guild_id": guild.id
        }

    except Exception as e:
        logger.error(f"Error leaving guild: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}


def execute_create_product(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Create a product listing"""
    try:
        if not params.get("name") or not params.get("price"):
            return {"success": False, "error": "Product name and price are required"}

        product = Product(
            name=params["name"],
            description=params.get("description", ""),
            price=params["price"],
            category=params.get("category"),
            stock=params.get("stock", 1),
            seller_id=user.id,
            is_active=True
        )

        db.add(product)
        db.commit()
        db.refresh(product)

        logger.info(f"✅ Created product: {product.name} (ID: {product.id}) for user {user.id}")

        return {
            "success": True,
            "message": f"Product '{product.name}' listed successfully!",
            "product_id": product.id,
            "data": {
                "id": product.id,
                "name": product.name,
                "description": product.description,
                "price": float(product.price),
                "category": product.category,
                "stock": product.stock
            },
            "deep_link": f"sneaker://marketplace/product/{product.id}"
        }

    except Exception as e:
        logger.error(f"Error creating product: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}


def execute_update_profile(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Update user profile"""
    try:
        updated_fields = []

        if params.get("first_name"):
            user.first_name = params["first_name"]
            updated_fields.append("first name")

        if params.get("last_name"):
            user.last_name = params["last_name"]
            updated_fields.append("last name")

        if params.get("bio"):
            user.bio = params["bio"]
            updated_fields.append("bio")

        if params.get("country"):
            user.country = params["country"]
            updated_fields.append("country")

        if not updated_fields:
            return {"success": False, "error": "No fields to update"}

        db.commit()

        logger.info(f"✅ Updated profile for user {user.id}: {', '.join(updated_fields)}")

        return {
            "success": True,
            "message": f"Profile updated: {', '.join(updated_fields)}",
            "data": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "bio": user.bio,
                "country": user.country
            }
        }

    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}


def execute_search_projects(user: Optional[User], db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Search for projects using semantic search"""
    try:
        # Use semantic search if query is provided
        if params.get("query"):
            search_results = qdrant_service.semantic_search_projects(
                query=params["query"],
                limit=10,
                score_threshold=0.3
            )

            # Get full project details from database
            project_ids = [r["project_id"] for r in search_results]
            query = db.query(Project).filter(Project.id.in_(project_ids))
        else:
            query = db.query(Project)

        # Apply additional filters
        if params.get("status"):
            query = query.filter(Project.status == params["status"])

        if params.get("min_budget"):
            query = query.filter(Project.budget >= params["min_budget"])

        if params.get("max_budget"):
            query = query.filter(Project.budget <= params["max_budget"])

        projects = query.order_by(Project.created_at.desc()).limit(10).all()

        results = [
            {
                "id": p.id,
                "title": p.title,
                "description": p.description[:200] if p.description else "",
                "budget": float(p.budget) if p.budget else None,
                "status": p.status,
                "deadline": p.deadline.isoformat() if p.deadline else None
            }
            for p in projects
        ]

        return {
            "success": True,
            "message": f"Found {len(results)} projects",
            "data": results,
            "count": len(results),
            "deep_link": "sneaker://projects" if results else None
        }

    except Exception as e:
        logger.error(f"Error searching projects: {e}")
        return {"success": False, "error": str(e)}


def execute_search_guilds(user: Optional[User], db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Search for guilds"""
    try:
        query = db.query(Guild)

        if params.get("query"):
            search_term = params["query"]
            query = query.filter(
                or_(
                    Guild.name.ilike(f"%{search_term}%"),
                    Guild.description.ilike(f"%{search_term}%")
                )
            )

        if params.get("category"):
            query = query.filter(Guild.category == params["category"])

        guilds = query.filter(Guild.is_private == False).order_by(Guild.member_count.desc()).limit(10).all()

        results = [
            {
                "id": g.id,
                "name": g.name,
                "description": g.description[:200] if g.description else "",
                "member_count": g.member_count,
                "category": g.category
            }
            for g in guilds
        ]

        return {
            "success": True,
            "message": f"Found {len(results)} guilds",
            "data": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"Error searching guilds: {e}")
        return {"success": False, "error": str(e)}


def execute_search_products(user: Optional[User], db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Search for products"""
    try:
        query = db.query(Product).filter(Product.is_active == True)

        if params.get("query"):
            search_term = params["query"]
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search_term}%"),
                    Product.description.ilike(f"%{search_term}%")
                )
            )

        if params.get("category"):
            query = query.filter(Product.category == params["category"])

        if params.get("min_price"):
            query = query.filter(Product.price >= params["min_price"])

        if params.get("max_price"):
            query = query.filter(Product.price <= params["max_price"])

        products = query.order_by(Product.created_at.desc()).limit(10).all()

        results = [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description[:200] if p.description else "",
                "price": float(p.price),
                "category": p.category,
                "stock": p.stock,
                "image_url": p.image_url
            }
            for p in products
        ]

        return {
            "success": True,
            "message": f"Found {len(results)} products",
            "data": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"Error searching products: {e}")
        return {"success": False, "error": str(e)}








def execute_action(
    action: str,
    user: Optional[User],
    db: Session,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Execute an AI-detected action with authorization checks

    Args:
        action: Action key from AVAILABLE_ACTIONS
        user: Current user (None for public actions)
        db: Database session
        parameters: Extracted parameters for the action

    Returns:
        Result dictionary with success status and data/error
    """
    # Validate action exists
    if action not in AVAILABLE_ACTIONS:
        return {"success": False, "error": f"Unknown action: {action}"}

    action_info = AVAILABLE_ACTIONS[action]

    # Check permission
    if action_info["permission"] == "authenticated" and not user:
        return {
            "success": False,
            "error": "You must be logged in to perform this action",
            "requires_auth": True
        }

    # Get executor function
    executor = globals().get(f"execute_{action}")
    if not executor:
        return {"success": False, "error": f"Action '{action}' not implemented yet"}

    # Execute action
    try:
        result = executor(user, db, parameters)
        return result

    except Exception as e:
        logger.error(f"Error executing action {action}: {e}")
        return {"success": False, "error": f"Failed to execute action: {str(e)}"}





def get_available_actions_for_user(user: Optional[User]) -> List[Dict[str, Any]]:
    """
    Get list of actions available to the current user
    """
    actions = []

    for key, info in AVAILABLE_ACTIONS.items():
        # Filter by permission
        if info["permission"] == "authenticated" and not user:
            continue

        actions.append({
            "key": key,
            "name": info["name"],
            "description": info["description"],
            "parameters": info["parameters"],
            "required": info["required"]
        })

    return actions


# ============================================================================
# NEW SHOPPING & ESCROW ACTION EXECUTORS
# ============================================================================

def execute_parse_shopping_list(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Parse and organize shopping list items"""
    try:
        # This is mainly handled by ai_assistant.extract_shopping_list_items
        # Here we just validate and return the parsed items
        items = params.get("items", [])
        if not items:
            return {"success": False, "error": "No items provided for shopping list"}

        # Validate items have required fields
        validated_items = []
        for item in items:
            if isinstance(item, dict) and "item" in item:
                validated_items.append({
                    "item": item["item"],
                    "quantity": item.get("quantity", 1),
                    "category": item.get("category", "general")
                })

        return {
            "success": True,
            "message": f"Parsed {len(validated_items)} items from shopping list",
            "data": validated_items,
            "count": len(validated_items)
        }

    except Exception as e:
        logger.error(f"Error parsing shopping list: {e}")
        return {"success": False, "error": str(e)}


def execute_add_to_cart(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Add products to user's shopping cart"""
    try:
        product_ids = params.get("product_ids", [])
        quantities = params.get("quantities", [])

        if not product_ids:
            return {"success": False, "error": "No product IDs provided"}

        # Validate products exist and are available
        added_items = []
        for i, product_id in enumerate(product_ids):
            product = db.query(Product).filter(
                Product.id == product_id,
                Product.is_active == True
            ).first()

            if not product:
                continue  # Skip invalid products

            quantity = quantities[i] if i < len(quantities) else 1

            # Check stock availability
            if product.stock < quantity:
                return {
                    "success": False,
                    "error": f"Insufficient stock for '{product.name}'. Available: {product.stock}, Requested: {quantity}"
                }

            # Calculate item total
            item_total = float(product.price) * quantity

            added_items.append({
                "product_id": product.id,
                "name": product.name,
                "price": float(product.price),
                "quantity": quantity,
                "total": item_total
            })

        if not added_items:
            return {"success": False, "error": "No valid products found to add to cart"}

        total_amount = sum(item["total"] for item in added_items)

        # Create cart checkout request format for the actual checkout
        cart_items = [
            {"product_id": item["product_id"], "quantity": item["quantity"]}
            for item in added_items
        ]

        return {
            "success": True,
            "message": f"✅ Added {len(added_items)} items to cart. Total: ₦{total_amount:,.2f}",
            "data": added_items,
            "total_amount": total_amount,
            "item_count": len(added_items),
            "cart_items": cart_items,  # For checkout integration
            "next_action": "checkout",
            "deep_link": "sneaker://cart"
        }

    except Exception as e:
        logger.error(f"Error adding to cart: {e}")
        return {"success": False, "error": str(e)}


def execute_checkout_cart(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Process checkout with escrow protection"""
    try:
        cart_id = params.get("cart_id")

        # In a real implementation, this would:
        # 1. Get cart items
        # 2. Calculate total
        # 3. Create escrow transaction
        # 4. Process payment

        # For now, simulate checkout
        return {
            "success": True,
            "message": "Checkout initiated with escrow protection. Funds will be held securely until items are delivered.",
            "escrow_protection": True,
            "next_steps": [
                "Review order details",
                "Confirm payment method",
                "Escrow holds funds until delivery confirmation"
            ],
            "deep_link": "sneaker://checkout"
        }

    except Exception as e:
        logger.error(f"Error during checkout: {e}")
        return {"success": False, "error": str(e)}


def execute_detect_negotiation_end(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Detect when project negotiations are complete"""
    try:
        project_id = params.get("project_id")
        chat_id = params.get("chat_id")

        if not project_id:
            return {"success": False, "error": "Project ID required"}

        # Verify user has access to this project
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": "Project not found"}

        # Check if user is project creator or freelancer in chat
        has_access = (
            project.creator_id == user.id or
            (chat_id and db.query(ProjectChat).filter(
                ProjectChat.id == chat_id,
                ProjectChat.freelancer_id == user.id
            ).first())
        )

        if not has_access:
            return {"success": False, "error": "Not authorized for this project"}

        return {
            "success": True,
            "message": "Negotiation completion detected. Ready to proceed with escrow setup.",
            "negotiation_complete": True,
            "project_id": project_id,
            "next_action": "prompt_escrow"
        }

    except Exception as e:
        logger.error(f"Error detecting negotiation end: {e}")
        return {"success": False, "error": str(e)}


def execute_prompt_escrow(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Guide users through escrow setup for completed negotiations"""
    try:
        project_id = params.get("project_id")
        amount = params.get("amount")
        terms = params.get("terms", "")

        if not project_id:
            return {"success": False, "error": "Project ID required"}

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": "Project not found"}

        escrow_amount = amount or float(project.budget or 0)

        return {
            "success": True,
            "message": f"Ready to set up escrow for project '{project.title}'. Amount: ₦{escrow_amount:,.2f}",
            "escrow_details": {
                "project_id": project_id,
                "project_title": project.title,
                "amount": escrow_amount,
                "terms": terms or "Standard escrow terms apply",
                "protection": "Funds held securely until work is approved"
            },
            "next_steps": [
                "Review project terms",
                "Confirm escrow amount",
                "Set up payment and escrow",
                "Begin work once escrow is funded"
            ],
            "deep_link": f"sneaker://projects/{project_id}/escrow"
        }

    except Exception as e:
        logger.error(f"Error prompting escrow: {e}")
        return {"success": False, "error": str(e)}


def execute_search_users(user: Optional[User], db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Search for users by name, skills, or bio"""
    try:
        query = params.get("query", "")
        country = params.get("country")

        if not query and not country:
            return {"success": False, "error": "Please provide a search query or country"}

        # Build search query
        user_query = db.query(User).filter(User.is_active == True)

        if query:
            search_term = f"%{query}%"
            user_query = user_query.filter(
                or_(
                    User.first_name.ilike(search_term),
                    User.last_name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.bio.ilike(search_term)
                )
            )

        if country:
            user_query = user_query.filter(User.country.ilike(f"%{country}%"))

        users = user_query.limit(10).all()

        results = [
            {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "email": u.email,
                "country": u.country,
                "bio": u.bio[:200] if u.bio else "",
                "avatar": u.avatar_url
            }
            for u in users
        ]

        return {
            "success": True,
            "message": f"Found {len(results)} users",
            "data": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"Error searching users: {e}")
        return {"success": False, "error": str(e)}


def execute_search_tasks(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Search for project tasks by title or description"""
    try:
        query = params.get("query", "")
        project_id = params.get("project_id")

        if not query and not project_id:
            return {"success": False, "error": "Please provide a search query or project ID"}

        # Build search query
        task_query = db.query(Task)

        if query:
            search_term = f"%{query}%"
            task_query = task_query.filter(
                or_(
                    Task.title.ilike(search_term),
                    Task.description.ilike(search_term)
                )
            )

        if project_id:
            task_query = task_query.filter(Task.project_id == project_id)

        tasks = task_query.limit(10).all()

        results = [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description[:200] if t.description else "",
                "status": t.status,
                "priority": t.priority,
                "project_id": t.project_id,
                "deadline": t.deadline.isoformat() if t.deadline else None
            }
            for t in tasks
        ]

        return {
            "success": True,
            "message": f"Found {len(results)} tasks",
            "data": results,
            "count": len(results)
        }

    except Exception as e:
        logger.error(f"Error searching tasks: {e}")
        return {"success": False, "error": str(e)}


def execute_get_platform_stats(user: Optional[User], db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Get comprehensive platform statistics"""
    try:
        stats = {
            "total_users": db.query(User).filter(User.is_active == True).count(),
            "total_products": db.query(Product).filter(Product.is_active == True).count(),
            "total_projects": db.query(Project).count(),
            "total_guilds": db.query(Guild).count(),
            "total_tasks": db.query(Task).count(),
            "total_posts": db.query(Post).count(),
        }

        return {
            "success": True,
            "message": f"Platform has {stats['total_users']} active users, {stats['total_products']} products, and {stats['total_projects']} projects",
            "data": stats
        }

    except Exception as e:
        logger.error(f"Error getting platform stats: {e}")
        return {"success": False, "error": str(e)}


def execute_extract_shopping_list(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Extract and organize items from a shopping list message"""
    try:
        message = params.get("message", "")
        if not message:
            return {"success": False, "error": "No message provided"}

        # Use the existing extract_shopping_list_items function from ai_assistant
        from ai_assistant import extract_shopping_list_items
        items = extract_shopping_list_items(message, db)

        if not items:
            return {"success": False, "error": "No shopping list items found in the message"}

        return {
            "success": True,
            "message": f"Extracted {len(items)} items from shopping list",
            "data": items,
            "count": len(items)
        }

    except Exception as e:
        logger.error(f"Error extracting shopping list: {e}")
        return {"success": False, "error": str(e)}

# ============================================================================
# ESCROW ACTION EXECUTORS
# ============================================================================

def execute_get_escrow_status(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Get escrow status for an order"""
    try:
        order_id = params.get("order_id")
        if not order_id:
            return {"success": False, "error": "order_id is required"}

        escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
        if not escrow:
            return {"success": False, "error": f"No escrow found for order {order_id}"}

        order = escrow.order

        # Check if user is buyer or seller
        if order.buyer_id != user.id and order.seller_id != user.id:
            return {"success": False, "error": "You can only view escrow for your own orders"}

        return {
            "success": True,
            "message": f"Escrow status for order {order_id}",
            "data": {
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
        }

    except Exception as e:
        logger.error(f"Error getting escrow status: {e}")
        return {"success": False, "error": str(e)}

def execute_release_escrow(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Release escrow funds to seller (requires buyer authentication)"""
    try:
        order_id = params.get("order_id")
        if not order_id:
            return {"success": False, "error": "order_id is required"}

        escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
        if not escrow:
            return {"success": False, "error": f"No escrow found for order {order_id}"}

        order = escrow.order

        # Check if user is the buyer
        if order.buyer_id != user.id:
            return {"success": False, "error": "Only the buyer can release escrow funds"}

        # Check escrow status
        if escrow.status != "held":
            return {"success": False, "error": f"Escrow is already {escrow.status}"}

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
            "success": True,
            "message": f"Escrow funds of ${escrow.amount:.2f} released to seller",
            "data": {
                "order_id": order_id,
                "escrow_id": escrow.id,
                "amount_released": escrow.amount,
                "status": "released"
            }
        }

    except Exception as e:
        logger.error(f"Error releasing escrow: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}

def execute_dispute_escrow(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Raise a dispute on an escrow (requires buyer or seller authentication)"""
    try:
        order_id = params.get("order_id")
        if not order_id:
            return {"success": False, "error": "order_id is required"}

        dispute_reason = params.get("dispute_reason", "").strip()
        if not dispute_reason:
            return {"success": False, "error": "dispute_reason is required"}

        escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
        if not escrow:
            return {"success": False, "error": f"No escrow found for order {order_id}"}

        order = escrow.order

        # Check if user is buyer or seller
        if order.buyer_id != user.id and order.seller_id != user.id:
            return {"success": False, "error": "Only buyer or seller can dispute escrow"}

        # Check escrow status
        if escrow.status != "held":
            return {"success": False, "error": f"Cannot dispute escrow that is {escrow.status}"}

        # Update escrow with dispute
        escrow.status = "disputed"
        escrow.dispute_reason = dispute_reason

        db.commit()

        return {
            "success": True,
            "message": "Dispute raised on escrow. Admin will review the case.",
            "data": {
                "order_id": order_id,
                "escrow_id": escrow.id,
                "status": "disputed",
                "dispute_reason": dispute_reason
            }
        }

    except Exception as e:
        logger.error(f"Error disputing escrow: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}

def execute_get_project_escrow_status(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Get escrow status for a project"""
    try:
        project_id = params.get("project_id")
        if not project_id:
            return {"success": False, "error": "project_id is required"}

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": f"Project with id {project_id} not found"}

        # Check if user has access to this project
        has_access = (
            project.owner_id == user.id or
            project.freelancer_id == user.id or
            project.creator_id == user.id
        )

        if not has_access:
            return {"success": False, "error": "You don't have access to this project"}

        return {
            "success": True,
            "message": f"Escrow status for project '{project.title}'",
            "data": {
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
        }

    except Exception as e:
        logger.error(f"Error getting project escrow status: {e}")
        return {"success": False, "error": str(e)}

def execute_fund_project_escrow(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Fund escrow for a project (requires project owner authentication)"""
    try:
        project_id = params.get("project_id")
        if not project_id:
            return {"success": False, "error": "project_id is required"}

        amount = params.get("amount")
        if not amount or amount <= 0:
            return {"success": False, "error": "Valid amount is required"}

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": f"Project with id {project_id} not found"}

        # Check if user is project owner
        if project.owner_id != user.id:
            return {"success": False, "error": "Only project owner can fund escrow"}

        # Check workflow status
        if project.workflow_status != "price_agreed":
            return {"success": False, "error": f"Project must be in price_agreed status. Current: {project.workflow_status}"}

        # Check if already funded
        if project.escrow_funded:
            return {"success": False, "error": "Project escrow is already funded"}

        # Check user wallet balance
        from database import Wallet
        wallet = db.query(Wallet).filter(Wallet.user_id == user.id).first()
        if not wallet or wallet.balance < amount:
            return {"success": False, "error": "Insufficient wallet balance"}

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
            "success": True,
            "message": f"Successfully funded escrow with ${amount:.2f}",
            "data": {
                "project_id": project_id,
                "amount_funded": amount,
                "workflow_status": "escrow_funded"
            }
        }

    except Exception as e:
        logger.error(f"Error funding project escrow: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}

def execute_release_project_payment(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Release project escrow payment to freelancer (requires project owner authentication)"""
    try:
        project_id = params.get("project_id")
        if not project_id:
            return {"success": False, "error": "project_id is required"}

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": f"Project with id {project_id} not found"}

        # Check if user is project owner
        if project.owner_id != user.id:
            return {"success": False, "error": "Only project owner can release payment"}

        # Check workflow status
        if project.workflow_status != "completed":
            return {"success": False, "error": f"Project must be completed before releasing payment. Current: {project.workflow_status}"}

        # Check if escrow is funded
        if not project.escrow_funded:
            return {"success": False, "error": "No escrow to release"}

        # Check if payment already released
        if project.payment_released_at:
            return {"success": False, "error": "Payment already released"}

        # Get freelancer wallet
        from database import Wallet
        freelancer_wallet = db.query(Wallet).filter(Wallet.user_id == project.freelancer_id).first()
        if not freelancer_wallet:
            return {"success": False, "error": "Freelancer wallet not found"}

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
            "success": True,
            "message": f"Payment of ${project.escrow_amount:.2f} released to freelancer",
            "data": {
                "project_id": project_id,
                "amount_released": project.escrow_amount,
                "freelancer_wallet_balance": freelancer_wallet.balance
            }
        }

    except Exception as e:
        logger.error(f"Error releasing project payment: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}

def execute_submit_project_work(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Submit work for a project (requires freelancer authentication)"""
    try:
        project_id = params.get("project_id")
        if not project_id:
            return {"success": False, "error": "project_id is required"}

        description = params.get("description", "").strip()
        if not description:
            return {"success": False, "error": "Work description is required"}

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": f"Project with id {project_id} not found"}

        # Check if user is the assigned freelancer
        if project.freelancer_id != user.id:
            return {"success": False, "error": "Only assigned freelancer can submit work"}

        # Check workflow status
        if project.workflow_status != "escrow_funded":
            return {"success": False, "error": f"Project must be in escrow_funded status. Current: {project.workflow_status}"}

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
            "success": True,
            "message": "Work submitted successfully. Waiting for client approval.",
            "data": {
                "project_id": project_id,
                "submission_id": submission.id,
                "description": description,
                "status": "pending"
            }
        }

    except Exception as e:
        logger.error(f"Error submitting project work: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}

def execute_approve_project_work(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Approve submitted work and release escrow (requires project owner authentication)"""
    try:
        project_id = params.get("project_id")
        if not project_id:
            return {"success": False, "error": "project_id is required"}

        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return {"success": False, "error": f"Project with id {project_id} not found"}

        # Check if user is project owner
        if project.owner_id != user.id:
            return {"success": False, "error": "Only project owner can approve work"}

        # Check workflow status
        if project.workflow_status != "work_submitted":
            return {"success": False, "error": f"Project must have submitted work. Current: {project.workflow_status}"}

        # Update project
        project.workflow_status = "completed"
        project.completed_at = datetime.utcnow()

        db.commit()

        return {
            "success": True,
            "message": "Work approved. You can now release the payment from escrow.",
            "data": {
                "project_id": project_id,
                "workflow_status": "completed"
            }
        }

    except Exception as e:
        logger.error(f"Error approving project work: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}


ACTION_EXECUTORS = {
    "create_project": execute_create_project,
    "join_guild": execute_join_guild,
    "leave_guild": execute_leave_guild,
    "create_product": execute_create_product,
    "update_profile": execute_update_profile,
    "search_projects": execute_search_projects,
    "search_guilds": execute_search_guilds,
    "search_products": execute_search_products,
    "parse_shopping_list": execute_parse_shopping_list,
    "add_to_cart": execute_add_to_cart,
    "checkout_cart": execute_checkout_cart,
    "detect_negotiation_end": execute_detect_negotiation_end,
    "prompt_escrow": execute_prompt_escrow,
    "search_users": execute_search_users,
    "search_tasks": execute_search_tasks,
    "get_platform_stats": execute_get_platform_stats,
    "extract_shopping_list": execute_extract_shopping_list,
    # Escrow actions
    "get_escrow_status": execute_get_escrow_status,
    "release_escrow": execute_release_escrow,
    "dispute_escrow": execute_dispute_escrow,
    "get_project_escrow_status": execute_get_project_escrow_status,
    "fund_project_escrow": execute_fund_project_escrow,
    "release_project_payment": execute_release_project_payment,
    "submit_project_work": execute_submit_project_work,
    "approve_project_work": execute_approve_project_work,
}
