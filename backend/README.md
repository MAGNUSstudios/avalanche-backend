# Avalanche Backend API

Backend API for the Avalanche platform built with FastAPI.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Update the `SECRET_KEY`
- Add your Cloudinary credentials (see Cloudinary Setup below)

4. Run the server:
```bash
python main.py
```

Or with uvicorn directly:
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at: http://localhost:8000

## API Endpoints

### Authentication

- `POST /auth/signup` - Create a new user account
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info (requires authentication)

### Health Check

- `GET /` - API health check

## API Documentation

Once the server is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

Currently using SQLite for development. The database file `avalanche.db` will be created automatically.

For production, update `DATABASE_URL` in `.env` to use PostgreSQL:
```
DATABASE_URL=postgresql://user:password@localhost/avalanche
```

## Cloudinary Setup

The platform uses **Cloudinary** for cloud-based image storage. To enable image uploads:

1. **Sign up** for a free account at [https://cloudinary.com](https://cloudinary.com)
2. **Get your credentials** from the [Dashboard](https://cloudinary.com/console):
   - Cloud Name
   - API Key
   - API Secret
3. **Add to `.env`**:
   ```properties
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. **Restart the server**

Without Cloudinary credentials, image uploads will fail. See `CLOUDINARY_INTEGRATION.md` for detailed setup instructions.

### Image Upload Endpoints

- `POST /guilds` - Create guild with icon/banner images
- `PUT /guilds/{guild_id}` - Update guild images (owner only)
- `POST /guilds/{guild_id}/posts` - Create post with image

All images are uploaded to Cloudinary and URLs are stored in the database.
