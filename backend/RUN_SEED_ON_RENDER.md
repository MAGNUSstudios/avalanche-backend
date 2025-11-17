# Running the Seed Script on Render

The comprehensive seed script needs to be run on the Render backend environment where the Railway database is configured.

## Option 1: Using Render Shell (Recommended)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your `avalanche-backend` service
3. Click on the "Shell" tab in the left sidebar
4. Run the following commands:

```bash
cd /opt/render/project/src
python3 comprehensive_seed.py
```

This will populate your production database with:
- 100+ marketplace products
- 50+ users
- 50 projects
- 50 orders
- Multiple guilds
- Posts, comments, messages
- And more!

## Option 2: Using Render API

You can also trigger the script via Render's manual deploy with a shell command:

1. Add a manual job in your Render dashboard
2. Set the command to: `python3 comprehensive_seed.py`
3. Run the job

## Option 3: Add as a One-Time Job

1. In your Render dashboard, create a new "Background Worker"
2. Use the same repository: `covenantchukwudi/stitch_payment_escrow_page`
3. Set the start command: `python3 backend/comprehensive_seed.py`
4. Use the same environment variables as your web service
5. This will run once and then you can delete the worker

## Option 4: Run Locally with Railway Credentials

If you want to run it locally, update your `backend/.env` file with the Railway database URL from Render:

```bash
# Get the DATABASE_URL from your Render environment variables
# It should look like: postgresql://postgres:password@host:5432/railway
DATABASE_URL=your-railway-database-url-from-render
```

Then run:
```bash
cd backend
python3 comprehensive_seed.py
```

## What Will Be Created

The seed script will create:

### Marketplace
- 100+ diverse product listings across categories:
  - 3D Models & Assets
  - Textures & Materials
  - Game Assets
  - Audio & Music
  - Development Tools
  - Art & Illustrations
- Realistic pricing ($5 - $500)
- Detailed descriptions
- Multiple images per product

### Users
- 50+ users with realistic profiles
- Various AI tiers (Basic, Standard, Premium, Advanced)
- Avatar URLs
- Unique usernames and emails

### Projects
- 50 collaborative projects
- Various categories (Game Dev, Animation, VFX, etc.)
- Different statuses (Active, Completed, In Progress)
- Budget ranges ($100 - $50,000)

### Orders & Transactions
- 50 order records
- Various payment statuses
- Escrow transactions
- Realistic pricing and timestamps

### Community Features
- Multiple guilds
- Posts and comments
- Messages between users
- Follows and connections

## Verification

After running the seed script, verify the data by:

1. Login to admin dashboard: https://avalanche-frontend-indol.vercel.app/admin/login
   - Email: admin@avalanche.com
   - Password: admin123

2. Check the following sections:
   - Users: Should see 50+ users
   - Transactions: Should see 50+ orders
   - Marketplace: Should see 100+ products
   - Projects: Should see 50+ projects
   - Guilds: Should see multiple guilds

3. Visit the marketplace: https://avalanche-frontend-indol.vercel.app/marketplace
   - Should see 100+ product listings
   - Try filtering by category
   - View product details

## Important Notes

- The script is idempotent - it won't create duplicates if you run it multiple times
- It will skip creating data that already exists (checks for existing usernames/emails)
- The script includes progress indicators so you can see what's being created
- It takes about 2-3 minutes to complete
- All passwords are hashed using bcrypt for security

## Troubleshooting

If you encounter errors:

1. **Database connection error**: Make sure the DATABASE_URL is correctly set in your Render environment variables
2. **Permission denied**: Make sure the database user has write permissions
3. **Timeout**: The Render shell has a timeout. If the script times out, try Option 3 (Background Worker)

## After Seeding

Once the data is populated, you can:
- Browse the marketplace with real-looking products
- Test the admin dashboard with populated data
- View user profiles
- Test transactions and escrow flow
- Explore guilds and projects
- Test search and filtering functionality

The seed data is designed to look realistic and demonstrate all features of the platform!
