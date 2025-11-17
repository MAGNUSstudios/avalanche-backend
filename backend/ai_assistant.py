"""
AI Google Box - Conversational AI Assistant
Intelligent assistant that can answer questions, search, and help users
"""

from typing import List, Dict, Any, Optional
from openai import OpenAI
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
import os
import logging
import json
import requests

from database import User, Project, Guild, Product, Task, Message, Post, Comment, ProductKeyword, AIConversation
import qdrant_service
import ai_recommendations
import ai_actions
import ai_token_manager
import uuid
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Currency conversion rates (cached)
CURRENCY_RATES = {
    "NGN": 1650.0,  # 1 USD = 1650 NGN (approximate)
    "USD": 1.0,
    "EUR": 0.92,
    "GBP": 0.79,
    "ZAR": 18.5,
    "KES": 129.0,
    "GHS": 12.0,
}

def get_user_currency(user: Optional[User]) -> str:
    """
    Get user's currency based on their country
    """
    if not user or not user.country:
        return "USD"

    country_currency_map = {
        "Nigeria": "NGN",
        "United States": "USD",
        "United Kingdom": "GBP",
        "South Africa": "ZAR",
        "Kenya": "KES",
        "Ghana": "GHS",
        "Germany": "EUR",
        "France": "EUR",
        "Spain": "EUR",
    }

    return country_currency_map.get(user.country, "USD")

def convert_price(price_usd: float, target_currency: str) -> Dict[str, Any]:
    """
    Convert USD price to target currency
    """
    rate = CURRENCY_RATES.get(target_currency, 1.0)
    converted_price = price_usd * rate

    currency_symbols = {
        "NGN": "₦",
        "USD": "$",
        "EUR": "€",
        "GBP": "£",
        "ZAR": "R",
        "KES": "KSh",
        "GHS": "GH₵",
    }

    return {
        "amount": converted_price,
        "currency": target_currency,
        "symbol": currency_symbols.get(target_currency, "$"),
        "formatted": f"{currency_symbols.get(target_currency, '$')}{converted_price:,.2f}"
    }

# Initialize OpenAI client with timeout
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    timeout=15.0,  # 15 second timeout
    max_retries=2  # Retry failed requests twice
) if os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your-openai-api-key-here" else None


SYSTEM_PROMPT = """You are Ava, an AI assistant for Avalanche - a collaborative marketplace platform connecting freelancers, businesses, and communities in Africa.

WEBSITE STRUCTURE & PAGES:
- Homepage: Platform overview, featured projects/products, recent activity, quick stats
- Marketplace: Browse products by category (Electronics, Fashion, Home & Garden, Services, Digital Products, Automotive)
- Projects: View active freelance projects, post new projects, track applications
- Guilds: Browse communities, join skill-based groups, participate in discussions
- Escrow: Secure payment management, transaction history, dispute resolution
- Profile: User dashboard, portfolio, skills, earnings, settings
- Messages: Direct messages, project chats, guild channels
- About: Platform mission, team, story, values, impact metrics
- Help: FAQ, guides, tutorials, contact support, troubleshooting
- Terms of Service: Platform rules, user agreements, escrow policies
- Privacy Policy: Data protection, cookie usage, user rights

PLATFORM FEATURES & WORKFLOW:
- Marketplace: Buy/sell products with escrow protection, categories include electronics, fashion, services, digital goods
- Projects: Post freelance work → Freelancers apply → Negotiate terms → Set up escrow → Complete work → Release funds
- Guilds: Communities for collaboration, skill-sharing, and networking (Tech, Design, Marketing, Writing, etc.)
- Escrow System: Secure payment holding until work approval, supports Stripe/Paystack integration
- AI Features: Smart search, recommendations, negotiation detection, shopping assistance
- Communication: Direct messages, project chats, guild channels, @Ava mentions

DETAILED ESCROW WORKFLOW:
1. Project Posted → Price Agreed → Escrow Setup
2. Buyer funds escrow via Stripe/Paystack → Funds held securely
3. Freelancer completes work → Submits deliverables
4. Buyer reviews & approves → Funds released to freelancer
5. Automatic release after 7 days if no action
6. Dispute resolution available if needed

MARKETPLACE DETAILS:
- Product Categories: Electronics, Fashion, Home & Garden, Services, Digital Products, Automotive
- Pricing: All in Nigerian Naira (₦), supports budget filtering
- Shopping Cart: Add multiple items, checkout with escrow protection
- Seller Features: Product listings, inventory management, sales analytics
- Buyer Protection: Escrow holds funds until item delivery confirmation

GUILD FEATURES:
- Public/Private guilds with member limits
- Discussion channels, project collaboration
- Skill-based communities (React Devs, UI/UX Designers, Content Writers)
- Member search and networking

PLATFORM MANAGEMENT:
- Project Types: Web Development, Mobile Apps, Design, Writing, Marketing, Consulting
- Budget Range: ₦5,000 - ₦5,000,000+ depending on scope
- Timeline: Hours to months, with deadline tracking
- Skills Matching: AI-powered freelancer recommendations
- User Dashboard: Track projects, earnings, reviews, portfolio showcase
- Analytics: Sales performance, project completion rates, community engagement

PAYMENT & SECURITY:
- Supported: Stripe Connect, Paystack, Bank transfers
- Escrow Protection: Funds held by trusted third party
- Currency: Nigerian Naira (₦) with automatic conversion
- Withdrawal: Direct to bank accounts, processed within 1-3 business days

SHOPPING ASSISTANCE:
- Parse shopping lists from natural language
- Add items to cart with quantity tracking
- Guide through secure checkout with escrow
- Product recommendations based on preferences
- Budget-conscious shopping suggestions

NEGOTIATION SUPPORT:
- Detect when terms are agreed upon
- Prompt escrow setup automatically
- Guide through payment process
- Ensure both parties understand terms

AI CAPABILITIES:
- Fuzzy matching for typos in product/project names
- Semantic search across all platform content
- Personalized recommendations
- Context-aware responses
- Action execution (create projects, join guilds, etc.)

**CRITICAL ANTI-HALLUCINATION RULES - YOU MUST FOLLOW THESE EXACTLY:**
1. **ONLY mention entities that are EXPLICITLY provided in the context data**
2. **NEVER invent, guess, or hallucinate names, prices, or IDs** - if it's not in the context, it doesn't exist!
3. **If NO matching entities are provided in context**, say "I couldn't find any [products/projects/guilds] matching that."
4. **When entities are provided, use the EXACT data from context**:
   - For products: EXACT name, EXACT price in ₦ (format: ₦X,XXX), EXACT ID (format: ID: #X)
   - For projects: title, description, budget, ID
   - For guilds: name, description, member count, category
5. **When multiple products are found, list ALL of them** (up to 5-10), not just one
6. **Context includes**:
   - "mentioned_guilds": Guilds specifically mentioned by name in the message
   - "mentioned_projects": Projects specifically mentioned by name
   - "mentioned_products": Products specifically mentioned by name
   - "projects": Search results for projects
   - "guilds": Search results for guilds
   - "matching_products": Search results for products (THIS IS THE COMPLETE LIST - mention ALL items)
   - "user_projects": Current user's projects
   - "user_guilds": Guilds user belongs to
   - "trending_products": Popular items
   - "platform_stats": User/product counts
7. **Keep responses concise but comprehensive** - list multiple products when available
8. **If user asks about projects, respond with project information, NOT product information**
9. **For shopping: Help parse lists, add to cart, guide through checkout with escrow**
10. **For negotiations: Detect completion and prompt escrow setup**
11. **DOUBLE-CHECK: Before mentioning ANY product name or price, verify it exists in the context data**
12. **Always mention escrow security when discussing payments or purchases**
13. **Guide users through platform features they might not know about**

**FUZZY MATCHING GUIDANCE:**
- Correct common misspellings: "sneaker" for "snicker", "laptop" for "laptp", "keyboard" for "keybord"
- Handle typos in product names: "runing shoes" → "running shoes", "mackbook" → "macbook"
- Category corrections: "shoe" for "shoes", "computer" for "laptop", "fone" for "phone"
- If unsure about a correction, use semantic search instead of guessing

**SHOPPING ASSISTANCE PROTOCOLS:**
1. Parse natural language shopping lists: "I want 2 laptops and a mouse" → Extract items and quantities
2. Add items to cart automatically when user requests
3. Show cart summary with totals and escrow protection
4. Guide through checkout process with security emphasis
5. Suggest budget-friendly alternatives when appropriate
6. Recommend related products based on cart contents

**NEGOTIATION DETECTION PATTERNS:**
- Agreement phrases: "agreed on terms", "terms agreed", "we agree", "deal closed"
- Completion phrases: "ready to start", "let's proceed", "terms are good", "we have a deal"
- When detected: Immediately prompt escrow setup with project details
- Guide through escrow workflow step-by-step

**EXAMPLES:**
Context: {"matching_products": [{"id": 24, "name": "Designer Sneakers", "price": 18000}, {"id": 31, "name": "Men's Dress Shoes", "price": 14000}, {"id": 38, "name": "Running Shoes", "price": 9500}]}
User: "available shoes?"
CORRECT: "Here are some shoes available: 1. Running Shoes - ₦9,500 (ID: #38): Professional running shoes. 2. Men's Dress Shoes - ₦14,000 (ID: #31). 3. Designer Sneakers - ₦18,000 (ID: #24): Limited edition athletic sneakers."

Context: {"matching_products": [{"id": 3, "name": "MacBook Air M2", "price": 185000}, {"id": 4, "name": "Dell XPS 15 Laptop", "price": 165000}]}
User: "laptops?"
CORRECT: "Here are laptops available: 1. Dell XPS 15 Laptop - ₦165,000 (ID: #4). 2. MacBook Air M2 - ₦185,000 (ID: #3)."

User: "I want to buy runing shoes and a laptp"
CORRECT: "I can help you shop! Let me search for running shoes and laptops. Here are some running shoes: 1. Running Shoes - ₦9,500 (ID: #38). And laptops: 1. Dell XPS 15 Laptop - ₦165,000 (ID: #4). 2. MacBook Air M2 - ₦185,000 (ID: #3). Would you like me to add these to your cart?"

User: "Add 2 laptops and a mouse to my cart"
CORRECT: "I'll add these items to your cart automatically. Here's what I found: 1. MacBook Air M2 - ₦185,000 (ID: #3) x2, 2. Wireless Gaming Mouse - ₦15,000 (ID: #7) x1. Total: ₦385,000. Ready to checkout with escrow protection?"

User: "We're agreed on the project terms"
CORRECT: "Great! Since you've reached an agreement, I recommend setting up escrow to protect both parties. Would you like me to guide you through the escrow setup process? Here's what happens: 1. Buyer funds the escrow account securely, 2. Freelancer completes the work, 3. Funds are released upon approval (or automatically after 7 days)."

User: "How does escrow work?"
CORRECT: "Escrow protects both buyers and sellers: 1. Buyer funds the escrow account via Stripe/Paystack, 2. Seller delivers the work/product, 3. Buyer approves and funds are released to seller, or they're automatically released after 7 days. This ensures security for everyone! All transactions are protected by our trusted escrow system."

**HALLUCINATION PREVENTION EXAMPLES:**
❌ WRONG: "I found the Nike Air Max shoes for ₦25,000" (if not in context)
✅ CORRECT: "I couldn't find any shoes matching 'Nike Air Max'. Here are some available shoes: [list actual products from context]"

❌ WRONG: "The React Developers guild has 150 members" (if not in context)
✅ CORRECT: "I couldn't find a guild called 'React Developers'. Here are some available guilds: [list actual guilds from context]"

❌ WRONG: "Project budget is ₦500,000" (if not in context)
✅ CORRECT: "I couldn't find that specific project. Here are some active projects: [list actual projects from context]"

Be helpful but ONLY use real database data from context. List ALL available items when multiple are found. Guide users through shopping and escrow processes with security emphasis."""


