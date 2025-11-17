# Deploy to Render - Complete Guide

## Your Frontend URL
`https://avalanche-frontend-indol.vercel.app`

---

## Step 1: Deploy Backend to Render

### 1. Go to [render.com](https://render.com)
- Sign up or login with GitHub

### 2. Create New Web Service
- Click **"New +"** button (top right)
- Select **"Web Service"**

### 3. Connect Your Repository
- Click **"Connect a repository"** or **"Configure account"** to link GitHub
- Find and select your repository
- Click **"Connect"**

### 4. Configure Your Web Service

Fill in these settings:

**Basic Settings:**
```
Name: avalanche-backend (or any name you prefer)
Region: Choose closest to your users (e.g., Oregon, Frankfurt)
Branch: main (or your default branch)
Root Directory: backend (if your backend is in a subfolder)
Runtime: Python 3
```

**Build Settings:**
```
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Instance Type:**
```
Free (or paid if you need more resources)
```

### 5. Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add all of these:

```bash
# Database - Choose Option A or B

# Option A: Use Render PostgreSQL (Recommended - Easy Setup)
# We'll add this in Step 2 below - it will auto-create DATABASE_URL

# Option B: Use Supabase
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Security - IMPORTANT: Change SECRET_KEY to something random!
SECRET_KEY=your-very-long-random-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend - Your Vercel URL (MUST BE EXACT)
FRONTEND_URL=https://avalanche-frontend-indol.vercel.app

