# 🔍 Marketplace Semantic Search System

## Overview

This is an **AI-powered semantic search system** for your marketplace that understands natural language queries and finds relevant products using:

- **OpenAI Embeddings** for semantic understanding
- **Qdrant Vector Database** for fast similarity search
- **FastAPI Backend** for RESTful API endpoints

### ✨ Key Features

✅ **Semantic Understanding** - Understands synonyms and variations
  - "foodstuff" = "groceries" = "raw food" = "edibles" → all return `food` products

✅ **Auto Category Detection** - AI detects what category the user wants

✅ **No Manual Keywords** - Uses embeddings, not keyword matching

✅ **Natural Language Queries** - Users can search like they talk

✅ **Price Filtering** - Supports min/max price constraints

---

## 📂 Files Created

| File | Purpose |
|------|---------|
| `marketplace_semantic_search.py` | Core AI service (embeddings, category detection, vector search) |
| `marketplace_routes.py` | Enhanced with semantic search API endpoints |
| `index_marketplace_products.py` | Script to index products into Qdrant |
| `MARKETPLACE_SEMANTIC_SEARCH_README.md` | This documentation |

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Make sure you have these in your `requirements.txt`:

```txt
openai>=1.0.0
qdrant-client>=1.7.0
python-dotenv
fastapi
sqlalchemy
```

Install them:

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install openai qdrant-client
```

### Step 2: Start Qdrant (Vector Database)

#### Option A: Docker (Recommended)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

#### Option B: Qdrant Cloud

1. Sign up at [cloud.qdrant.io](https://cloud.qdrant.io)
2. Get your API key and URL
3. Add to `.env`:
   ```
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your-api-key
   ```

### Step 3: Configure API Keys

Add to your `.env` file:

```env
# OpenAI API Key (Required for embeddings)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Qdrant Configuration
QDRANT_URL=http://localhost:6333    # or your Qdrant Cloud URL
QDRANT_API_KEY=                      # leave empty for local Docker
```

### Step 4: Verify Services

Test that everything is connected:

```bash
# Start your backend
python -m uvicorn main:app --reload

# Check health endpoint
curl http://localhost:8000/marketplace/ai-health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "qdrant": "connected",
    "openai": "configured",
    "semantic_search": "available"
  },
  "message": "All AI services operational"
}
```

### Step 5: Index Your Products

Run the indexing script:

```bash
cd backend
python index_marketplace_products.py
```

This will:
1. Fetch all active products from your database
2. Generate embeddings for each product
3. Store them in Qdrant with metadata

**⏱️ Time estimate:** ~1-2 seconds per 10 products (depends on OpenAI API speed)

---

## 📡 API Endpoints

### 1. Semantic Search (POST)

**Endpoint:** `POST /marketplace/semantic-search`

**Request Body:**
```json
{
  "query": "What foodstuff do you have?",
  "category": null,
  "limit": 20,
  "min_price": null,
  "max_price": null,
  "auto_detect_category": true
}
```

**Response:**
```json
{
  "category_detected": "food",
  "confidence": 0.89,
  "matches": [
    {
      "product_id": 1,
      "name": "Organic Rice",
      "description": "Premium long grain rice",
      "category": "food",
      "price": 12.99,
      "image_url": "https://...",
      "stock": 50,
      "seller_id": 5,
      "relevance_score": 0.92
    }
  ],
  "total_results": 15,
  "query": "What foodstuff do you have?",
  "error": null
}
```

### 2. Semantic Search (GET)

**Endpoint:** `GET /marketplace/semantic-search`

**Query Parameters:**
- `q` (required): Search query
- `category` (optional): Filter by category
- `limit` (optional): Max results (default: 20)
- `min_price` (optional): Minimum price
- `max_price` (optional): Maximum price

**Example:**
```bash
curl "http://localhost:8000/marketplace/semantic-search?q=foodstuff&limit=10"
curl "http://localhost:8000/marketplace/semantic-search?q=laptops+under+1000&max_price=1000"
```

### 3. Category Detection

**Endpoint:** `POST /marketplace/detect-category`

**Request:**
```json
{
  "text": "I need groceries"
}
```

**Response:**
```json
{
  "category": "food",
  "confidence": 0.87,
  "text": "I need groceries"
}
```

### 4. Reindex All Products

**Endpoint:** `POST /marketplace/reindex`

Rebuilds the entire product index.

**Response:**
```json
{
  "status": "completed",
  "total_products": 150,
  "indexed": 148,
  "failed": 2,
  "success_rate": "98.7%"
}
```

### 5. Get Supported Categories

**Endpoint:** `GET /marketplace/categories`

**Response:**
```json
{
  "categories": ["food", "electronics", "laptops", "phones", "fashion", "shoes", "bags"],
  "total": 7,
  "note": "The AI understands variations of these categories"
}
```

### 6. Health Check

**Endpoint:** `GET /marketplace/ai-health`

Check if AI services are operational.

---

## 🧪 Testing Examples

### Example 1: Food Variations

All these queries should return `food` products:

```bash
# "foodstuff"
curl -X POST http://localhost:8000/marketplace/semantic-search \
  -H "Content-Type: application/json" \
  -d '{"query": "What foodstuff do you have?"}'

