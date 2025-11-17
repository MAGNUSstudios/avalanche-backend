from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Optional
from datetime import datetime
import random
from pydantic import BaseModel, Field

from database import get_db, User, Product, Order
from auth import get_current_user
from schemas import ProductCreate, ProductUpdate, ProductResponse
from marketplace_semantic_search import (
    semantic_search_marketplace,
    detect_category,
    index_product as index_product_vector
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])


# ============================================================================
# PYDANTIC MODELS FOR SEMANTIC SEARCH
# ============================================================================

class SemanticSearchRequest(BaseModel):
    """Request model for semantic marketplace search"""
    query: str = Field(..., description="Natural language search query", min_length=1, max_length=500)
    category: Optional[str] = Field(None, description="Optional category filter")
    limit: int = Field(20, description="Maximum number of results", ge=1, le=100)
    min_price: Optional[float] = Field(None, description="Minimum price filter", ge=0)
    max_price: Optional[float] = Field(None, description="Maximum price filter", ge=0)
    auto_detect_category: bool = Field(True, description="Enable automatic category detection")


class SemanticSearchResponse(BaseModel):
    """Response model for semantic search"""
    category_detected: Optional[str] = Field(None, description="Auto-detected category from query")
    confidence: float = Field(0.0, description="Category detection confidence (0-1)")
    matches: List[dict] = Field([], description="List of matching products")
    total_results: int = Field(0, description="Total number of results found")
    query: str = Field(..., description="Original search query")
    error: Optional[str] = Field(None, description="Error message if search failed")


class CategoryDetectionRequest(BaseModel):
    """Request model for category detection"""
    text: str = Field(..., description="Text to analyze for category", min_length=1, max_length=500)


class CategoryDetectionResponse(BaseModel):
    """Response model for category detection"""
    category: str = Field(..., description="Detected category")
    confidence: float = Field(..., description="Detection confidence (0-1)")
    text: str = Field(..., description="Original text analyzed")


@router.get("/featured")
async def get_featured_products(
    limit: int = 6,
    db: Session = Depends(get_db)
):
    """
    Get featured products for homepage
    """
    products = db.query(Product).filter(
        Product.is_active == True
    ).order_by(desc(Product.created_at)).limit(limit).all()
    
    return products


@router.get("/categories")
async def get_product_categories(db: Session = Depends(get_db)):
    """
    Get all product categories
    """
    categories = db.query(Product.category).distinct().all()
    category_list = [cat[0] for cat in categories if cat[0]]
    
    # Add default categories if empty
    if not category_list:
        category_list = [
            "Art & Crafts",
            "Technology",
            "Fashion",
            "Home & Living",
            "Digital Products",
            "Services"
        ]
    
    return category_list


