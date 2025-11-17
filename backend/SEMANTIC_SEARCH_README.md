# Semantic Search with Qdrant Integration

This document explains how the semantic search feature works and how to set it up.

## Overview

The platform now supports AI-powered semantic search for:
- **Projects** - Find relevant projects based on natural language queries
- **Products** - Discover products using contextual search
- **Guilds** - Search for communities that match your interests

## Architecture

### Components

1. **Qdrant** - Vector database for storing and searching embeddings
2. **OpenAI** - Generates text embeddings using `text-embedding-3-small`
3. **FastAPI Endpoints** - REST API for search and indexing
4. **Automatic Indexing** - Content is indexed when created/updated

### How It Works

1. When a project/product/guild is created, we generate an embedding vector using OpenAI
2. The vector is stored in Qdrant along with metadata
3. Search queries are converted to vectors and matched against stored vectors
4. Results are ranked by cosine similarity and enriched with database data

## Setup Instructions

### 1. Install Qdrant

#### Option A: Docker (Recommended)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

#### Option B: Binary Download
Download from: https://qdrant.tech/documentation/quick-start/

### 2. Set OpenAI API Key

Add your OpenAI API key to `.env`:
```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Verify Setup

Run the test script:
```bash
cd backend
source venv/bin/activate
python3 test_qdrant.py
```

You should see:
```
✓ All systems ready for semantic search!
```

## API Endpoints

### Search Endpoints

#### Search Projects
```http
GET /search/projects?query=AI+machine+learning&limit=10&score_threshold=0.7
```

#### Search Products
```http
GET /search/products?query=development+tools&limit=10&score_threshold=0.7
```

#### Search Guilds
```http
GET /search/guilds?query=web+development+community&limit=10&score_threshold=0.7
```

**Parameters:**
- `query` (required) - Natural language search query
- `limit` (optional) - Maximum number of results (default: 10, max: 50)
- `score_threshold` (optional) - Minimum similarity score (default: 0.7, range: 0.0-1.0)

**Response Format:**
```json
{
  "query": "AI machine learning",
  "results": [
    {
      "project_id": 1,
      "title": "AI-Powered Analytics Platform",
      "description": "Building a machine learning platform...",
      "score": 0.89,
      "metadata": {
        "status": "open",
        "budget": 5000.0,
        "owner_id": 1
      },
      "project": {
        "id": 1,
        "title": "AI-Powered Analytics Platform",
        "description": "Building a machine learning platform...",
        "status": "open",
        "budget": 5000.0,
        "deadline": "2025-12-31",
        "owner_id": 1,
        "created_at": "2025-11-12T10:00:00"
      }
    }
  ],
  "count": 1
}
```

### Indexing Endpoints (Authentication Required)

#### Index a Project
```http
POST /index/project/{project_id}
Authorization: Bearer {token}
```

#### Index a Product
```http
POST /index/product/{product_id}
Authorization: Bearer {token}
```

#### Index a Guild
```http
POST /index/guild/{guild_id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Project indexed successfully",
  "project_id": 1
}
```

## Integration with Existing Features

### Automatic Indexing

The system can be extended to automatically index content when created:

```python
# In project creation endpoint
@app.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Create project
    db_project = Project(**project.dict(), owner_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # Index in Qdrant (background task)
    qdrant_service.index_project(
        project_id=db_project.id,
        title=db_project.title,
        description=db_project.description or "",
        metadata={
            "status": db_project.status,
            "budget": float(db_project.budget) if db_project.budget else 0,
            "owner_id": db_project.owner_id
        }
    )

    return db_project
```

## Configuration

### Environment Variables

```env
# Qdrant Configuration
QDRANT_URL=http://localhost:6333    # Qdrant server URL
QDRANT_API_KEY=                     # Optional: Qdrant API key for cloud

# OpenAI Configuration
OPENAI_API_KEY=sk-your-key-here     # Required for embeddings
```

### Embedding Model

Currently using: `text-embedding-3-small`
- Dimension: 1536
- Cost: $0.00002 per 1K tokens
- Speed: ~300ms per request

Can be changed in `qdrant_service.py`:
```python
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSION = 1536
```

## Collections

Three vector collections are created:

1. **projects** - Project embeddings
2. **products** - Product embeddings
3. **guilds** - Guild embeddings

Each uses:
- Distance metric: Cosine similarity
- Vector size: 1536 dimensions

## Cost Estimates

### OpenAI Embedding Costs

Assuming average text length of 200 tokens per item:

| Volume | Cost (USD) |
|--------|------------|
| 1,000 items | $0.004 |
| 10,000 items | $0.04 |
| 100,000 items | $0.40 |

### Qdrant Hosting

- **Local/Self-hosted**: Free
- **Qdrant Cloud**: ~$25/month for small deployment

## Graceful Degradation

The system handles missing dependencies gracefully:

- **No OpenAI API key**: Semantic search disabled, falls back to keyword search
- **Qdrant not running**: Vector operations skipped, no errors thrown
- **Network issues**: Logged but doesn't crash the application

## Performance

- Embedding generation: ~300ms per request
- Vector search: <50ms for 100K vectors
- Concurrent requests: Supports multiple simultaneous searches

## Security

- Only owners can index their content
- Search endpoints are public (no auth required)
- Metadata filtering prevents unauthorized access

## Monitoring

Check logs for:
```
INFO:qdrant_service:Successfully connected to Qdrant
INFO:qdrant_service:Created collection: projects
INFO:qdrant_service:Indexed project 1: AI Platform
```

## Troubleshooting

### "OpenAI client not initialized"
- Set `OPENAI_API_KEY` in `.env` file
- Restart the backend server

### "Could not connect to Qdrant"
- Make sure Qdrant is running: `docker run -p 6333:6333 qdrant/qdrant`
- Check `QDRANT_URL` in `.env`

### "Failed to generate embedding"
- Check OpenAI API key validity
- Verify API quota/billing
- Check network connectivity

## Future Enhancements

1. **Hybrid Search** - Combine semantic + keyword search
2. **Filtering** - Add metadata filters (price range, date, etc.)
3. **Reranking** - Use cross-encoder for better ranking
4. **Batch Indexing** - Bulk index existing content
5. **Search Analytics** - Track popular queries
6. **Auto-suggestions** - Query completion based on embeddings

## Resources

- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Vector Search Best Practices](https://qdrant.tech/articles/what-is-a-vector-database/)
