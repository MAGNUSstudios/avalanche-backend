# Backend Deployment Guide

## Connecting Your Vercel Frontend to Your Backend

This guide will help you deploy your FastAPI backend and connect it to your Vercel-hosted frontend.

---

## Option 1: Deploy to Railway (Recommended - Easiest)

### Step 1: Prepare Your Backend
✅ **Already done!** The following files have been created:
- `Procfile` - Tells Railway how to start your app
- `runtime.txt` - Specifies Python version
- `requirements.txt` - Updated with all dependencies

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign up/login with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if needed
   - Select your repository
   - Choose the `backend` folder as the root directory

3. **Configure Environment Variables**
   Click on your service → Variables → Add all these from your `.env.example`:

   ```
   DATABASE_URL=postgresql://... (use Railway's PostgreSQL or Supabase)
   SECRET_KEY=your-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   OPENAI_API_KEY=your-openai-api-key
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   FRONTEND_URL=https://your-vercel-app.vercel.app
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
   PAYSTACK_SECRET_KEY=your-paystack-secret-key
   PAYSTACK_PUBLIC_KEY=your-paystack-public-key
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   MCP_API_KEY=your-mcp-api-key
   ```

4. **Add PostgreSQL Database** (if not using Supabase)
   - In your Railway project, click "New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-create a `DATABASE_URL` variable

5. **Get Your Backend URL**
   - After deployment, Railway will give you a URL like: `https://your-app.railway.app`
   - Copy this URL

### Step 3: Update Your Vercel Frontend

1. **Go to your Vercel Dashboard**
   - Select your frontend project
   - Go to Settings → Environment Variables

2. **Add Backend URL**
   ```
   VITE_API_URL=https://your-app.railway.app
   # or if your frontend uses a different variable name
   REACT_APP_API_URL=https://your-app.railway.app
   NEXT_PUBLIC_API_URL=https://your-app.railway.app
   ```

3. **Redeploy Frontend**
   - Go to Deployments tab
   - Click the three dots on the latest deployment
   - Click "Redeploy"

---

## Option 2: Deploy to Render

### Step 1: Go to [Render.com](https://render.com)

1. Sign up/login with GitHub
2. Click "New +" → "Web Service"
3. Connect your repository
4. Configure:
   - **Name**: your-backend-name
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free

### Step 2: Add Environment Variables
Same as Railway (see above)

### Step 3: Deploy & Get URL
- Render will deploy and give you a URL like: `https://your-app.onrender.com`
- Use this in your Vercel frontend environment variables

---

## Option 3: Deploy to Fly.io

### Step 1: Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
```

### Step 2: Login and Launch
```bash
cd backend
fly auth login
fly launch
```

Follow the prompts and it will auto-detect your FastAPI app.

### Step 3: Set Environment Variables
```bash
fly secrets set SECRET_KEY=your-secret-key
fly secrets set FRONTEND_URL=https://your-vercel-app.vercel.app
# ... add all other variables
```

### Step 4: Deploy
```bash
fly deploy
```

---

## Important Notes

### Database Migration
If you're using Supabase (recommended for production):
1. Your backend is already configured for Supabase (see `SUPABASE_MIGRATION_README.md`)
2. Make sure to use `SUPABASE_DB_URL` instead of local SQLite
3. Run migrations if needed

### CORS Configuration
✅ **Already configured!** Your backend now supports multiple frontend URLs.

In your deployment, set `FRONTEND_URL` to:
```
FRONTEND_URL=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```
(Multiple URLs separated by commas)

### Testing Your Connection

After deployment, test your backend:

1. **Health Check**
   ```bash
   curl https://your-backend-url.railway.app/
   ```

2. **Update Frontend API Calls**
   Make sure your frontend is calling the correct backend URL.

   Example in your frontend code:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

   fetch(`${API_URL}/api/users`)
   ```

### Common Issues

**Issue**: CORS errors
- **Solution**: Make sure `FRONTEND_URL` in backend includes your exact Vercel URL

**Issue**: 500 errors on backend
- **Solution**: Check Railway/Render logs for errors, usually missing environment variables

**Issue**: Database connection fails
- **Solution**: Verify `DATABASE_URL` or Supabase credentials are correct

---

## Quick Checklist

- [ ] Backend deployed to Railway/Render/Fly
- [ ] All environment variables set
- [ ] Database connected (Supabase or Railway PostgreSQL)
- [ ] Backend URL obtained
- [ ] Frontend environment variable `VITE_API_URL` updated
- [ ] Frontend redeployed on Vercel
- [ ] Test API calls from frontend

---

## Support

If you encounter issues:
1. Check deployment logs in Railway/Render/Fly dashboard
2. Verify all environment variables are set correctly
3. Test backend endpoints directly using curl or Postman
4. Check browser console for CORS or network errors

Your backend should now be live and connected to your Vercel frontend! 🚀