@router.get("/search")
async def search_products(
    q: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "recent",  # recent, price_low, price_high, popular
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Search and filter products
    """
    query = db.query(Product).filter(Product.is_active == True)
    
    if q:
        query = query.filter(
            or_(
                Product.name.ilike(f"%{q}%"),
                Product.description.ilike(f"%{q}%")
            )
        )
    
    if category:
        query = query.filter(Product.category.ilike(category))
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Apply sorting
    if sort_by == "price_low":
        query = query.order_by(Product.price.asc())
    elif sort_by == "price_high":
        query = query.order_by(Product.price.desc())
    elif sort_by == "popular":
        # TODO: Add popularity metric (views, orders)
        query = query.order_by(desc(Product.created_at))
    else:  # recent
        query = query.order_by(desc(Product.created_at))
    
    total = query.count()
    products = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "products": products
    }


@router.get("/products/{product_id}/related")
async def get_related_products(
    product_id: int,
    limit: int = 4,
    db: Session = Depends(get_db)
):
    """
    Get related products based on category
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    related = db.query(Product).filter(
        Product.category.ilike(product.category) if product.category else True,
        Product.id != product_id,
        Product.is_active == True
    ).limit(limit).all()
    
    return related


@router.get("/seller/{seller_id}/products")
async def get_seller_products(
    seller_id: int,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """
    Get all products from a specific seller
    """
    products = db.query(Product).filter(
        Product.seller_id == seller_id,
        Product.is_active == True
    ).offset(skip).limit(limit).all()
    
    seller = db.query(User).filter(User.id == seller_id).first()
    
    return {
        "seller": {
            "id": seller.id,
            "name": f"{seller.first_name} {seller.last_name}",
            "country": seller.country,
            "avatar": seller.avatar_url
        } if seller else None,
        "products": products
    }


@router.get("/my/listings")
async def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's product listings
    """
    products = db.query(Product).filter(
        Product.seller_id == current_user.id
    ).order_by(desc(Product.created_at)).all()
    
    return products


@router.post("/products/{product_id}/favorite")
async def toggle_favorite(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add or remove product from favorites
    """
    # TODO: Implement favorites table
    return {"message": "Feature coming soon"}


@router.get("/stats")
async def get_marketplace_stats(db: Session = Depends(get_db)):
    """
    Get marketplace statistics
    """
    total_products = db.query(func.count(Product.id)).filter(
        Product.is_active == True
    ).scalar() or 0

    total_sellers = db.query(func.count(func.distinct(Product.seller_id))).scalar() or 0

    total_orders = db.query(func.count(Order.id)).scalar() or 0

    avg_price = db.query(func.avg(Product.price)).filter(
        Product.is_active == True
    ).scalar() or 0.0

    return {
        "total_products": total_products,
        "total_sellers": total_sellers,
        "total_orders": total_orders,
        "average_price": round(avg_price, 2)
    }


# ============================================================================
# SEMANTIC SEARCH ENDPOINTS
# ============================================================================

@router.post("/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search(request: SemanticSearchRequest):
    """
    🔍 AI-Powered Semantic Search for Marketplace

    This endpoint uses OpenAI embeddings and Qdrant vector search to understand
    natural language queries and find relevant products.

    **Features:**
    - Understands synonyms (e.g., "foodstuff" = "groceries" = "raw food")
    - Automatic category detection from query
    - Semantic similarity matching
    - Price filtering

    **Examples:**
    ```
    - "What foodstuff do you have?" → Returns food products
    - "Show me laptops" → Returns laptops
    - "I need groceries" → Returns food products
    - "Looking for running shoes under $100" → Returns shoes with price filter
    ```

    Args:
        request: SemanticSearchRequest with query and optional filters

    Returns:
        SemanticSearchResponse with detected category and matching products
    """
    try:
        logger.info(f"🔍 Semantic search: '{request.query}'")

        # Perform semantic search
        results = semantic_search_marketplace(
            query=request.query,
            category_filter=request.category,
            limit=request.limit,
            auto_detect_category=request.auto_detect_category
        )

        # Apply additional price filters if specified
        matches = results.get("matches", [])
        if request.min_price is not None:
            matches = [m for m in matches if m.get("price", 0) >= request.min_price]
        if request.max_price is not None:
            matches = [m for m in matches if m.get("price", float('inf')) <= request.max_price]

        # Build response
        response = SemanticSearchResponse(
            category_detected=results.get("category_detected"),
            confidence=results.get("confidence", 0.0),
            matches=matches,
            total_results=len(matches),
            query=request.query,
            error=results.get("error")
        )

        logger.info(f"✅ Found {len(matches)} products for: '{request.query}'")
        return response

    except Exception as e:
        logger.error(f"❌ Error in semantic search: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@router.get("/semantic-search", response_model=SemanticSearchResponse)
async def semantic_search_get(
    q: str = Query(..., description="Search query", min_length=1, max_length=500),
    category: Optional[str] = Query(None, description="Category filter"),
    limit: int = Query(20, description="Max results", ge=1, le=100),
    min_price: Optional[float] = Query(None, description="Min price", ge=0),
    max_price: Optional[float] = Query(None, description="Max price", ge=0)
):
    """
    🔍 GET version of semantic search (for simple browser/URL queries)

    Same as POST /semantic-search but uses query parameters.
    Useful for testing in browser or simple API calls.

    **Example:**
    ```
    GET /marketplace/semantic-search?q=foodstuff&limit=10
    GET /marketplace/semantic-search?q=laptops+under+1000&max_price=1000
    ```
    """
    request = SemanticSearchRequest(
        query=q,
        category=category,
        limit=limit,
        min_price=min_price,
        max_price=max_price
    )
    return await semantic_search(request)


@router.post("/detect-category", response_model=CategoryDetectionResponse)
async def detect_category_endpoint(request: CategoryDetectionRequest):
    """
    🎯 AI Category Detection

    Analyzes text to determine which product category the user is referring to.
    Uses semantic understanding (not keyword matching).

    **Examples:**
    - "I need foodstuff" → category: "food"
    - "Show me laptops" → category: "laptops"
    - "What groceries are available?" → category: "food"
    - "Looking for smartphones" → category: "phones"

    Args:
        request: Text to analyze

    Returns:
        Detected category and confidence score (0-1)
    """
    try:
        logger.info(f"🎯 Category detection: '{request.text}'")

        category, confidence = detect_category(request.text)

        response = CategoryDetectionResponse(
            category=category,
            confidence=round(confidence, 3),
            text=request.text
        )

        logger.info(f"✅ Detected: {category} (confidence: {confidence:.2f})")
        return response

    except Exception as e:
        logger.error(f"❌ Error in category detection: {e}")
        raise HTTPException(status_code=500, detail=f"Category detection failed: {str(e)}")


@router.post("/reindex")
async def reindex_all_products(db: Session = Depends(get_db)):
    """
    🔄 Reindex All Products to Vector Database

    Rebuilds the entire product index in Qdrant for semantic search.

    **Use this when:**
    - Setting up semantic search for the first time
    - After bulk product updates
    - To refresh the search index

    ⚠️ **Note:** May take time for large product catalogs

    Returns:
        Indexing statistics (total, successful, failed)
    """
    try:
        logger.info("🔄 Starting product reindexing...")

        # Get all active products from database
        products = db.query(Product).filter(Product.is_active == True).all()

        total_products = len(products)
        logger.info(f"📊 Found {total_products} products to index")

        # Index each product
        successful = 0
        failed = 0

        for product in products:
            try:
                result = index_product_vector(
                    product_id=product.id,
                    name=product.name,
                    description=product.description or "",
                    category=product.category or "uncategorized",
                    price=product.price,
                    image_url=product.image_url,
                    stock=product.stock,
                    seller_id=product.seller_id
                )

                if result:
                    successful += 1
                else:
                    failed += 1

            except Exception as e:
                logger.error(f"❌ Failed to index product {product.id}: {e}")
                failed += 1

        logger.info(f"✅ Reindexing complete: {successful} successful, {failed} failed")

        return {
            "status": "completed",
            "total_products": total_products,
            "indexed": successful,
            "failed": failed,
            "success_rate": f"{(successful/total_products*100):.1f}%" if total_products > 0 else "0%"
        }

    except Exception as e:
        logger.error(f"❌ Error during reindexing: {e}")
        raise HTTPException(status_code=500, detail=f"Reindexing failed: {str(e)}")


@router.get("/ai-health")
async def ai_health_check():
    """
    ❤️ AI Services Health Check

    Checks if Qdrant and OpenAI services are properly configured and connected.

    Returns:
        Status of semantic search services
    """
    from marketplace_semantic_search import qdrant_client, openai_client

    qdrant_ok = qdrant_client is not None
    openai_ok = openai_client is not None
    semantic_search_ok = qdrant_ok and openai_ok

    return {
        "status": "healthy" if semantic_search_ok else "degraded",
        "services": {
            "qdrant": "connected" if qdrant_ok else "not connected",
            "openai": "configured" if openai_ok else "not configured",
            "semantic_search": "available" if semantic_search_ok else "unavailable"
        },
        "message": "All AI services operational" if semantic_search_ok else "Some AI services are unavailable"
    }