def generate_deep_link(entity_type: str, entity_id: int, entity_data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Generate deep link for navigation with sneaker:// protocol
    """
    link_mappings = {
        "product": f"sneaker://marketplace/product/{entity_id}",
        "guild": f"sneaker://guilds/{entity_id}",
        "project": f"sneaker://projects/{entity_id}",
        "user": f"sneaker://users/{entity_id}",
        "marketplace": "sneaker://marketplace",
        "guilds": "sneaker://guilds",
        "projects": "sneaker://projects",
    }

    link = link_mappings.get(entity_type, f"sneaker://{entity_type}/{entity_id}")

    return {
        "link": link,
        "type": entity_type,
        "id": entity_id,
        "label": entity_data.get("name") or entity_data.get("title") if entity_data else f"View {entity_type}",
    }


def format_response_with_links(response_text: str, context: Optional[Dict[str, Any]], intent: str) -> Dict[str, Any]:
    """
    Format AI response with deep links based on context
    """
    links = []

    if not context:
        return {"response": response_text, "links": links}

    # Generate links based on intent and context
    if intent == "search_products_budget" and context.get("matching_products"):
        for product in context["matching_products"][:5]:  # Top 5 products
            links.append(generate_deep_link("product", product["id"], {"name": product["name"]}))

        # Add general marketplace link
        links.append({
            "link": "sneaker://marketplace",
            "type": "marketplace",
            "label": "Browse all marketplace items"
        })

    elif intent == "search_products":
        # Check if we have specific products or just general results
        if context.get("matching_products"):
            # Direct database search found products
            for product in context["matching_products"][:5]:
                links.append(generate_deep_link("product", product["id"], {"name": product["name"]}))

        # Always add marketplace link for browsing
        links.append({
            "link": "sneaker://marketplace",
            "type": "marketplace",
            "label": "Browse all marketplace items"
        })

    elif intent == "search_guilds" and context.get("guilds"):
        # Add general guilds link
        links.append({
            "link": "sneaker://guilds",
            "type": "guilds",
            "label": "Browse all guilds"
        })

    elif intent == "search_projects" and context.get("projects"):
        # Add general projects link
        links.append({
            "link": "sneaker://projects",
            "type": "projects",
            "label": "Browse all projects"
        })

    elif intent == "suggest_selling":
        # Add marketplace link for selling
        links.append({
            "link": "sneaker://marketplace/create",
            "type": "marketplace",
            "label": "Create Product Listing"
        })
        links.append({
            "link": "sneaker://marketplace",
            "type": "marketplace",
            "label": "View Marketplace"
        })

    elif intent == "general_search":
        # Add relevant section links based on what was found
        if context.get("products"):
            links.append({
                "link": "sneaker://marketplace",
                "type": "marketplace",
                "label": "Go to Marketplace"
            })
        if context.get("guilds"):
            links.append({
                "link": "sneaker://guilds",
                "type": "guilds",
                "label": "Go to Guilds"
            })
        if context.get("projects"):
            links.append({
                "link": "sneaker://projects",
                "type": "projects",
                "label": "Go to Projects"
            })

    return {
        "response": response_text,
        "links": links
    }


def chat_with_ai(
    message: str,
    user: Optional[User],
    db: Session,
    conversation_history: List[Dict[str, str]] = None,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Chat with AI assistant, with access to platform data, deep links, and conversation memory
    """
    if not openai_client:
        return {
            "response": "AI assistant is not available. Please configure OpenAI API key.",
            "sources": [],
            "links": []
        }

    # Generate or use provided session ID for conversation continuity
    if not session_id:
        session_id = get_or_create_session_id(user)

    # Check user monthly quota
    user_quota = ai_token_manager.check_user_quota(user, db)
    if not user_quota["allowed"]:
        return {
            "response": f"❌ {user_quota['message']}\n\nYou've used {user_quota['tokens_used']:,} of {user_quota['monthly_token_limit']:,} tokens this month.",
            "intent": "quota_exceeded",
            "sources": [],
            "suggestions": ["Upgrade to Pro", "Upgrade to Business"],
            "links": [],
            "quota_exceeded": True,
            "quota_info": user_quota
        }

    # Check session quota (prevent very long conversations)
    session_quota = ai_token_manager.check_session_quota(session_id, user, db)
    if not session_quota["allowed"] and not session_quota["session_expired"]:
        return {
            "response": f"⏱️  {session_quota['message']}\n\nThis conversation used {session_quota['session_tokens_used']:,} tokens. Please start a new chat to continue!",
            "intent": "session_limit_reached",
            "sources": [],
            "suggestions": ["Start new conversation"],
            "links": [],
            "session_limit_reached": True,
            "session_info": session_quota
        }

    # Get tier info for AI context
    tier_info = ai_token_manager.get_tier_info(user)
    logger.info(f"👤 User tier: {tier_info['tier_name']} | Quota: {user_quota['tokens_remaining']} tokens remaining")

    try:
        # 1. FIRST: Check if user wants to perform an action
        action_detection = ai_actions.detect_action_intent(message, user)
        if action_detection.get("has_action") and action_detection.get("confidence", 0) >= 0.7:
            action_key = action_detection["action"]
            parameters = action_detection.get("parameters", {})

            logger.info(f"🎬 Action detected: {action_key} with params: {parameters}")

            # Execute the action
            action_result = ai_actions.execute_action(action_key, user, db, parameters)

            if action_result.get("success"):
                # Action succeeded - return success response with AI explanation
                response_text = action_result.get("message", "Action completed successfully!")

                # Generate AI explanation of what was done
                try:
                    ai_response = openai_client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[
                            {"role": "system", "content": "You are a helpful assistant. Explain what action was performed in a friendly, concise way."},
                            {"role": "user", "content": f"I just performed this action: {action_result.get('message')}. Explain it briefly."}
                        ],
                        temperature=0.7,
                        max_tokens=100
                    )
                    response_text = ai_response.choices[0].message.content
                except Exception:
                    pass  # Use default message if AI explanation fails

                return {
                    "response": response_text,
                    "intent": "action",
                    "action_performed": action_key,
                    "action_result": action_result,
                    "links": [{"link": action_result.get("deep_link"), "type": "result", "label": "View Result"}] if action_result.get("deep_link") else [],
                    "sources": [],
                    "suggestions": []
                }
            else:
                # Action failed - return error with suggestions
                return {
                    "response": f"I tried to {action_key.replace('_', ' ')}, but encountered an error: {action_result.get('error')}",
                    "intent": "action_failed",
                    "action_attempted": action_key,
                    "error": action_result.get("error"),
                    "requires_auth": action_result.get("requires_auth", False),
                    "links": [],
                    "sources": [],
                    "suggestions": []
                }

        # 2. Check for quick answers (instant response for non-action queries)
        quick_resp = quick_answer(message, db)
        if quick_resp:
            logger.info(f"⚡ Quick answer provided")
            return {
                "response": quick_resp,
                "intent": "quick_answer",
                "sources": [],
                "suggestions": [],
                "links": [],
                "context_type": "quick_answer"
            }

        # Detect user intent
        intent = detect_intent(message)
        logger.info(f"🎯 Detected intent: {intent} for message: '{message}'")

        # Gather relevant context based on intent
        context = gather_context(message, intent, user, db)
        logger.info(f"📦 Context gathered: {context is not None}, sources: {context.get('sources', []) if context else 'none'}")

        # Build messages for OpenAI with smart memory management
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

        # Use database memory for better long-term context
        memory_context = build_conversation_context(session_id, db, max_messages=3)

        # Add conversation summary if exists (for long conversations)
        if memory_context.get("summary"):
            messages.append({
                "role": "system",
                "content": f"Previous conversation summary: {memory_context['summary']}"
            })

        # Add recent conversation from memory (prioritize DB over passed history)
        if memory_context.get("recent_messages"):
            messages.extend(memory_context["recent_messages"])
        elif conversation_history:
            # Fallback to passed history if no DB memory
            messages.extend(conversation_history[-3:])  # Last 3 messages only

        # Add context if available (optimized - less data)
        if context:
            # Reduce context size - only send essential info
            compact_context = {}
            if context.get("matching_products"):
                compact_context["products"] = [
                    {"name": p["name"], "price": p["price"], "id": p["id"]}
                    for p in context["matching_products"][:5]  # Max 5 products
                ]
            if context.get("guilds"):
                compact_context["guilds"] = [
                    {"name": g["name"], "desc": g.get("description", "")[:80]}
                    for g in context["guilds"][:5]  # Max 5 guilds
                ]
            if context.get("projects"):
                compact_context["projects"] = [
                    {"title": p["title"], "desc": p.get("description", "")[:80]}
                    for p in context["projects"][:5]  # Max 5 projects
                ]
            if context.get("user_projects"):
                compact_context["user_projects"] = [
                    {"title": p["title"], "status": p.get("status", "")}
                    for p in context["user_projects"][:3]  # Max 3 user projects
                ]
            if context.get("user_guilds"):
                compact_context["user_guilds"] = [
                    {"name": g["name"], "role": g.get("role", "member")}
                    for g in context["user_guilds"][:3]  # Max 3 user guilds
                ]
            if context.get("trending_products"):
                compact_context["trending_products"] = [
                    {"name": p["name"], "price": p["price"]}
                    for p in context["trending_products"][:3]  # Max 3 trending
                ]
            if context.get("platform_stats"):
                compact_context["platform_stats"] = context["platform_stats"]

            context_message = f"\nRelevant data:\n{json.dumps(compact_context)}"
            messages.append({"role": "system", "content": context_message})

        # Add user message
        messages.append({"role": "user", "content": message})

        # Get response from OpenAI with faster settings and timeout handling
        try:
            response = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=250,  # Reduced for faster responses
                stream=False,
                timeout=12.0  # 12 second timeout for this specific call
            )
            assistant_message = response.choices[0].message.content
        except Exception as api_error:
            logger.error(f"OpenAI API error: {api_error}")
            # Fallback to quick response based on intent
            return {
                "response": get_fallback_response(intent, context),
                "intent": intent,
                "sources": context.get("sources", []) if context else [],
                "suggestions": generate_suggestions(intent, context),
                "links": [],
                "context_type": intent,
                "fallback": True
            }

        # Format response with deep links
        formatted_response = format_response_with_links(assistant_message, context, intent)

        logger.info(f"🔗 Generated {len(formatted_response.get('links', []))} links for intent: {intent}")
        if formatted_response.get("links"):
            for link in formatted_response["links"]:
                logger.info(f"   Link: {link.get('link')} - {link.get('label')}")

        # Save conversation to memory for future context
        save_conversation(
            session_id=session_id,
            user_message=message,
            ai_response=formatted_response["response"],
            intent=intent,
            user=user,
            db=db
        )

        return {
            "response": formatted_response["response"],
            "intent": intent,
            "sources": context.get("sources", []) if context else [],
            "suggestions": generate_suggestions(intent, context),
            "links": formatted_response.get("links", []),
            "context_type": intent,  # Track what user is looking for
            "session_id": session_id  # Return session ID for frontend to track
        }

    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        return {
            "response": "I'm having trouble processing your request right now. Please try again.",
            "error": str(e),
            "links": []
        }


