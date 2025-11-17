# Quick Start Guide: Qdrant Setup

## Current Status

✅ **OpenAI API Key**: Configured and working
✅ **Embedding Generation**: Successfully tested (1536 dimensions)
⚠️ **Qdrant Server**: Not running (needs to be started)

## Option 1: Using Docker (Recommended)

If you have Docker installed:

```bash
# Start Qdrant in detached mode
docker run -d -p 6333:6333 -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  --name qdrant \
  qdrant/qdrant

# Verify it's running
curl http://localhost:6333/
```

**Stop Qdrant:**
```bash
docker stop qdrant
```

**Restart Qdrant:**
```bash
docker start qdrant
```

**Remove Qdrant:**
```bash
docker stop qdrant && docker rm qdrant
```

## Option 2: Using the Start Script

I've created a script that will download and run Qdrant:

```bash
cd backend
chmod +x start_qdrant.sh
./start_qdrant.sh
```

## Option 3: Manual Binary Download

Download the latest release for your system:

**For macOS (Apple Silicon):**
```bash
curl -L https://github.com/qdrant/qdrant/releases/download/v1.7.4/qdrant-aarch64-apple-darwin.tar.gz -o qdrant.tar.gz
tar -xzf qdrant.tar.gz
./qdrant
```

**For macOS (Intel):**
```bash
curl -L https://github.com/qdrant/qdrant/releases/download/v1.7.4/qdrant-x86_64-apple-darwin.tar.gz -o qdrant.tar.gz
tar -xzf qdrant.tar.gz
./qdrant
```

## Verify Setup

After starting Qdrant, run the test script:

```bash
cd backend
source venv/bin/activate
python3 test_qdrant.py
```

You should see:
```
✓ All systems ready for semantic search!
```

## Access Qdrant Dashboard

Once running, visit: **http://localhost:6333/dashboard**

You'll see:
- Collections (projects, products, guilds)
- Vector count
- Storage metrics

## Testing the API

### 1. Index a Project

First, create a project via the frontend or API, then index it:

```bash
curl -X POST "http://localhost:8000/index/project/1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Search for Projects

```bash
curl "http://localhost:8000/search/projects?query=AI+machine+learning&limit=5"
```

Expected response:
```json
{
  "query": "AI machine learning",
  "results": [
    {
      "project_id": 1,
      "title": "AI-Powered Analytics",
      "description": "...",
      "score": 0.89,
      "project": { ... }
    }
  ],
  "count": 1
}
```

## Troubleshooting

### "Connection refused" error
- Make sure Qdrant is running on port 6333
- Check with: `curl http://localhost:6333/`

### "OpenAI API error"
- Verify API key is correct in `.env`
- Check quota: https://platform.openai.com/usage

### Port already in use
```bash
# Find process using port 6333
lsof -i :6333

# Kill it
kill -9 <PID>
```

## Cost Monitoring

The test script showed OpenAI embeddings work. Costs are:
- **Per embedding**: ~$0.00002 for 200 tokens
- **1,000 projects**: ~$0.04
- **10,000 projects**: ~$0.40

Monitor usage at: https://platform.openai.com/usage

## Next Steps

1. ✅ OpenAI configured
2. ⏳ Start Qdrant server
3. 🎯 Test semantic search
4. 🚀 Integrate with project creation workflow

Once Qdrant is running, the semantic search will be fully operational!