# "groceries"
curl -X POST http://localhost:8000/marketplace/semantic-search \
  -H "Content-Type: application/json" \
  -d '{"query": "Show me groceries"}'

# "raw food"
curl -X POST http://localhost:8000/marketplace/semantic-search \
  -H "Content-Type: application/json" \
  -d '{"query": "I need raw food items"}'

# "edibles"
curl -X POST http://localhost:8000/marketplace/semantic-search \
  -H "Content-Type: application/json" \
  -d '{"query": "What edibles are in stock?"}'
```

All should return:
```json
{
  "category_detected": "food",
  "confidence": 0.85-0.95,
  "matches": [...]
}
```

### Example 2: Electronics

```bash
# "laptops"
curl "http://localhost:8000/marketplace/semantic-search?q=Show+me+laptops"

# "notebooks" (computers)
curl "http://localhost:8000/marketplace/semantic-search?q=Looking+for+notebooks"

# "computers"
curl "http://localhost:8000/marketplace/semantic-search?q=I+need+a+computer"
```

### Example 3: With Price Filters

```bash
# Laptops under $1000
curl "http://localhost:8000/marketplace/semantic-search?q=laptops&max_price=1000"

# Shoes between $50-$150
curl "http://localhost:8000/marketplace/semantic-search?q=shoes&min_price=50&max_price=150"
```

---

## 🎯 How It Works

### 1. **Indexing Phase** (One-time setup)

```
Product DB → Embedding Generator → Qdrant Vector DB
```

For each product:
1. Combine `name + category + description` into text
2. Send to OpenAI to generate 1536-dimensional embedding vector
3. Store vector + metadata (price, category, etc.) in Qdrant

### 2. **Search Phase** (Runtime)

```
User Query → Category Detection → Embedding → Vector Search → Results
```

Steps:
1. **User Query:** "What foodstuff do you have?"
2. **Category Detection:** AI determines query is about `food` (confidence: 0.89)
3. **Query Embedding:** Convert query to 1536-dim vector
4. **Vector Search:** Find top-K most similar product vectors in Qdrant
5. **Filter:** Apply category filter (`food`), price filters
6. **Return:** Sorted by relevance score

### 3. **Why This Works**

**Semantic embeddings capture meaning:**
- "foodstuff" → `[0.23, -0.45, 0.67, ...]`
- "groceries" → `[0.24, -0.44, 0.68, ...]` ← Very similar!
- "electronics" → `[-0.82, 0.31, -0.19, ...]` ← Very different

Cosine similarity between vectors determines relevance.

---

## 🔧 Customization

### Adding New Categories

Edit `marketplace_semantic_search.py`:

```python
CANONICAL_CATEGORIES = [
    "food",
    "electronics",
    "laptops",
    "phones",
    "fashion",
    "shoes",
    "bags",
    # Add your new categories:
    "books",
    "toys",
    "furniture",
]
```

Then reindex:
```bash
python index_marketplace_products.py
```

### Adjusting Search Sensitivity

In `marketplace_semantic_search.py`:

```python
def semantic_search_marketplace(
    query: str,
    score_threshold: float = 0.5,  # Lower = more lenient, Higher = stricter
    ...
):
```

- **0.3-0.5:** Lenient (more results, might include less relevant)
- **0.6-0.7:** Balanced (recommended)
- **0.8-0.9:** Strict (fewer results, high relevance only)

### Changing Embedding Model

In `marketplace_semantic_search.py`:

```python
EMBEDDING_MODEL = "text-embedding-3-small"   # Fast, cheap ($0.02/1M tokens)
# OR
EMBEDDING_MODEL = "text-embedding-3-large"   # Better quality, more expensive
```

---

## 📊 Cost Estimate (OpenAI)

Using `text-embedding-3-small`:

- **Cost:** $0.02 per 1M tokens
- **Average product:** ~50 tokens (name + description + category)
- **1000 products:** ~50,000 tokens = **$0.001** (one-tenth of a cent)

**Indexing 10,000 products:** ~$0.01

**Search queries:** ~10 tokens each = **$0.0000002 per search** (essentially free)

---

## 🚨 Troubleshooting

### Issue: "Qdrant client not initialized"

**Solution:**
```bash
# Check if Qdrant is running
docker ps | grep qdrant