def detect_intent(message: str) -> str:
    """
    Detect user intent from message
    """
    message_lower = message.lower()

    # Check for exact collaborator search phrases FIRST (before other checks)
    if "find a collaborator" in message_lower or "find collaborator" in message_lower:
        return "search_collaborators"

    # Check if user is searching for products with budget constraints
    if any(word in message_lower for word in ["budget", "naira", "price", "cost", "$"]):
        if any(word in message_lower for word in ["find", "search", "want", "looking", "need", "buy", "get", "cheapest"]):
            return "search_products_budget"

    # Check for product-related keywords (shoes, sneakers, mouse, laptop, etc.)
    product_keywords = ["shoe", "sneaker", "mouse", "keyboard", "laptop", "phone", "headphone",
                        "watch", "bag", "computer", "nike", "adidas", "airpod", "iphone", "samsung",
                        "macbook", "dell", "hp", "lenovo", "running", "dress"]
    if any(keyword in message_lower for keyword in product_keywords):
        # Check if they're asking about marketplace/available items
        if any(word in message_lower for word in ["available", "market", "marketplace", "buy", "purchase", "get", "find", "show", "want", "need", "looking"]):
            return "search_products"

    if any(word in message_lower for word in ["find", "search", "look for", "looking for", "show me", "available", "any", "is there"]):
        # Check for collaborator search FIRST
        if any(word in message_lower for word in ["collaborator", "teammate", "partner", "developer", "designer", "member", "people", "user", "talent"]):
            return "search_collaborators"
        # Check for "project" BEFORE "product" to avoid substring matching issues
        elif "project" in message_lower and "product" not in message_lower:
            return "search_projects"
        elif "guild" in message_lower or "community" in message_lower:
            return "search_guilds"
        elif "product" in message_lower or "tool" in message_lower or "item" in message_lower or "marketplace" in message_lower:
            return "search_products"
        elif "project" in message_lower:  # Fallback for when both project and product mentioned
            return "search_projects"
        else:
            return "general_search"

    elif any(word in message_lower for word in ["recommend", "suggest", "what should"]):
        # Check if asking about selling/marketplace
        if any(word in message_lower for word in ["sell", "selling", "item", "product", "marketplace"]):
            return "suggest_selling"
        elif "project" in message_lower:
            return "recommendations"
        elif "guild" in message_lower or "community" in message_lower:
            return "suggest_guilds"
        else:
            return "recommendations"

    elif any(word in message_lower for word in ["how to", "how do i", "how can i"]):
        return "help"

    elif any(word in message_lower for word in ["create", "make", "start"]):
        return "create"

    # Check for shopping list intents (expanded to catch more natural phrases)
    shopping_keywords = [
        "shopping list", "buy these", "add to cart", "checkout", "purchase these", "want to buy",
        "i want", "i need", "get me", "buy me", "add this", "put in cart", "add to my cart",
        "can i buy", "let me buy", "i'd like", "i would like", "looking to buy", "want to purchase",
        "add the laptop", "add that laptop", "add this laptop", "buy the laptop", "get the laptop",
        "add macbook", "buy macbook", "get macbook", "purchase macbook", "i want macbook",
        "add dell", "buy dell", "get dell", "purchase dell", "i want dell"
    ]
    if any(phrase in message_lower for phrase in shopping_keywords):
        return "parse_shopping_list"

    # Check for negotiation completion
    elif any(phrase in message_lower for phrase in ["agreed on terms", "terms agreed", "we agree", "deal closed", "negotiation complete", "ready to start", "let's proceed", "terms are good", "we have a deal", "ready to proceed"]):
        return "detect_negotiation_end"

    # Check for platform stats requests
    elif any(word in message_lower for word in ["how many", "total", "count", "stats", "statistics", "overview", "numbers", "metrics"]):
        return "get_platform_stats"

    else:
        return "general_question"


