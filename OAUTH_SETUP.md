# OAuth Setup Guide

This guide explains how to set up Google and GitHub OAuth authentication for your Avalanche application.

## Overview

The application supports OAuth authentication through:
- **Google OAuth 2.0** - For Google account login
- **GitHub OAuth** - For GitHub account login

Both OAuth providers allow users to sign up or log in without creating a separate password.

## Prerequisites

Before setting up OAuth, ensure you have:
- Access to Google Cloud Console (for Google OAuth)
- Access to GitHub Settings (for GitHub OAuth)
- Your application's frontend URL (e.g., `https://yourdomain.com` or `http://localhost:5173` for local development)
- Your application's backend URL (e.g., `https://api.yourdomain.com` or `http://localhost:8000` for local development)

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter project name (e.g., "Avalanche App")
5. Click "Create"

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - Choose "External" (unless you have Google Workspace)
   - Fill in app name: "Avalanche"
   - Add your email as support email
   - Add authorized domains (e.g., `yourdomain.com`)
   - Click "Save and Continue"
   - Add scopes: `userinfo.email`, `userinfo.profile`
   - Click "Save and Continue"
   - Add test users if needed
   - Click "Save and Continue"

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Avalanche Web Client"
   - **Authorized JavaScript origins:**
     - For production: `https://yourdomain.com`
     - For development: `http://localhost:5173`
   - **Authorized redirect URIs:**
     - For production: `https://yourdomain.com/login`, `https://yourdomain.com/signup`
     - For development: `http://localhost:5173/login`, `http://localhost:5173/signup`
   - Click "Create"

5. Copy the **Client ID** (looks like: `123456789-abcdefg.apps.googleusercontent.com`)

### Step 4: Add to Environment Variables

**Frontend (.env in `/avalanche-frontend/`):**
```bash
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

**Backend (.env in `/backend/`):**
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

> **Note:** The Client Secret is optional for frontend-only flows but recommended for added security.

---

## GitHub OAuth Setup

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click **"OAuth Apps"** in the left sidebar
3. Click **"New OAuth App"**

### Step 2: Configure OAuth App

Fill in the following details:

- **Application name:** Avalanche
- **Homepage URL:**
  - For production: `https://yourdomain.com`
  - For development: `http://localhost:5173`
- **Application description:** (Optional) "Avalanche - AI-powered collaboration platform"
- **Authorization callback URL:**
  - For production: `https://yourdomain.com/login` (you can add multiple)
  - For development: `http://localhost:5173/login`

  > **Note:** You need to add both `/login` and `/signup` as separate OAuth apps OR handle both in one callback

- Click **"Register application"**

### Step 3: Generate Client Secret

