# Avalanche Backend API Documentation

## Overview
Complete REST API documentation for the Avalanche platform built with FastAPI, SQLAlchemy, and JWT authentication.

**Base URL:** `http://localhost:8000`
**Interactive Docs:** `http://localhost:8000/docs`
**ReDoc:** `http://localhost:8000/redoc`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_token_here>
```

## Quick Navigation
- [Authentication](#authentication-endpoints) - Signup, login, user management
- [Admin Dashboard](#admin-endpoints) - Admin analytics, user management, settings (NEW ✨)
- [Marketplace](#marketplace-endpoints) - Product search, categories, seller management (NEW ✨)
- [Chat & Messaging](#chat-endpoints) - Conversations, message sending, read tracking (NEW ✨)
- [AI Assistant](#ai-assistant-endpoints) - AI chat, recommendations, insights (NEW ✨)
- [Notifications](#notification-endpoints) - User notifications, preferences, activity feed (NEW ✨)
- [Guilds](#guild-endpoints) - Community management
- [Projects](#project-endpoints) - Project collaboration
- [Payments & Escrow](#payment-escrow-endpoints) - Secure payments

---

## Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "country": "Kenya",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": null,
    "first_name": "John",
    "last_name": "Doe",
    "country": "Kenya",
    "avatar_url": null,
    "bio": null,
    "is_active": true,
    "created_at": "2025-11-10T12:00:00"
  }
}
```

### POST /auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": { ... }
}
```

### GET /auth/me
Get current user information (requires authentication).

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "country": "Kenya",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Software developer",
  "is_active": true,
  "created_at": "2025-11-10T12:00:00"
}
```

### PUT /users/me
Update current user profile (requires authentication).

**Request Body:**
```json
{
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "bio": "Full-stack developer"
}
```

**Response:** `200 OK`

---

## Guild Endpoints

### POST /guilds
Create a new guild (requires authentication).

**Request Body:**
```json
{
  "name": "Design Innovators",
  "description": "A guild for designers and creatives",
  "category": "Design",
  "is_private": false
}
```

**Response:** `201 Created`

### GET /guilds
Get list of public guilds.

**Query Parameters:**
- `skip`: int (default: 0) - Number of guilds to skip
- `limit`: int (default: 20) - Max guilds to return
- `search`: string (optional) - Search in name and description
- `category`: string (optional) - Filter by category

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Design Innovators",
    "description": "A guild for designers",
    "category": "Design",
    "avatar_url": null,
    "banner_url": null,
    "is_private": false,
    "member_count": 5,
    "owner_id": 1,
    "created_at": "2025-11-10T12:00:00"
  }
]
```

### GET /guilds/{guild_id}
Get guild by ID.

**Response:** `200 OK`

### PUT /guilds/{guild_id}
Update guild (owner only, requires authentication).

**Request Body:**
```json
{
  "name": "Updated Guild Name",
  "description": "Updated description"
}
```

### POST /guilds/{guild_id}/join
Join a guild (requires authentication).

**Response:** `200 OK`
```json
{
  "message": "Successfully joined guild"
}
```

### GET /guilds/my/memberships
Get guilds user is a member of (requires authentication).

**Response:** `200 OK`

---

## Project Endpoints

### POST /projects
Create a new project (requires authentication).

**Request Body:**
```json
{
  "title": "EcoMarket Platform",
  "description": "Build a marketplace for eco-friendly products",
  "budget": 50000,
  "deadline": "2025-12-31T23:59:59",
  "guild_id": 1
}
```

**Response:** `201 Created`

### GET /projects
Get list of projects.

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 20)
- `status`: string (optional) - Filter by status (active, completed, archived)
- `guild_id`: int (optional) - Filter by guild

**Response:** `200 OK`

### GET /projects/{project_id}
Get project by ID.

**Response:** `200 OK`

### GET /projects/my/all
Get user's projects (requires authentication).

**Response:** `200 OK`

---

## Product Endpoints

### POST /products
Create a new product listing (requires authentication).

**Request Body:**
```json
{
  "name": "Organic Rice 5kg",
  "description": "Premium organic rice from local farmers",
  "price": 2500,
  "category": "Food",
  "stock": 100,
  "image_url": "https://example.com/rice.jpg"
}
```

**Response:** `201 Created`

### GET /products
Get list of products.

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 20)
- `search`: string (optional) - Search in name and description
- `category`: string (optional) - Filter by category
- `min_price`: float (optional) - Minimum price
- `max_price`: float (optional) - Maximum price

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Organic Rice 5kg",
    "description": "Premium organic rice",
    "price": 2500,
    "category": "Food",
    "image_url": "https://example.com/rice.jpg",
    "stock": 100,
    "seller_id": 1,
    "is_active": true,
    "created_at": "2025-11-10T12:00:00"
  }
]
```

