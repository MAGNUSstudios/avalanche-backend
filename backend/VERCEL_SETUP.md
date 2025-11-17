# Vercel Frontend Configuration

## Your Frontend URL
`https://avalanche-frontend-indol.vercel.app`

---

## Step 1: Deploy Your Backend to Railway

### 1. Go to [railway.app](https://railway.app) and login with GitHub

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- **Important**: Set root directory to `backend` if your repo has both frontend and backend

### 3. Add These Environment Variables

Click on Variables tab and add:

```bash
# Database (choose one)
# Option A: Use Supabase (recommended)
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Option B: Use Railway PostgreSQL (easier for testing)
# Just add PostgreSQL database from Railway dashboard - DATABASE_URL auto-created

# Security
SECRET_KEY=your-secret-key-change-this-to-something-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend - USE YOUR EXACT VERCEL URL
FRONTEND_URL=https://avalanche-frontend-indol.vercel.app

# OpenAI
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

# MCP Server
MCP_API_KEY=your-mcp-api-key
MCP_RATE_LIMIT_REQUESTS_PER_MINUTE=60
MCP_RATE_LIMIT_REQUESTS_PER_HOUR=1000
```

### 4. Deploy
Railway will automatically deploy. You'll get a URL like:
`https://stitch-payment-escrow-production.railway.app`

---

## Step 2: Update Your Vercel Frontend

### 1. Go to [vercel.com](https://vercel.com/dashboard)

### 2. Select your `avalanche-frontend-indol` project

### 3. Go to Settings → Environment Variables

### 4. Add This Variable

**Variable Name**: (Choose the one your frontend uses)
- `VITE_API_URL` (for Vite/React)
- `REACT_APP_API_URL` (for Create React App)
- `NEXT_PUBLIC_API_URL` (for Next.js)

**Value**: Your Railway backend URL
```
https://your-backend.railway.app
```

Example:
```
VITE_API_URL=https://stitch-payment-escrow-production.railway.app
```

### 5. Redeploy Frontend
- Go to Deployments tab
- Find latest deployment
- Click ⋯ (three dots) → "Redeploy"
- Or push a new commit to trigger automatic deployment

---

## Step 3: Verify Connection

### Test Backend
```bash
curl https://your-backend.railway.app/docs
```
You should see the FastAPI Swagger documentation.

### Test Frontend
1. Open `https://avalanche-frontend-indol.vercel.app`
2. Open browser DevTools (F12) → Network tab
3. Try making an API call (login, signup, etc.)
4. Verify requests are going to your Railway backend URL

---

## Quick Troubleshooting

### ❌ CORS Error in Browser Console
**Problem**: "Access to fetch at 'https://...' from origin 'https://avalanche-frontend-indol.vercel.app' has been blocked by CORS"

**Solution**:
- Verify `FRONTEND_URL` in Railway is exactly: `https://avalanche-frontend-indol.vercel.app`
- No trailing slash
- Must match exactly

### ❌ Network Error / Can't Connect
**Problem**: Frontend can't reach backend

**Solution**:
- Check `VITE_API_URL` is set correctly in Vercel
- Verify Railway deployment is running (check Railway dashboard)
- Check Railway logs for errors

### ❌ 500 Internal Server Error
**Problem**: Backend crashes on requests

**Solution**:
- Check Railway logs (click on deployment → View Logs)
- Usually missing environment variable
- Database connection issue - verify `DATABASE_URL` or Supabase credentials

---

## Database Options

### Option A: Railway PostgreSQL (Easier)
1. In Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Railway auto-creates `DATABASE_URL` variable
4. No additional setup needed

### Option B: Supabase (Better for Production)
1. You already have Supabase migration files in your backend
2. Use the `SUPABASE_DB_URL` from your Supabase dashboard
3. See `SUPABASE_MIGRATION_README.md` for details

---

## Final Checklist

- [ ] Backend deployed on Railway
- [ ] All environment variables added to Railway
- [ ] `FRONTEND_URL=https://avalanche-frontend-indol.vercel.app` set in Railway
- [ ] Backend URL obtained from Railway
- [ ] `VITE_API_URL` added to Vercel environment variables
- [ ] Frontend redeployed on Vercel
- [ ] Tested: Open frontend and verify API calls work
- [ ] Database connected and working

---

## Need Help?

If you get stuck:
1. **Check Railway Logs**: Railway Dashboard → Your Service → Logs
2. **Check Browser Console**: F12 → Console tab for frontend errors
3. **Check Network Tab**: F12 → Network tab to see actual API requests

Your apps should now be connected! 🎉