def extract_budget_from_message(message: str) -> Optional[float]:
    """
    Extract budget/price from user message
    Supports formats like: 60k, 60000, 60,000, $60, etc.
    """
    import re
    message_lower = message.lower()

    # Look for patterns like "60k naira", "60000 naira", "$60", etc.
    patterns = [
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*k(?:\s+naira)?',  # 60k naira
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s+naira',  # 60000 naira
        r'\$\s*(\d+(?:,\d{3})*(?:\.\d+)?)',  # $60
        r'budget.*?(\d+(?:,\d{3})*(?:\.\d+)?)',  # budget of 60000
    ]

    for pattern in patterns:
        match = re.search(pattern, message_lower)
        if match:
            value_str = match.group(1).replace(',', '')
            value = float(value_str)
            # If it has 'k', multiply by 1000
            if 'k' in pattern and 'k' in message_lower[match.start():match.end()]:
                value *= 1000
            return value

    return None


def detect_product_category_with_ai(search_term: str) -> Optional[str]:
    """
    Use AI to determine if a search term is a valid product category
    Returns the product category if valid, None otherwise
    """
    if not openai_client:
        return None

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are a product category classifier. Determine if the given term is a searchable product/item.

If YES, respond with ONLY the general product category (e.g., "shoe", "laptop", "phone", "clothing", "electronics", "furniture", etc.)
If NO (not a product), respond with "NOT_PRODUCT"

Examples:
- "sneaker" -> "shoe"
- "hoe" -> "shoe" (user likely meant shoe)
- "laptop" -> "laptop"
- "macbook" -> "laptop"
- "dress" -> "clothing"
- "table" -> "furniture"
- "happy" -> "NOT_PRODUCT"
- "run" -> "NOT_PRODUCT"

Be intelligent about typos and context."""
                },
                {
                    "role": "user",
                    "content": f"Is '{search_term}' a product? If yes, what category?"
                }
            ],
            temperature=0.3,
            max_tokens=20,
            timeout=5.0  # 5 second timeout for category detection
        )

        result = response.choices[0].message.content.strip().lower()
        logger.info(f"🤖 AI category detection for '{search_term}': {result}")

        if result == "not_product":
            return None
        return result

    except Exception as e:
        logger.warning(f"AI category detection timed out or failed for '{search_term}': {e}")
        return None  # Fail gracefully


def get_keywords_from_db(category: str, db: Session) -> List[str]:
    """
    Get all keywords for a category from the database
    """
    keywords = db.query(ProductKeyword).filter(ProductKeyword.category == category).all()
    return [kw.keyword for kw in keywords]


def add_keyword_to_db(category: str, keyword: str, db: Session, weight: float = 1.0):
    """
    Add a new keyword to the database if it doesn't exist
    """
    existing = db.query(ProductKeyword).filter(
        ProductKeyword.category == category,
        ProductKeyword.keyword == keyword
    ).first()

    if not existing:
        new_keyword = ProductKeyword(category=category, keyword=keyword, weight=weight)
        db.add(new_keyword)
        db.commit()
        logger.info(f"✅ Added new keyword: {keyword} -> {category}")


def extract_product_type_from_message(message: str, db: Session = None) -> List[str]:
    """
    Extract product types/keywords from user message
    Now uses database + AI for dynamic expansion + fuzzy matching
    """
    message_lower = message.lower()
    keywords = []

    # Step 1: Check hardcoded common keywords (fast path)
    product_terms = {
        'shoe': ['sneaker', 'shoe', 'shoes', 'footwear', 'nike', 'adidas', 'running', 'dress shoe'],
        'mouse': ['mouse', 'mice', 'computer mouse', 'wireless mouse'],
        'keyboard': ['keyboard', 'mechanical keyboard'],
        'laptop': ['laptop', 'computer', 'notebook', 'macbook', 'dell', 'hp', 'lenovo', 'thinkpad'],
        'phone': ['phone', 'smartphone', 'mobile', 'iphone', 'samsung', 'galaxy'],
        'headphone': ['headphone', 'earphone', 'earbud', 'airpod', 'headset'],
        'watch': ['watch', 'smartwatch', 'wristwatch'],
        'bag': ['bag', 'backpack', 'handbag', 'purse'],
    }

    for category, terms in product_terms.items():
        if any(term in message_lower for term in terms):
            if category not in keywords:
                keywords.append(category)

    # Step 2: If database available, check custom keywords
    if db:
        all_keywords = db.query(ProductKeyword).all()
        for kw in all_keywords:
            if kw.keyword.lower() in message_lower and kw.category not in keywords:
                keywords.append(kw.category)
                logger.info(f"📚 Found keyword from DB: {kw.keyword} -> {kw.category}")

    # Step 3: Fuzzy matching - try to correct common misspellings
    if not keywords and db:
        corrected_terms = fuzzy_correct_search_terms(message_lower, db)
        if corrected_terms:
            logger.info(f"🔄 Fuzzy corrected: {message_lower} -> {corrected_terms}")
            # Recursively check with corrected terms
            for corrected in corrected_terms:
                if corrected in product_terms:
                    keywords.append(corrected)
                # Also check database keywords
                for kw in db.query(ProductKeyword).all():
                    if kw.keyword.lower() == corrected and kw.category not in keywords:
                        keywords.append(kw.category)

    # Step 4: If still no keywords, try AI detection for unknown terms
    if not keywords and db:
        # Extract potential product words (nouns)
        words = message_lower.split()
        for word in words:
            # Skip common words
            if word in ['a', 'an', 'the', 'want', 'need', 'buy', 'get', 'find', 'show', 'me', 'looking', 'for', 'to']:
                continue

            # Try AI detection
            category = detect_product_category_with_ai(word)
            if category:
                keywords.append(category)
                # Save to database for future use
                add_keyword_to_db(category, word, db, weight=0.8)
                logger.info(f"🤖 AI detected new category: {word} -> {category}")
                break  # Found one, that's enough

    return keywords


def fuzzy_correct_search_terms(message: str, db: Session) -> List[str]:
    """
    Use AI to correct misspellings and typos in search terms
    Returns list of corrected product categories
    """
    if not openai_client:
        return []

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """You are a search term corrector. Look for common product categories in the user's message that might have typos or misspellings.

