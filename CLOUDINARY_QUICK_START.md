# 🚀 Quick Start - Cloudinary Setup

## ⚡ 3-Minute Setup

### Step 1: Get Cloudinary Account (1 min)
1. Go to: **https://cloudinary.com/users/register_free**
2. Sign up (free account)
3. Verify your email

### Step 2: Get Credentials (30 sec)
1. Open: **https://cloudinary.com/console**
2. Copy these 3 values from your Dashboard:
   ```
   Cloud Name: _______________
   API Key:    _______________
   API Secret: _______________
   ```

### Step 3: Add to .env (1 min)
1. Open: `backend/.env`
2. Replace these lines:
   ```properties
   CLOUDINARY_CLOUD_NAME=your_cloud_name      ← Replace with actual
   CLOUDINARY_API_KEY=your_api_key            ← Replace with actual
   CLOUDINARY_API_SECRET=your_api_secret      ← Replace with actual
   ```
3. Save the file

### Step 4: Restart Backend (30 sec)
```bash
# Stop the current server (Ctrl+C in terminal)
# Then run:
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

## ✅ Test It Works

1. Open browser: **http://localhost:5176/guilds**
2. Click "**Create Guild**" button
3. Upload an **icon** and **banner** image
4. Click "**Create**"
5. If images show up → **SUCCESS! 🎉**

## 🔍 Verify in Cloudinary

1. Go to: **https://cloudinary.com/console/media_library**
2. You should see folders:
   - `avalanche/guilds/icons/`
   - `avalanche/guilds/banners/`
3. Your uploaded images will be there

## ❌ Troubleshooting

### Error: "Failed to upload icon"
- **Check**: Did you add credentials to `.env`?
- **Check**: Did you restart the backend server?
- **Check**: Are credentials correct? (no extra spaces)

### Images not showing
- **Check**: Browser DevTools → Network tab
- **Check**: Are Cloudinary URLs loading? (should start with `https://res.cloudinary.com`)
- **Check**: Backend terminal for error messages

### Free tier limit reached
- **Free plan**: 25 credits/month, ~10GB storage
- **Upgrade**: https://cloudinary.com/pricing

## 📚 Full Documentation

- **Detailed Guide**: `CLOUDINARY_INTEGRATION.md`
- **Implementation Summary**: `CLOUDINARY_SETUP_COMPLETE.md`
- **Backend README**: `backend/README.md`

## 💡 Tips

- ✅ **Never commit** `.env` file to Git
- ✅ Keep API Secret **private**
- ✅ Free tier is **enough** for development
- ✅ Cloudinary **auto-optimizes** images
- ✅ Global **CDN** = fast loading

## 🎯 What Cloudinary Does

Instead of:
```
❌ Storing files in backend/uploads/guilds/
❌ Serving files from your server
❌ Files lost on deployment
```

Now:
```
✅ Images stored in Cloudinary cloud
✅ Served from global CDN
✅ Persists across deployments
✅ Auto backup & optimization
```

---

**Time to complete**: ~3 minutes  
**Cost**: Free (up to 25 credits/month)  
**Difficulty**: ⭐ Easy

**Need help?** Check the full guide in `CLOUDINARY_INTEGRATION.md`