1. After creating the app, click **"Generate a new client secret"**
2. Copy the **Client ID** and **Client Secret** immediately (secret won't be shown again)

### Step 4: Add Multiple Callback URLs (Optional)

If you want to support both login and signup pages:
1. In your OAuth app settings, under "Authorization callback URL"
2. Add both URLs:
   - `https://yourdomain.com/login`
   - `https://yourdomain.com/signup`

### Step 5: Add to Environment Variables

**Frontend (.env in `/avalanche-frontend/`):**
```bash
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

**Backend (.env in `/backend/`):**
```bash
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

---

## Environment Variable Configuration

### Frontend `.env` File Structure

Create a `.env` file in the `/avalanche-frontend/` directory:

```bash
# API Configuration
VITE_API_URL=http://localhost:8000

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# GitHub OAuth
VITE_GITHUB_CLIENT_ID=Ov23liNQUKq1dVF1H0EO

# Stripe (if needed)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
```

### Backend `.env` File Structure

Update the `.env` file in the `/backend/` directory:

```bash
# Existing configuration...
SECRET_KEY=your-secret-key-change-this-in-production
DATABASE_URL=sqlite:///./avalanche.db
FRONTEND_URL=http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret-here

# GitHub OAuth
GITHUB_CLIENT_ID=Ov23liNQUKq1dVF1H0EO
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Other configurations...
```

---

## Production Deployment Checklist

### Before deploying to production:

#### Google OAuth
- [ ] Update **Authorized JavaScript origins** to include your production domain
- [ ] Update **Authorized redirect URIs** to include your production URLs
- [ ] Move OAuth consent screen from "Testing" to "In Production" status
- [ ] Verify all redirect URIs use HTTPS

#### GitHub OAuth
- [ ] Update **Homepage URL** to production domain
- [ ] Update **Authorization callback URL** to production URLs with HTTPS
- [ ] Ensure Client Secret is securely stored (use environment variables, not hardcoded)

#### Environment Variables
- [ ] Update `FRONTEND_URL` in backend `.env` to production URL
- [ ] Update `VITE_API_URL` in frontend `.env` to production API URL
- [ ] Ensure all OAuth secrets are set in production environment (not in code)
- [ ] Use a secrets manager (AWS Secrets Manager, Google Secret Manager, etc.) for sensitive values

---

## Testing OAuth Locally

### Google OAuth Testing:
1. Ensure `.env` files are configured with Client IDs
2. Start backend: `cd backend && python -m uvicorn main:app --reload`
3. Start frontend: `cd avalanche-frontend && npm run dev`
4. Navigate to `http://localhost:5173/login`
5. Click "Google" button
6. Complete Google OAuth flow
7. Verify redirect to dashboard or plan selection page

### GitHub OAuth Testing:
1. Ensure `.env` files are configured with Client IDs
2. Start both backend and frontend
3. Navigate to `http://localhost:5173/login`
4. Click "GitHub" button
5. Authorize the app on GitHub
6. Verify redirect back to app and successful login

---

## Troubleshooting

### Google OAuth Issues:

**Error: "redirect_uri_mismatch"**
- Ensure the redirect URI in Google Cloud Console exactly matches the one in your app
- Check for trailing slashes (they matter!)
- Verify HTTP vs HTTPS

**Error: "Access blocked: This app's request is invalid"**
- Your OAuth consent screen may not be published
- Go to OAuth consent screen and publish the app

**Error: "idpiframe_initialization_failed"**
- Check browser cookies are enabled
- Verify your domain is in Authorized JavaScript origins

### GitHub OAuth Issues:

**Error: "The redirect_uri MUST match the registered callback URL"**
- Ensure callback URL in GitHub settings matches your app
- Check HTTP vs HTTPS
- Verify the URL includes protocol (http:// or https://)

**Error: "Application suspended"**
- Your OAuth app may have been suspended by GitHub
- Check your GitHub notifications

**Error: "bad_verification_code"**
- Authorization code may have expired (they're single-use)
- Retry the OAuth flow

---

## Security Best Practices

1. **Never commit secrets to version control**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for templates

2. **Use HTTPS in production**
   - All OAuth redirect URIs must use HTTPS in production
   - No mixed content (HTTP resources on HTTPS pages)

3. **Validate OAuth state parameter**
   - The app already implements state verification for GitHub
   - Don't remove or bypass this check

4. **Rotate secrets regularly**
   - Regenerate OAuth secrets every 90 days
   - Update them in your deployment environment

5. **Limit OAuth scopes**
   - Only request necessary permissions
   - Current scopes: email, profile (Google) and user:email (GitHub)

6. **Monitor OAuth usage**
   - Check Google Cloud Console and GitHub for unusual activity
   - Set up billing alerts

---

## OAuth Flow Diagram

### Google OAuth Flow:
```
User clicks "Google" →
  Google popup opens →
    User logs in with Google →
      Google returns ID token →
        Frontend sends token to backend →
          Backend verifies with Google →
            Backend creates/fetches user →
              Backend returns JWT token →
                User redirected to dashboard
```

### GitHub OAuth Flow:
```
User clicks "GitHub" →
  Redirect to github.com/login/oauth/authorize →
    User authorizes app →
      GitHub redirects with code →
        Frontend sends code to backend →
          Backend exchanges code for access token →
            Backend fetches user info from GitHub →
              Backend creates/fetches user →
                Backend returns JWT token →
                  User redirected to dashboard
```

---

## Support

If you encounter issues not covered in this guide:

1. Check backend logs for detailed error messages
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure OAuth credentials are valid and not expired

For production issues, verify:
- All URLs use HTTPS
- Domain is correctly configured in OAuth providers
- Secrets are properly set in production environment
