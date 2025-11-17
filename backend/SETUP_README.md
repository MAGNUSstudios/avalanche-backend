# Avalanche Platform Setup Guide

## Admin Credentials

### Default Admin Account
- **Email:** `admin@avalanche.com`
- **Password:** `admin123`
- **Login URL:** https://avalanche-frontend-indol.vercel.app/admin/login

⚠️ **IMPORTANT:** Change the password after first login!

## Creating Admin User

Run this command to create the admin user:

```bash
cd backend
python create_admin.py
```

## Adding Fake/Sample Data

### Option 1: Comprehensive Seed (Recommended)
This will add 100+ products, 50+ users, projects, orders, and more:

```bash
cd backend
python comprehensive_seed.py
```

### Option 2: Individual Seeders
You can also run individual seed scripts:

```bash
# Add sample products only
python seed_products.py

# Add sample guilds only  
python seed_guilds.py

# Add sample messages only
python seed_messages.py

# Add all basic data
python seed_data.py
```

## What Gets Seeded

The `comprehensive_seed.py` script creates:

- **100+ Marketplace Products** across categories:
  - Electronics (phones, laptops, cameras, etc.)
  - Fashion & Clothing
  - Home & Living
  - Art & Crafts
  - Books & Education
  - Beauty & Health
  
- **50+ Users** with African and international names

- **50 Projects** for collaboration

- **50 Orders** with various payment statuses

- **Guilds** for communities

- **Messages, Posts, Comments** for social features

- **Wallets and Transactions** for payment testing

## Environment Setup

Make sure your `.env` file has these variables set:

```env
# Database
DATABASE_URL=postgresql://postgres:OMGAfCoOVkZNIgNUlmRALumgIFbNgqcA@maglev.proxy.rlwy.net:37434/railway

# JWT
SECRET_KEY=DkclwzETeWbiut8xBNPQv3bgV-SPkM7FwOdJeB-nar4
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# OpenAI (for AI features)
OPENAI_API_KEY=your-key-here

# Qdrant (for semantic search)
QDRANT_URL=your-qdrant-url
QDRANT_API_KEY=your-qdrant-key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn main:app --reload --port 8000
```

## Deployment

The backend is deployed to Render at:
- https://avalanche-backend.onrender.com

The frontend is deployed to Vercel at:
- https://avalanche-frontend-indol.vercel.app

## Testing the Platform

1. **Create Admin:**
   ```bash
   python create_admin.py
   ```

2. **Seed Database:**
   ```bash
   python comprehensive_seed.py
   ```

3. **Login as Admin:**
   - Visit: https://avalanche-frontend-indol.vercel.app/admin/login
   - Email: `admin@avalanche.com`
   - Password: `admin123`

4. **Browse Marketplace:**
   - Visit: https://avalanche-frontend-indol.vercel.app/marketplace
   - You should see 100+ products

5. **Test User Signup:**
   - Visit: https://avalanche-frontend-indol.vercel.app/signup
   - Create a new account

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct in `.env`
- Make sure Railway database is accessible

### Admin Login Not Working
- Run `python create_admin.py` again
- Check backend logs for errors

### No Products Showing
- Run `python comprehensive_seed.py`
- Check browser console for API errors
- Verify backend is running

### Password Visibility in Light Mode
- This has been fixed! Update your frontend code and redeploy

## Support

For issues, contact the development team or check the GitHub repository.