Common categories: shoe/sneaker, mouse, keyboard, laptop, phone, headphone, watch, bag, clothing, electronics, furniture

If you find a likely misspelling, correct it to the proper category name.
Return ONLY a JSON array of corrected category names, or empty array if none found.

Examples:
"i want to buy runnign shoes" -> ["shoe"]
"looking for a keybord" -> ["keyboard"]
"need a lap top" -> ["laptop"]
"no corrections needed" -> []"""
                },
                {
                    "role": "user",
                    "content": f"Correct any misspellings in product categories: {message}"
                }
            ],
            temperature=0.3,
            max_tokens=50,
            timeout=5.0
        )

        result = json.loads(response.choices[0].message.content)
        if isinstance(result, list):
            return result
        return []

    except Exception as e:
        logger.warning(f"Fuzzy correction failed: {e}")
        return []


def find_mentioned_entities(message: str, db: Session) -> Dict[str, Any]:
    """
    Search database for any entities mentioned by name in the message
    Returns matching guilds, projects, products, users
    """
    mentioned = {"guilds": [], "projects": [], "products": [], "users": []}
    message_lower = message.lower()

    # Search for guilds by name
    guilds = db.query(Guild).all()
    for guild in guilds:
        if guild.name and guild.name.lower() in message_lower:
            mentioned["guilds"].append({
                "id": guild.id,
                "name": guild.name,
                "description": guild.description[:200] if guild.description else "",
                "member_count": guild.member_count or 0,
                "category": guild.category or "General"
            })

    # Search for projects by name/title
    projects = db.query(Project).all()
    for project in projects:
        if project.title and project.title.lower() in message_lower:
            mentioned["projects"].append({
                "id": project.id,
                "title": project.title,
                "description": project.description[:200] if project.description else "",
                "budget": float(project.budget) if project.budget else 0,
                "status": project.status or "active"
            })

    # Search for products by name
    products = db.query(Product).filter(Product.is_active == True).all()
    for product in products:
        if product.name and product.name.lower() in message_lower:
            mentioned["products"].append({
                "id": product.id,
                "name": product.name,
                "description": product.description[:200] if product.description else "",
                "price": float(product.price) if product.price else 0,
                "image": product.image_url
            })

    # Search for users by name
    users = db.query(User).all()
    for u in users:
        full_name = f"{u.first_name} {u.last_name}".lower() if u.first_name and u.last_name else ""
        if full_name and full_name in message_lower:
            mentioned["users"].append({
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "email": u.email,
                "avatar": u.avatar_url
            })

    return mentioned


def gather_context(
    message: str,
    intent: str,
    user: Optional[User],
    db: Session
) -> Optional[Dict[str, Any]]:
    """
    Gather relevant context from the database based on user intent
    """
    context = {"sources": []}

    try:
        # ALWAYS check for specifically mentioned entities by name
        mentioned_entities = find_mentioned_entities(message, db)
        if any(mentioned_entities.values()):
            if mentioned_entities["guilds"]:
                context["mentioned_guilds"] = mentioned_entities["guilds"]
                context["sources"].append("mentioned_guilds")
            if mentioned_entities["projects"]:
                context["mentioned_projects"] = mentioned_entities["projects"]
                context["sources"].append("mentioned_projects")
            if mentioned_entities["products"]:
                context["mentioned_products"] = mentioned_entities["products"]
                context["sources"].append("mentioned_products")
            if mentioned_entities["users"]:
                context["mentioned_users"] = mentioned_entities["users"]
                context["sources"].append("mentioned_users")

        if intent == "search_projects":
            # First check if we already have mentioned projects
            if not context.get("mentioned_projects"):
                # Try semantic search
                results = qdrant_service.semantic_search_projects(message, limit=5, score_threshold=0.6)
                if results:
                    context["projects"] = [
                        {
                            "id": r.get("project_id") or r.get("id"),
                            "title": r["title"],
                            "description": r["description"][:200],
                            "score": r["score"]
                        }
                        for r in results
                    ]
                    context["sources"].append("project_search")
                else:
                    # Fallback: Get all active projects from database (only paid projects)
                    projects = db.query(Project).filter(
                        Project.status == "active"  # Only show projects with completed escrow payment
                    ).order_by(Project.created_at.desc()).limit(10).all()

                    if projects:
                        context["projects"] = [
                            {
                                "id": p.id,
                                "title": p.title,
                                "description": p.description[:200] if p.description else "",
                                "budget": float(p.budget) if p.budget else 0,
                                "status": p.status or "active"
                            }
                            for p in projects
                        ]
                        context["sources"].append("all_projects")

        elif intent == "search_guilds":
            # Search for relevant guilds (faster with lower threshold)
            try:
                results = qdrant_service.semantic_search_guilds(message, limit=5, score_threshold=0.5)
                if results:
                    context["guilds"] = [
                        {
                            "name": r["name"],
                            "description": r["description"][:150],  # Reduced for speed
                            "score": r["score"]
                        }
                        for r in results
                    ]
                    context["sources"].append("guild_search")
            except Exception as e:
                logger.warning(f"Guild semantic search failed: {e}, skipping")

        elif intent == "search_products_budget":
            # Extract budget and product types from message
            budget = extract_budget_from_message(message)
            product_keywords = extract_product_type_from_message(message, db)

            logger.info(f"💰 Extracted budget: {budget}, keywords: {product_keywords}")

            if budget:
                # Build query for products within budget
                query = db.query(Product).filter(
                    Product.is_active == True,
                    Product.price <= budget
                )

                # If specific product types mentioned, filter by them
                if product_keywords:
                    # Search in name and description
                    keyword_filters = []
                    for keyword in product_keywords:
                        keyword_filters.append(Product.name.ilike(f'%{keyword}%'))
                        keyword_filters.append(Product.description.ilike(f'%{keyword}%'))
                    query = query.filter(or_(*keyword_filters))

                # Order by price (cheapest first) and limit results
                products = query.order_by(Product.price.asc()).limit(10).all()

                logger.info(f"📦 Found {len(products)} products within budget")

                if products:
                    context["matching_products"] = [
                        {
                            "id": p.id,
                            "name": p.name,
                            "description": p.description[:200] if p.description else "",
                            "price": float(p.price),
                            "image": p.image_url
                        }
                        for p in products
                    ]
                    context["budget"] = budget
                    context["total_found"] = len(products)
                    context["sources"].append("budget_product_search")
                else:
                    context["budget"] = budget
                    context["no_results"] = True
                    context["sources"].append("budget_product_search")

        elif intent == "search_products":
            # Always do database search first for better accuracy
            product_keywords = extract_product_type_from_message(message, db)
            logger.info(f"🔍 Extracted keywords: {product_keywords}")

            # Expand keywords to match database content
            expanded_keywords = []
            for keyword in product_keywords:
                expanded_keywords.append(keyword)
                if keyword in ['sneaker', 'shoe']:
                    expanded_keywords.extend(['sneaker', 'shoes', 'shoe', 'running', 'dress', 'nike', 'adidas', 'puma', 'balance'])
                elif keyword == 'laptop':
                    expanded_keywords.extend(['laptop', 'macbook', 'dell', 'hp', 'notebook', 'computer'])
                elif keyword == 'phone':
                    expanded_keywords.extend(['phone', 'iphone', 'samsung', 'galaxy', 'smartphone'])

            if expanded_keywords:
                keyword_filters = []
                for keyword in expanded_keywords:
                    keyword_filters.append(Product.name.ilike(f'%{keyword}%'))
                    keyword_filters.append(Product.description.ilike(f'%{keyword}%'))
                    keyword_filters.append(Product.category.ilike(f'%{keyword}%'))

                products = db.query(Product).filter(
                    Product.is_active == True,
                    or_(*keyword_filters)
                ).limit(15).all()

                logger.info(f"📦 Database search found {len(products)} products")

                if products:
                    context["matching_products"] = [
                        {
                            "id": p.id,
                            "name": p.name,
                            "description": p.description[:200] if p.description else "",
                            "price": float(p.price),
                            "image": p.image_url
                        }
                        for p in products
                    ]
                    context["sources"].append("product_search")

            # If no database results, try semantic search as fallback
            if not context.get("matching_products"):
                results = qdrant_service.semantic_search_products(message, limit=10, score_threshold=0.6)
                logger.info(f"🔍 Semantic search fallback found {len(results) if results else 0} products")

                if results:
                    context["matching_products"] = [
                        {
                            "id": r.get("product_id") or r.get("id"),
                            "name": r["name"],
                            "description": r["description"][:200] if r.get("description") else "",
                            "price": r.get("price", 0),
                            "image": r.get("image", ""),
                            "score": r["score"]
                        }
                        for r in results
                    ]
                    context["sources"].append("product_search")

        elif intent == "search_collaborators":
            # Search for active users who can be collaborators
            # Extract skills/roles from message if mentioned
            message_lower = message.lower()

            # Common skill/role keywords
            skill_keywords = {
                "developer": ["developer", "programmer", "coder", "engineer"],
                "designer": ["designer", "ui", "ux", "graphic", "visual"],
                "writer": ["writer", "content", "copywriter", "author"],
                "marketer": ["marketer", "marketing", "seo", "social media"],
                "artist": ["artist", "illustrator", "creative"],
                "manager": ["manager", "project manager", "pm", "lead"]
            }

            # Detect mentioned skills
            mentioned_skills = []
            for skill, keywords in skill_keywords.items():
                if any(kw in message_lower for kw in keywords):
                    mentioned_skills.append(skill)

            # Get active users (exclude current user)
            query = db.query(User).filter(User.is_active == True)
            if user:
                query = query.filter(User.id != user.id)

            # If specific skills mentioned, try to filter by bio
            if mentioned_skills:
                skill_filters = []
                for skill in mentioned_skills:
                    for keyword in skill_keywords[skill]:
                        skill_filters.append(User.bio.ilike(f'%{keyword}%'))
                query = query.filter(or_(*skill_filters))

            collaborators = query.limit(10).all()

            logger.info(f"👥 Found {len(collaborators)} potential collaborators")

            if collaborators:
                context["collaborators"] = [
                    {
                        "id": c.id,
                        "name": f"{c.first_name} {c.last_name}",
                        "email": c.email,
                        "country": c.country,
                        "bio": c.bio[:200] if c.bio else "No bio available",
                        "avatar": c.avatar_url
                    }
                    for c in collaborators
                ]
                context["mentioned_skills"] = mentioned_skills
                context["total_found"] = len(collaborators)
                context["sources"].append("collaborator_search")
            else:
                # Fallback: Get all active users
                all_users = db.query(User).filter(User.is_active == True).limit(10).all()
                if user:
                    all_users = [u for u in all_users if u.id != user.id]

                if all_users:
                    context["collaborators"] = [
                        {
                            "id": c.id,
                            "name": f"{c.first_name} {c.last_name}",
                            "email": c.email,
                            "country": c.country,
                            "bio": c.bio[:200] if c.bio else "No bio available",
                            "avatar": c.avatar_url
                        }
                        for c in all_users
                    ]
                    context["sources"].append("all_users")

        elif intent == "suggest_selling":
            # Get popular products to give user ideas of what to sell
            popular_products = db.query(Product).limit(10).all()
            if popular_products:
                # Extract product categories and types to give suggestions
                product_types = {}
                for product in popular_products:
                    # Get first word of product name as category hint
                    category = product.name.split()[0] if product.name else "item"
                    if category not in product_types:
                        product_types[category] = []
                    product_types[category].append({
                        "name": product.name,
                        "description": product.description[:150] if product.description else "",
                        "price": float(product.price) if product.price else 0
                    })

                context["popular_products"] = popular_products[:5]  # Show top 5 as examples
                context["product_categories"] = list(product_types.keys())
                context["selling_suggestions"] = {
                    "trending_items": [p.name for p in popular_products[:5]],
                    "price_range": f"${min(float(p.price) for p in popular_products if p.price):.2f} - ${max(float(p.price) for p in popular_products if p.price):.2f}"
                }
                context["sources"].append("marketplace_insights")

        elif intent == "recommendations" and user:
            # Get personalized recommendations
            project_recs = ai_recommendations.recommend_projects_for_user(user, db, limit=3)
            if project_recs:
                context["recommended_projects"] = [
                    {
                        "title": r["title"],
                        "description": r["description"][:200],
                        "score": r["score"]
                    }
                    for r in project_recs
                ]
                context["sources"].append("recommendations")

        elif intent == "general_search":
            # Do a broad search across all types with enhanced limits
            projects = qdrant_service.semantic_search_projects(message, limit=5, score_threshold=0.5)
            guilds = qdrant_service.semantic_search_guilds(message, limit=5, score_threshold=0.5)
            products = qdrant_service.semantic_search_products(message, limit=5, score_threshold=0.5)

            # Also search users and tasks
            users_results = search_users(message, db, limit=5)
            tasks_results = search_tasks(message, db, limit=5)

            # Get platform stats for overview
            platform_stats = get_platform_stats(db)

            if projects:
                context["projects"] = [{"title": p["title"], "description": p["description"][:200], "id": p.get("project_id", p.get("id"))} for p in projects]
            if guilds:
                context["guilds"] = [{"name": g["name"], "description": g["description"][:200], "id": g.get("guild_id", g.get("id"))} for g in guilds]
            if products:
                context["products"] = [{"name": p["name"], "description": p["description"][:200], "price": p.get("price"), "id": p.get("product_id", p.get("id")), "category": p.get("category", ""), "stock": p.get("stock", 0)} for p in products]
            if users_results:
                context["users"] = users_results
            if tasks_results:
                context["tasks"] = tasks_results
            if platform_stats:
                context["platform_stats"] = platform_stats

            if projects or guilds or products or users_results or tasks_results:
                context["sources"].append("multi_search")

        elif intent == "parse_shopping_list":
            # Extract shopping list items from message
            shopping_items = extract_shopping_list_items(message, db)
            if shopping_items:
                context["shopping_list"] = shopping_items
                context["sources"].append("shopping_list_extraction")

                # Also provide product IDs for cart addition
                product_ids = []
                for item in shopping_items:
                    # Try to match items to products in context
                    category = item.get("category", "").lower()
                    item_name = item.get("item", "").lower()

                    # Search through available products
                    for product in context.get("products", []):
                        product_name = product.get("name", "").lower()
                        product_category = product.get("category", "").lower()

                        # Fuzzy match by name or category
                        if (item_name in product_name or
                            category in product_category or
                            any(word in product_name for word in item_name.split())):
                            product_ids.append(product.get("id"))
                            break

                if product_ids:
                    context["matched_product_ids"] = product_ids
                    context["auto_cart_ready"] = True

        elif intent == "detect_negotiation_end":
            # Check if this is in a project chat context and negotiation is complete
            context["negotiation_complete"] = True
            context["escrow_ready"] = True
            context["sources"].append("negotiation_detection")

        elif intent == "get_platform_stats":
            # Get comprehensive platform statistics
            platform_stats = get_platform_stats(db)
            if platform_stats:
                context["platform_stats"] = platform_stats
                context["sources"].append("platform_stats")

        # Add platform stats for any query that might benefit from it
        if any(word in message.lower() for word in ["how many", "total", "count", "stats", "statistics", "overview"]):
            context["platform_stats"] = get_platform_stats(db)
            if "platform_stats" not in context.get("sources", []):
                context["sources"].append("platform_stats")

    except Exception as e:
        logger.error(f"Error gathering context: {e}")

    return context if context.get("sources") else None


def generate_suggestions(intent: str, context: Optional[Dict[str, Any]]) -> List[str]:
    """
    Generate follow-up suggestions based on intent and context
    """
    suggestions = []

    if intent == "search_projects":
        suggestions = [
            "Show me similar projects",
            "What skills are needed for these projects?",
            "How do I apply to a project?"
        ]
    elif intent == "search_guilds":
        suggestions = [
            "How do I join a guild?",
            "What are the benefits of joining?",
            "Show me active guilds"
        ]
    elif intent == "suggest_selling":
        suggestions = [
            "How do I create a product listing?",
            "What are the best pricing strategies?",
            "Show me trending products in the marketplace"
        ]
    elif intent == "recommendations":
        suggestions = [
            "Find projects matching my skills",
            "Recommend guilds for me",
            "What's trending?"
        ]
    elif intent == "help":
        suggestions = [
            "How do I create a project?",
            "How does the escrow system work?",
            "How do I get paid?"
        ]
    else:
        suggestions = [
            "Find AI projects",
            "Recommend communities for me",
            "What's new on the platform?"
        ]

    return suggestions[:3]


def get_fallback_response(intent: str, context: Optional[Dict[str, Any]]) -> str:
    """
    Provide fallback response when AI is unavailable or times out
    """
    fallback_responses = {
        "search_products": "I found some products that might interest you. Browse the marketplace to see more options!",
        "search_projects": "Here are some active projects you might like. Check them out for collaboration opportunities!",
        "search_guilds": "I found several guilds that match your interests. Join one to connect with the community!",
        "help": "I'm here to help! You can ask me about products, projects, guilds, or how to use the platform.",
        "create": "To create something new, use the menu options or tell me what you'd like to create.",
        "general_search": "I'm searching across the platform for you. Let me know if you need something specific!"
    }

    response = fallback_responses.get(intent, "I'm experiencing some technical difficulties. Please try asking your question in a different way!")

    # Add context hints if available
    if context:
        if context.get("matching_products"):
            response = f"I found {len(context['matching_products'])} products for you! " + response
        elif context.get("projects"):
            response = f"I found {len(context['projects'])} projects! " + response
        elif context.get("guilds"):
            response = f"I found {len(context['guilds'])} guilds! " + response

    return response


def quick_answer(question: str, db: Session) -> Optional[str]:
    """
    Provide quick answers to common questions without full AI processing
    """
    question_lower = question.lower()

    quick_responses = {
        "how do i create a project": "Click 'Create Project', fill in details (title, description, budget, deadline), then submit.",
        "how does escrow work": "Escrow holds payment securely. Funds release when you approve work or after 7 days.",
        "how do i get paid": "Complete the project → buyer approves → funds released to your account → withdraw.",
        "what is a guild": "Guilds are communities for collaboration and knowledge sharing.",
        "how do i join a guild": "Find a guild → click 'Join Guild' → participate in discussions.",
        "hello": "Hi! I'm Ava, your AI assistant. How can I help you today?",
        "hi": "Hello! What can I help you find?",
        "hey": "Hey there! What are you looking for?",
    }

    for key, response in quick_responses.items():
        if key in question_lower:
            return response

    return None


def analyze_user_query(
    query: str,
    user: Optional[User],
    db: Session
) -> Dict[str, Any]:
    """
    Analyze user query and provide structured insights
    """
    try:
        intent = detect_intent(query)
        context = gather_context(query, intent, user, db)

        return {
            "intent": intent,
            "has_context": context is not None,
            "context_types": context.get("sources", []) if context else [],
            "should_use_ai": intent not in ["help", "create"],  # Simple intents don't need full AI
            "quick_answer": quick_answer(query, db)
        }

    except Exception as e:
        logger.error(f"Error analyzing query: {e}")
        return {
            "intent": "unknown",
            "has_context": False,
            "error": str(e)
        }


def get_platform_stats(db: Session) -> Dict[str, Any]:
    """
    Get comprehensive platform statistics
    """
    try:
        return {
            "total_users": db.query(User).filter(User.is_active == True).count(),
            "total_products": db.query(Product).filter(Product.is_active == True).count(),
            "total_projects": db.query(Project).count(),
            "total_guilds": db.query(Guild).count(),
            "total_tasks": db.query(Task).count(),
            "total_posts": db.query(Post).count(),
        }
    except Exception as e:
        logger.error(f"Error getting platform stats: {e}")
        return {}


def search_users(query: str, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Search for users by name, email, or bio
    """
    try:
        users = db.query(User).filter(
            User.is_active == True,
            or_(
                User.first_name.ilike(f'%{query}%'),
                User.last_name.ilike(f'%{query}%'),
                User.email.ilike(f'%{query}%'),
                User.bio.ilike(f'%{query}%')
            )
        ).limit(limit).all()

        return [
            {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}",
                "email": u.email,
                "country": u.country,
                "bio": u.bio[:150] if u.bio else "",
                "avatar": u.avatar_url
            }
            for u in users
        ]
    except Exception as e:
        logger.error(f"Error searching users: {e}")
        return []