### GET /products/{product_id}
Get product by ID.

**Response:** `200 OK`

---

## Message Endpoints

### POST /messages
Send a message (requires authentication).

**Request Body:**
```json
{
  "content": "Hey! Let's collaborate on this project.",
  "recipient_id": 2
}
```

**Response:** `201 Created`

### GET /messages
Get messages (requires authentication).

**Query Parameters:**
- `user_id`: int (optional) - Get conversation with specific user

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "content": "Hey! Let's collaborate on this project.",
    "sender_id": 1,
    "recipient_id": 2,
    "is_read": false,
    "created_at": "2025-11-10T12:00:00"
  }
]
```

---

## Database Models

### User
- `id`: Integer (Primary Key)
- `email`: String (Unique)
- `username`: String (Unique, Optional)
- `first_name`: String
- `last_name`: String
- `country`: String
- `hashed_password`: String
- `avatar_url`: String (Optional)
- `bio`: Text (Optional)
- `is_active`: Boolean
- `created_at`: DateTime

### Guild
- `id`: Integer (Primary Key)
- `name`: String
- `description`: Text
- `category`: String
- `avatar_url`: String
- `banner_url`: String
- `is_private`: Boolean
- `member_count`: Integer
- `owner_id`: Foreign Key → User
- `created_at`: DateTime

### Project
- `id`: Integer (Primary Key)
- `title`: String
- `description`: Text
- `status`: String (active, completed, archived)
- `budget`: Float
- `deadline`: DateTime
- `owner_id`: Foreign Key → User
- `guild_id`: Foreign Key → Guild
- `created_at`: DateTime
- `updated_at`: DateTime

### Task
- `id`: Integer (Primary Key)
- `title`: String
- `description`: Text
- `status`: String (pending, in_progress, completed)
- `priority`: String (low, medium, high)
- `assignee_id`: Foreign Key → User
- `project_id`: Foreign Key → Project
- `created_at`: DateTime
- `updated_at`: DateTime

### Product
- `id`: Integer (Primary Key)
- `name`: String
- `description`: Text
- `price`: Float
- `category`: String
- `image_url`: String
- `stock`: Integer
- `seller_id`: Foreign Key → User
- `is_active`: Boolean
- `created_at`: DateTime

### Message
- `id`: Integer (Primary Key)
- `content`: Text
- `sender_id`: Foreign Key → User
- `recipient_id`: Foreign Key → User
- `is_read`: Boolean
- `created_at`: DateTime

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to update this guild"
}
```

### 404 Not Found
```json
{
  "detail": "Guild not found"
}
```

---

## Running the Backend

1. **Install dependencies:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment:**
Create a `.env` file with:
```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./avalanche.db
FRONTEND_URL=http://localhost:5173
```

3. **Start the server:**
```bash
python main.py
```

The API will be available at `http://localhost:8000`

4. **View API documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Testing with cURL

### Sign up:
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "country": "Kenya",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get guilds:
```bash
curl http://localhost:8000/guilds
```

### Create guild (authenticated):
```bash
curl -X POST http://localhost:8000/guilds \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "My Guild",
    "description": "A test guild",
    "category": "Technology"
  }'
```

---

## Admin Endpoints

**All admin endpoints require admin privileges (admin authorization middleware)**

### GET /admin/stats/overview
Dashboard overview statistics.

**Response:**
```json
{
  "total_transactions": 1247,
  "total_revenue": 45680.50,
  "total_guilds": 89,
  "active_users": 3421,
  "ai_queries_today": 567,
  "growth_rate": 12.5
}
```

### GET /admin/transactions/stats
Transaction analytics and metrics.

### GET /admin/transactions/recent
Recent transaction list (limit parameter).

### GET /admin/guilds/stats
Guild statistics and analytics.

### GET /admin/users/list
Paginated user list with search/filter (`skip`, `limit`, `search`, `is_active`).