# OpenAI (if using AI features)
OPENAI_API_KEY=your-openai-api-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Stripe (for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Paystack (for payments)
PAYSTACK_SECRET_KEY=your-paystack-secret-key
PAYSTACK_PUBLIC_KEY=your-paystack-public-key

# MCP Server (if using)
MCP_API_KEY=your-mcp-api-key
MCP_RATE_LIMIT_REQUESTS_PER_MINUTE=60
MCP_RATE_LIMIT_REQUESTS_PER_HOUR=1000

# Python Environment (Auto-detected, but you can add if needed)
PYTHON_VERSION=3.12.0
```

### 6. Click "Create Web Service"

Render will start deploying your app. This takes 5-10 minutes.

---

## Step 2: Add PostgreSQL Database (Recommended)

### 1. From Render Dashboard
- Click **"New +"**
- Select **"PostgreSQL"**

### 2. Configure Database
```
Name: avalanche-db (or any name)
Database: avalanche
User: avalanche_user
Region: Same as your web service
PostgreSQL Version: 15 (or latest)
```

### 3. Choose Plan
- **Free** (for testing - limited storage)
- **Starter** (for production - $7/month)

### 4. Click "Create Database"

### 5. Link Database to Web Service
- Go to your **Web Service** (avalanche-backend)
- Click **"Environment"** tab
- Click **"Add Environment Variable"**
- Add:
  ```
  Name: DATABASE_URL
  Value: [Copy from your PostgreSQL dashboard - Internal Database URL]
  ```

Or Render may auto-link it if they're in the same account.

---

## Step 3: Get Your Backend URL

After deployment completes:

1. Go to your Web Service dashboard
2. At the top, you'll see your URL:
   ```
   https://avalanche-backend.onrender.com
   ```
   (The actual URL will be based on your service name)

3. **Copy this URL** - you'll need it for Vercel

4. **Test it** - Open:
   ```
   https://your-backend.onrender.com/docs
   ```
   You should see FastAPI's interactive documentation (Swagger UI)

---

## Step 4: Update Vercel Frontend

### 1. Go to [vercel.com](https://vercel.com/dashboard)

### 2. Select Your Project
- Click on `avalanche-frontend-indol`

### 3. Go to Settings
- Click **"Settings"** tab
- Click **"Environment Variables"**

### 4. Add Backend URL

Click **"Add New"** and enter:

**For Vite/React:**
```
Name: VITE_API_URL
Value: https://your-backend.onrender.com
```

**For Create React App:**
```
Name: REACT_APP_API_URL
Value: https://your-backend.onrender.com
```

**For Next.js:**
```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend.onrender.com
```

**Select**: Production, Preview, Development (or just Production)

### 5. Redeploy Frontend
- Go to **"Deployments"** tab
- Find the latest deployment
- Click **⋯** (three dots)
- Click **"Redeploy"**

Or just push a new commit to trigger automatic deployment.

---

## Step 5: Update Frontend Code (if needed)

Make sure your frontend is using the environment variable:

```javascript
// In your API configuration file or where you make API calls

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Then use it like:
fetch(`${API_URL}/api/users`)
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## Testing Your Deployment

### 1. Test Backend Directly
```bash
# Health check
curl https://your-backend.onrender.com/

# API docs
curl https://your-backend.onrender.com/docs
```

### 2. Test Frontend Connection
1. Open `https://avalanche-frontend-indol.vercel.app`
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Try an action (login, signup, etc.)
5. Check that requests go to `https://your-backend.onrender.com`

### 3. Check for Errors
- **Backend logs**: Render Dashboard → Your Service → Logs tab
- **Frontend errors**: Browser Console (F12 → Console)

---

## Important Notes About Render Free Tier

⚠️ **Free tier limitations:**
- **Spins down after 15 minutes of inactivity**
- First request after spin-down takes 30-60 seconds (cold start)
- Limited to 750 hours/month (about 31 days if always running)

💡 **Solutions:**
1. Upgrade to paid tier ($7/month) - no spin down
2. Use a service like [UptimeRobot](https://uptimerobot.com) to ping your backend every 10 minutes
3. Add loading states in frontend for cold starts

---

## Troubleshooting

### ❌ Build Failed on Render
**Check:**
- Build logs in Render dashboard
- Make sure `requirements.txt` is in the correct directory
- Verify all dependencies are listed

**Common fix:**
- Make sure Root Directory is set to `backend` if it's in a subfolder

### ❌ CORS Error in Browser
**Error**: "Access to fetch has been blocked by CORS"

**Solution:**
- Verify `FRONTEND_URL` in Render is **exactly**: `https://avalanche-frontend-indol.vercel.app`
- No trailing slash!
- Exact match required

### ❌ 500 Internal Server Error
**Check Render logs:**
- Render Dashboard → Your Service → Logs
- Look for Python errors
- Usually missing environment variable or database connection issue

### ❌ Database Connection Failed
**Solutions:**
- Verify `DATABASE_URL` is set correctly
- Check if database is running (Render PostgreSQL dashboard)
- If using Supabase, verify credentials

### ❌ App Keeps Restarting
**Check:**
- Render logs for crash errors
- Might be missing critical environment variable
- Database connection might be failing

---

## Deployment Checklist

- [ ] Backend deployed on Render
- [ ] PostgreSQL database created and linked (or Supabase configured)
- [ ] All environment variables added
- [ ] `FRONTEND_URL=https://avalanche-frontend-indol.vercel.app` set
- [ ] Deployment successful (check Render dashboard)
- [ ] Backend URL copied (e.g., `https://your-app.onrender.com`)
- [ ] Tested `/docs` endpoint
- [ ] `VITE_API_URL` added to Vercel
- [ ] Frontend redeployed
- [ ] Tested full flow: Frontend → Backend → Database
- [ ] No CORS errors in browser console

---

## Pro Tips

### 1. Environment Variables Template
Save this in your password manager for easy setup:
```bash
SECRET_KEY=<generate-random-key>
FRONTEND_URL=https://avalanche-frontend-indol.vercel.app
DATABASE_URL=<from-render-postgresql>
CLOUDINARY_CLOUD_NAME=<from-cloudinary>
# ... etc
```

### 2. Generate SECRET_KEY
```python
# Run this locally to generate a secure key:
import secrets
print(secrets.token_urlsafe(32))
```

### 3. Monitor Your App
- Enable notifications in Render for deployment failures
- Check logs regularly for errors
- Set up UptimeRobot to monitor uptime

---

## Next Steps After Deployment

1. **Test all features**: Login, payments, file uploads, etc.
2. **Set up monitoring**: Use Render's built-in monitoring or external tools
3. **Configure custom domain** (optional): Render Settings → Custom Domain
4. **Set up CI/CD**: Render auto-deploys on git push (already configured!)
5. **Database backups**: Render PostgreSQL has automatic backups on paid plans

---

## Need Help?

**Render Resources:**
- [Render Docs](https://render.com/docs)
- [Render Community](https://community.render.com/)

**Common Commands:**
```bash
# View logs
# (Use Render Dashboard → Logs)

# Restart service
# (Render Dashboard → Manual Deploy → Deploy latest commit)

# Check environment variables
# (Render Dashboard → Environment)
```

Your backend is ready to deploy to Render! 🚀

Good luck with your deployment!
