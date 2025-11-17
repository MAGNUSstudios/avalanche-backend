# Cloudinary Integration Guide

## Overview
The Avalanche platform now uses **Cloudinary** for cloud-based image storage, replacing local file storage. This keeps the database lightweight and provides scalable, reliable image hosting.

## What Changed

### Before (Local Storage)
- Images stored in `backend/uploads/guilds/` directory
- Files served via FastAPI `StaticFiles` mount
- Database stored relative paths like `/uploads/guilds/guild_icon_11_1762902687065.jpeg`
- Not production-ready (files would be lost on server restart/deployment)

### After (Cloudinary)
- Images uploaded directly to Cloudinary cloud storage
- Database stores full HTTPS URLs like `https://res.cloudinary.com/your-cloud/image/upload/v123/avalanche/guilds/icons/guild_icon_11_1762902687065.jpg`
- Frontend displays images from Cloudinary CDN
- Production-ready and scalable

## Setup Instructions

### 1. Create a Cloudinary Account
1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Navigate to your [Dashboard](https://cloudinary.com/console)
4. Copy your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configure Environment Variables
Edit `backend/.env` and add your Cloudinary credentials:

```properties
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

**⚠️ Important:** Never commit `.env` to version control. Use `.env.example` as a template.

### 3. Install Cloudinary Package
The package is already listed in `requirements.txt`:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Restart Backend Server
After adding credentials, restart your backend server:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

## Image Upload Endpoints

### 1. Create Guild with Images
**Endpoint:** `POST /guilds`

**Request:** `multipart/form-data`
- `name` (string, required)
- `description` (string, optional)
- `category` (string, optional)
- `is_private` (boolean, default: false)
- `icon` (file, optional) - Guild icon/avatar
- `banner` (file, optional) - Guild banner image

**Cloudinary Folders:**
- Icons: `avalanche/guilds/icons/`
- Banners: `avalanche/guilds/banners/`

**Response:**
```json
{
  "id": 1,
  "name": "Python Developers",
  "avatar_url": "https://res.cloudinary.com/your-cloud/image/upload/v123/avalanche/guilds/icons/guild_icon_11_1762902687065.jpg",
  "banner_url": "https://res.cloudinary.com/your-cloud/image/upload/v123/avalanche/guilds/banners/guild_banner_11_1762902687065.jpg",
  ...
}
```

### 2. Update Guild Images
**Endpoint:** `PUT /guilds/{guild_id}`

**Authorization:** Owner only

**Request:** `multipart/form-data`
- `name` (string, optional)
- `description` (string, optional)
- `category` (string, optional)
- `icon` (file, optional)
- `banner` (file, optional)

### 3. Create Post with Image
**Endpoint:** `POST /guilds/{guild_id}/posts`

**Request:** `multipart/form-data`
- `content` (string, required)
- `title` (string, optional)
- `post_type` (string, default: "post")
- `image` (file, optional)

**Cloudinary Folder:**
- Post images: `avalanche/guilds/posts/`

## Frontend Implementation

### Image URL Helper Function
The frontend automatically detects whether an image URL is from Cloudinary or local storage:

```typescript
const getImageUrl = (url: string | null | undefined) => {
  if (!url) return undefined;
  // If URL starts with http/https, it's already a full URL (Cloudinary)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Otherwise, it's a local path, prepend API_BASE_URL
  return `${API_BASE_URL}${url}`;
};
```

This ensures **backward compatibility** with any existing local images in the database.

## Benefits

✅ **Scalability** - Cloudinary CDN handles unlimited images  
✅ **Performance** - Images served from global CDN with automatic optimization  
✅ **Database Size** - Only stores URLs, not file paths  
✅ **Reliability** - Images persist across deployments  
✅ **Features** - Automatic image transformations, resizing, format conversion  
✅ **Backup** - Cloudinary handles backups and redundancy  

## Cloudinary Features You Can Use

### Image Transformations
Cloudinary URLs support on-the-fly transformations:

```typescript
// Original image
https://res.cloudinary.com/your-cloud/image/upload/v123/avalanche/guilds/icons/guild_icon_11.jpg

// Resize to 200x200
https://res.cloudinary.com/your-cloud/image/upload/w_200,h_200,c_fill/v123/avalanche/guilds/icons/guild_icon_11.jpg

// Convert to WebP for better compression
https://res.cloudinary.com/your-cloud/image/upload/f_webp/v123/avalanche/guilds/icons/guild_icon_11.jpg
```

### Auto Format & Quality
Add to URLs for automatic optimization:
```
/f_auto,q_auto/
```

## Migration from Local Storage

If you have existing images in `backend/uploads/guilds/`:

1. **Option 1:** Leave them as-is (frontend handles both)
2. **Option 2:** Migrate to Cloudinary using their [Upload API](https://cloudinary.com/documentation/upload_images)

## Troubleshooting

### Error: "Failed to upload icon/banner"
- **Check** your `.env` file has correct Cloudinary credentials
- **Verify** credentials on [Cloudinary Dashboard](https://cloudinary.com/console)
- **Check** terminal for detailed error messages

### Images not displaying
- **Check** Network tab in browser DevTools
- **Verify** Cloudinary URLs are accessible (paste in browser)
- **Check** CORS settings in Cloudinary Dashboard (should allow all origins by default)

### Upload limits exceeded
- Free tier: 25 credits/month, ~10GB storage
- [Upgrade plan](https://cloudinary.com/pricing) if needed

## API Reference

- [Cloudinary Python SDK Docs](https://cloudinary.com/documentation/python_integration)
- [Upload API Reference](https://cloudinary.com/documentation/image_upload_api_reference)
- [Transformation Reference](https://cloudinary.com/documentation/image_transformation_reference)

## Security Notes

🔒 **Never expose API Secret in frontend**  
🔒 Keep `.env` out of version control (listed in `.gitignore`)  
🔒 Use environment variables in production (Heroku Config Vars, etc.)  
🔒 Consider using [signed uploads](https://cloudinary.com/documentation/upload_images#signed_uploads) for production

---

**Last Updated:** January 2025  
**Version:** 1.0.0