### PATCH /admin/users/{user_id}/toggle-status
Toggle user active/inactive status.

### DELETE /admin/users/{user_id}
Delete user account.

### GET /admin/settings/platform
Get platform settings.

### PUT /admin/settings/platform
Update platform settings.

### GET /admin/ai/stats
AI system statistics.

---

## Marketplace Endpoints

### GET /marketplace/featured
Featured products for homepage (`limit` parameter).

**Response:**
```json
[
  {
    "id": 1,
    "name": "African Art Print",
    "price": 49.99,
    "category": "Art & Crafts",
    "seller": {
      "id": 5,
      "name": "Jane Seller"
    }
  }
]
```

### GET /marketplace/search
Advanced product search with filters:
- `q`: Search query
- `category`: Category filter
- `min_price`, `max_price`: Price range
- `sort_by`: recent, price_low, price_high, popular
- `skip`, `limit`: Pagination

### GET /marketplace/categories
List all product categories with counts.

### GET /marketplace/products/{id}/related
Related products by category.

### GET /marketplace/seller/{id}/products
All products from specific seller.

### GET /marketplace/my/listings
Current user's product listings (authenticated).

### GET /marketplace/stats
Marketplace statistics (products, sellers, orders, avg price).

---

## Chat Endpoints

### GET /messages/conversations
List all conversations with unread counts and last message.

**Response:**
```json
[
  {
    "user": {
      "id": 2,
      "name": "Jane Doe"
    },
    "last_message": {
      "content": "Thanks!",
      "created_at": "2024-01-15T15:30:00",
      "is_read": false
    },
    "unread_count": 2
  }
]
```

### GET /messages/conversation/{user_id}
Get messages with specific user (auto-marks as read).

### POST /messages/send
Send message (`recipient_id`, `content`).

### GET /messages/unread-count
Total unread message count.

### DELETE /messages/{message_id}
Delete message (sender only).

### POST /messages/mark-read/{message_id}
Mark single message as read.

### POST /messages/mark-all-read/{user_id}
Mark entire conversation as read.

---

## AI Assistant Endpoints

### POST /ai/chat
Chat with AI assistant.

**Request:**
```json
{
  "message": "Help me find products"
}
```

**Response:**
```json
{
  "user_message": "Help me find products",
  "ai_response": "I can help you find products!...",
  "timestamp": "2024-01-15T16:00:00"
}
```

### GET /ai/suggestions/products
AI product recommendations (`limit` parameter).

### GET /ai/suggestions/guilds
AI guild recommendations.

### GET /ai/suggestions/collaborators
AI collaborator suggestions (`project_id`, `limit` parameters).

### GET /ai/insights/marketplace
Marketplace insights for sellers.

### GET /ai/insights/guild/{guild_id}
Guild analytics for leaders.

### POST /ai/analyze/content
Content moderation and sentiment analysis.

---

## Notification Endpoints

### GET /notifications/list
User notifications (`limit`, `offset`, `unread_only` parameters).

### GET /notifications/unread-count
Unread notification count.

### POST /notifications/{notification_id}/read
Mark notification as read.

### POST /notifications/mark-all-read
Mark all notifications as read.

### DELETE /notifications/{notification_id}
Delete notification.

### GET /notifications/settings
User notification preferences.

### PUT /notifications/settings
Update notification preferences.

### GET /notifications/recent-activity
Recent activity feed (`limit` parameter).

---

## Next Steps

### Recently Implemented ✅:
1. ✅ **Admin Dashboard** - Complete analytics and user management
2. ✅ **Marketplace API** - Advanced search and filters
3. ✅ **Chat System** - Real-time messaging with read tracking
4. ✅ **AI Assistant** - Recommendations and insights
5. ✅ **Notifications** - User notifications and preferences

### Planned Features:
1. **WebSocket Support** - Real-time chat and notifications
2. **File Upload** - Product images and avatars
3. **Email Service** - Notification emails
4. **Vector Search** - Qdrant integration for semantic search
5. **Payment Webhooks** - Automated payment processing

---

## Development

Start the API server:
```bash
cd backend
python main.py
```

Access:
- API: `http://localhost:8000`
- Interactive Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Support

For issues or questions:
- Email: support@avalanche.com
- Documentation: Full API docs at `/docs` endpoint