# Or start it
docker run -p 6333:6333 qdrant/qdrant

# Verify connection
curl http://localhost:6333
```

### Issue: "OpenAI client not initialized"

**Solution:**
```bash
# Check .env file
cat .env | grep OPENAI_API_KEY

# Make sure key is valid
# Get a new one from: https://platform.openai.com/api-keys
```

### Issue: "No products found"

**Solution:**
```bash
# Check if you have products in database
cd backend
python3 << EOF
from database import SessionLocal, Product
db = SessionLocal()
count = db.query(Product).count()
print(f"Total products: {count}")
db.close()
EOF

# If 0, add some products first through your app
```

### Issue: Search returns no results

**Possible causes:**
1. **Products not indexed** → Run `python index_marketplace_products.py`
2. **Score threshold too high** → Lower it in `semantic_search_marketplace()`
3. **Wrong category** → Check `category_detected` in response

---

## 📈 Performance

### Speed

- **Indexing:** ~100-200 products/minute (limited by OpenAI API)
- **Search:** <100ms (Qdrant is very fast)

### Scaling

- **Up to 100K products:** Single Qdrant instance handles easily
- **100K-1M products:** Use Qdrant Cloud with sharding
- **1M+ products:** Distributed Qdrant cluster

---

## 🔐 Security Notes

✅ **API keys are in .env** - Never commit `.env` to Git

✅ **Qdrant local = no auth needed** - But add `QDRANT_API_KEY` for production

✅ **Rate limiting** - Consider adding to prevent abuse

---

## 🎉 Success Checklist

- [ ] Qdrant running (Docker or Cloud)
- [ ] OpenAI API key configured in `.env`
- [ ] `/marketplace/ai-health` returns "healthy"
- [ ] Products indexed (`python index_marketplace_products.py`)
- [ ] Search works: `GET /marketplace/semantic-search?q=food`
- [ ] Category detection works: "foodstuff" → "food"

---

## 📞 Support

If you encounter issues:

1. **Check logs** - Backend logs show detailed errors
2. **Test health endpoint** - `/marketplace/ai-health`
3. **Verify API keys** - Ensure OpenAI key is valid
4. **Check Qdrant** - `curl http://localhost:6333`

---

## 🚀 Next Steps

Once semantic search is working:

1. **Integrate into frontend** - Add semantic search UI
2. **Add analytics** - Track which queries are popular
3. **Improve relevance** - Fine-tune score thresholds
4. **Add filters** - Stock availability, ratings, etc.
5. **Cache results** - For common queries

---

**🎉 You now have a production-ready AI-powered marketplace search system!**

The AI will understand variations like:
- "foodstuff" = "groceries" = "provisions" → `food`
- "laptop" = "notebook" = "computer" → `laptops`
- "smartphone" = "mobile phone" = "cell phone" → `phones`

No manual keyword lists needed! 🚀