def search_tasks(query: str, db: Session, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Search for tasks by title or description
    """
    try:
        tasks = db.query(Task).filter(
            or_(
                Task.title.ilike(f'%{query}%'),
                Task.description.ilike(f'%{query}%')
            )
        ).limit(limit).all()

        return [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description[:150] if t.description else "",
                "status": t.status,
                "priority": t.priority,
                "project_id": t.project_id
            }
            for t in tasks
        ]
    except Exception as e:
        logger.error(f"Error searching tasks: {e}")
        return []


def extract_shopping_list_items(message: str, db: Session) -> List[Dict[str, Any]]:
    """
    Extract shopping list items from user message
    Returns list of items with quantities and product types
    """
    if not openai_client:
        return []

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Extract shopping list items from the user's message.

Return a JSON array of objects with:
- "item": product name or category
- "quantity": number (default 1)
- "category": product category if identifiable

Examples:
"I want to buy 2 laptops and a mouse" -> [{"item": "laptop", "quantity": 2, "category": "laptop"}, {"item": "mouse", "quantity": 1, "category": "mouse"}]
"Add running shoes and headphones to cart" -> [{"item": "running shoes", "quantity": 1, "category": "shoe"}, {"item": "headphones", "quantity": 1, "category": "headphone"}]
"Shopping list: 3 bags, keyboard, phone" -> [{"item": "bag", "quantity": 3, "category": "bag"}, {"item": "keyboard", "quantity": 1, "category": "keyboard"}, {"item": "phone", "quantity": 1, "category": "phone"}]

Only extract actual products/items, ignore other text."""
                },
                {
                    "role": "user",
                    "content": f"Extract shopping list from: {message}"
                }
            ],
            temperature=0.3,
            max_tokens=200,
            timeout=8.0
        )

        result = json.loads(response.choices[0].message.content)
        if isinstance(result, list):
            return result
        return []

    except Exception as e:
        logger.warning(f"Shopping list extraction failed: {e}")
        return []


