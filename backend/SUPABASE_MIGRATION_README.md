# 🚀 Supabase Migration Guide - Alternative SQL Dump Method

## Overview
Complete migration package for moving Avalanche platform from SQLite to Supabase PostgreSQL using SQL dump method.

## 📦 What's Included

### Files Created:
- **`avalanche_migration_dump.sql`** - Complete database dump (260KB, 1,900 lines)
- **`.env.example`** - Environment configuration template
- **`migrate_to_supabase.py`** - Automated migration script (backup)

### Database Content:
- **28 Tables** with proper PostgreSQL schemas
- **69 Users** (5 with business-tier MCP access)
- **58 Projects, 100 Products, 20 Guilds**
- **67 Orders, 37 Successful Payments**
- **$1,672,938.66 Total Wallet Balance**
- **32 AI Conversations, 69 Interactions**

## 🛠️ Migration Steps

### Method 1: Supabase Dashboard Import (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for setup completion

2. **Import SQL Dump**
   - Open Supabase Dashboard → SQL Editor
   - Copy entire contents of `avalanche_migration_dump.sql`
   - Paste and run the SQL script
   - Wait for completion (may take 1-2 minutes)

3. **Verify Migration**
   - Check all 28 tables were created
   - Verify row counts match above
   - Test basic queries

### Method 2: Connection String Method

1. **Set Environment Variable**
   ```bash
   export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"
   ```

2. **Run Automated Script**
   ```bash
   cd backend && python migrate_to_supabase.py
   ```

## ⚙️ Application Configuration

### Update `backend/.env`
```bash
# Replace SQLite with Supabase
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Add other required variables from .env.example
```

### Update `backend/database.py`
```python
# Change this line:
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./avalanche.db")

# To use Supabase:
SQLALCHEMY_DATABASE_URL = os.getenv("SUPABASE_DB_URL", "sqlite:///./avalanche.db")
```

## 🔧 Post-Migration Steps

1. **Test Application**
   ```bash
   cd backend && python main.py
   ```

2. **Verify MCP Server**
   - Check `/mcp/tools` endpoint returns 23 tools
   - Test business-tier access restrictions

3. **Update Frontend API URLs**
   - Ensure frontend points to production backend URL

## 🚀 Deployment Ready

### Backend Deployment Options:
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `git push heroku main`
- **DigitalOcean**: App Platform

### Frontend Deployment Options:
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Cloudflare**: Pages deployment

## 🔒 Security Features Active

- **MCP Server**: Business-only access (5 users)
- **JWT Authentication**: Enhanced security
- **Rate Limiting**: 60 req/min, 1000 req/hour
- **Input Sanitization**: SQL injection protection
- **API Key Authentication**: For external integrations

## 📊 Production Benefits

- **Scalable PostgreSQL** (vs SQLite limits)
- **Real-time Features** via Supabase
- **Automatic Backups** included
- **Global CDN** for assets
- **Built-in Authentication** (optional upgrade)

## 🐛 Troubleshooting

### Connection Issues:
- Verify Supabase project is active
- Check connection URL in dashboard
- Ensure password is URL-encoded if needed

### Import Errors:
- Run SQL commands in smaller batches
- Check for syntax errors in dump file
- Verify PostgreSQL version compatibility

### Application Errors:
- Confirm environment variables are set
- Check database connection in logs
- Verify table schemas match application models

---

**🎯 Your Avalanche platform with MCP Server is now production-ready!**

All features implemented, tested, and ready for deployment. The SQL dump method provides a reliable alternative to automated migration scripts.