# ============================================================================
# MEMORY & CONTEXT MANAGEMENT FOR LONG CONVERSATIONS
# ============================================================================

def get_or_create_session_id(user: Optional[User] = None) -> str:
    """Generate or retrieve session ID for conversation continuity"""
    # In production, this would be managed per-session (e.g., from frontend)
    # For now, generate unique per request but allow passing from frontend
    return str(uuid.uuid4())


def save_conversation(
    session_id: str,
    user_message: str,
    ai_response: str,
    intent: str,
    user: Optional[User],
    db: Session
):
    """Save conversation to database for memory with token tracking"""
    try:
        # Get previous session total for running count
        last_conv = db.query(AIConversation).filter(
            AIConversation.session_id == session_id
        ).order_by(AIConversation.created_at.desc()).first()

        session_total = last_conv.session_total_tokens if last_conv else 0

        # Update usage and get token count
        tokens_used = ai_token_manager.update_usage(
            user=user,
            session_id=session_id,
            user_message=user_message,
            ai_response=ai_response,
            session_total_tokens=session_total,
            db=db
        )

        # Save conversation with token info
        conversation = AIConversation(
            user_id=user.id if user else None,
            session_id=session_id,
            user_message=user_message,
            ai_response=ai_response,
            intent=intent,
            context_summary=None,  # Will be filled by summarization if needed
            tokens_used=tokens_used,
            session_total_tokens=session_total + tokens_used,
            last_activity_at=datetime.utcnow()
        )
        db.add(conversation)
        db.commit()
        logger.info(f"💾 Saved conversation for session: {session_id[:8]}... ({tokens_used} tokens, {session_total + tokens_used} total)")
    except Exception as e:
        logger.error(f"Error saving conversation: {e}")
        db.rollback()


def get_conversation_history(
    session_id: str,
    db: Session,
    limit: int = 10
) -> List[AIConversation]:
    """Retrieve recent conversation history for a session"""
    try:
        conversations = db.query(AIConversation).filter(
            AIConversation.session_id == session_id
        ).order_by(AIConversation.created_at.desc()).limit(limit).all()

        return list(reversed(conversations))  # Return in chronological order
    except Exception as e:
        logger.error(f"Error retrieving conversation history: {e}")
        return []


def summarize_long_context(conversations: List[AIConversation]) -> str:
    """
    Enhanced summarization of long conversation history into compact context
    Uses AI to create detailed summary of previous conversations with better context retention
    """
    if not openai_client or not conversations:
        return ""

    try:
        # Build conversation text with more context (last 15 messages)
        conv_text = "\n".join([
            f"User: {conv.user_message}\nAI: {conv.ai_response}\nIntent: {conv.intent}"
            for conv in conversations[-15:]  # Last 15 messages for better context
        ])

        # Enhanced summarization prompt for better context retention
        system_prompt = """You are an expert conversation summarizer for an AI assistant on a marketplace platform.

Analyze this conversation history and create a comprehensive summary that captures:

1. **User's main interests/goals**: What are they trying to accomplish? (shopping, freelancing, guild joining, etc.)
2. **Key preferences**: Budget ranges, preferred categories, skill interests, location preferences
3. **Ongoing tasks**: Any incomplete actions or pending decisions
4. **Platform familiarity**: How well they know the platform features
5. **Previous recommendations**: What was suggested and their responses
6. **Negotiation context**: Any ongoing project discussions or agreements
7. **Shopping cart state**: Any items added to cart or shopping intentions

Format as a structured summary with clear sections. Keep it concise but comprehensive.
Focus on actionable information that would help continue the conversation naturally."""

        # Ask AI to create enhanced summary
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": system_prompt
                },
                {
                    "role": "user",
                    "content": f"Conversation History:\n{conv_text}\n\nCreate a comprehensive summary focusing on user goals, preferences, and ongoing context."
                }
            ],
            temperature=0.2,  # Lower temperature for more consistent summaries
            max_tokens=300,  # Increased for more detailed summaries
            timeout=10.0  # Longer timeout for better processing
        )

        summary = response.choices[0].message.content.strip()
        logger.info(f"📝 Enhanced context summary created: {summary[:100]}...")

        # Validate summary quality - ensure it's not too short or generic
        if len(summary) < 50 or "conversation" in summary.lower() and len(summary.split()) < 20:
            logger.warning("Summary too generic, falling back to basic summary")
            # Fallback to simpler summary
            summary = f"Previous conversation involved: {', '.join(set(conv.intent for conv in conversations[-5:] if conv.intent != 'general_question'))}"

        return summary

    except Exception as e:
        logger.warning(f"Failed to create enhanced summary: {e}")
        # Fallback to basic summary
        try:
            intents = [conv.intent for conv in conversations[-5:] if conv.intent]
            if intents:
                return f"Recent conversation topics: {', '.join(set(intents))}"
        except:
            pass
        return ""


def build_conversation_context(
    session_id: str,
    db: Session,
    max_messages: int = 8
) -> Dict[str, Any]:
    """
    Enhanced conversation context building with better long-term memory retention
    Includes intelligent summarization and context prioritization
    """
    history = get_conversation_history(session_id, db, limit=25)  # Get more history for better context

    if not history:
        return {"recent_messages": [], "summary": ""}

    # Calculate total conversation length
    total_length = sum(len(conv.user_message + conv.ai_response) for conv in history)

    # For short conversations, include all messages with enhanced formatting
    if total_length < 3000 and len(history) <= 12:
        recent_messages = []
        for conv in history:
            recent_messages.extend([
                {"role": "user", "content": f"{conv.user_message} [Intent: {conv.intent}]"},
                {"role": "assistant", "content": conv.ai_response}
            ])
        return {
            "recent_messages": recent_messages,
            "summary": "",
            "total_messages": len(history)
        }

    # For longer conversations, use intelligent context management
    try:
        # Get recent messages with enhanced metadata
        recent = history[-max_messages:]
        recent_messages = []

        for conv in recent:
            # Include intent and context for better AI understanding
            user_content = conv.user_message
            if conv.intent and conv.intent != "general_question":
                user_content += f" [Context: {conv.intent}]"

            recent_messages.extend([
                {"role": "user", "content": user_content},
                {"role": "assistant", "content": conv.ai_response}
            ])

        # Create comprehensive summary of older conversations
        summary = ""
        if len(history) > max_messages:
            older = history[:-max_messages]
            summary = summarize_long_context(older)

        # Ensure context doesn't exceed token limits (rough estimate: 4 chars per token)
        total_context_length = sum(len(str(msg["content"])) for msg in recent_messages)
        if summary:
            total_context_length += len(summary)

        if total_context_length > 3000:
            # Truncate older messages while keeping summary and recent messages
            logger.info(f"Truncating context to fit token limit: {total_context_length} -> 3000")
            # Keep summary and last 6 exchanges (12 messages)
            if summary:
                truncated_messages = [{"role": "system", "content": f"📝 CONVERSATION SUMMARY:\n{summary}\n\n💡 Continue naturally from this context."}]
                truncated_messages.extend(recent_messages[-12:])  # Keep last 6 exchanges
                recent_messages = truncated_messages
            else:
                recent_messages = recent_messages[-12:]  # Keep last 6 exchanges

        logger.info(f"🧠 Built enhanced conversation context: {len(recent_messages)} messages, {len(history)} total")
        return {
            "recent_messages": recent_messages,
            "summary": summary,
            "total_messages": len(history)
        }

    except Exception as e:
        logger.warning(f"Error building enhanced context: {e}")
        # Fallback to simple recent context
        recent = history[-5:]
        recent_messages = [
            {"role": "user", "content": conv.user_message}
            for conv in recent
        ] + [
            {"role": "assistant", "content": conv.ai_response}
            for conv in recent
        ]
        return {
            "recent_messages": recent_messages,
            "summary": "",
            "total_messages": len(history)
        }


def cleanup_old_conversations(db: Session, days_old: int = 30):
    """Clean up old conversation data to save space"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        deleted = db.query(AIConversation).filter(
            AIConversation.created_at < cutoff_date
        ).delete()
        db.commit()
        logger.info(f"🧹 Cleaned up {deleted} old conversations")
    except Exception as e:
        logger.error(f"Error cleaning up conversations: {e}")
        db.rollback()


def detect_negotiation_end(conversation_text: str) -> bool:
    """
    Use AI to detect if a project negotiation has reached completion
    Returns True if negotiation appears to be finished
    """
    if not openai_client:
        return False

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Analyze this project chat conversation to determine if the negotiation has reached completion.

Look for indicators that both parties have agreed on:
- Project scope and deliverables
- Timeline/deadline
- Payment terms and amount
- Next steps to begin work

Return only "true" if there's clear agreement on all major terms, or "false" if they're still negotiating or discussing.

Examples of completed negotiations:
- "Agreed on the terms, let's proceed"
- "Terms look good, ready to start"
- "We have a deal, payment will be through escrow"

Examples of ongoing negotiations:
- "Can you lower the price?"
- "Need more time for delivery"
- "Let me review the requirements again" """
                },
                {
                    "role": "user",
                    "content": f"Has this negotiation reached completion?\n\nConversation:\n{conversation_text}"
                }
            ],
            temperature=0.2,
            max_tokens=10,
            timeout=5.0
        )

        result = response.choices[0].message.content.strip().lower()
        return result == "true"

    except Exception as e:
        logger.warning(f"Negotiation detection failed: {e}")
        return False
