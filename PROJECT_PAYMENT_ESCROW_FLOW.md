# Project Payment & Escrow Activation Flow

## Overview
Projects now require escrow payment before they become active and visible on the platform. This ensures only serious, paid projects are listed.

## Flow Diagram

```
User Creates Project → Project Status: "pending_payment" (Hidden)
         ↓
User Makes Escrow Payment via Stripe/Payment Provider
         ↓
Payment Webhook/Verification Endpoint Called
         ↓
Project Status: "active" (Now Visible to All Users)
         ↓
Project Appears in Listings, Search, and AI Assistant Results
```

## Technical Implementation

### 1. Project Creation (POST /projects)

**Status:** `pending_payment`

When a user creates a project, it's saved to the database but marked as `pending_payment`:

```python
new_project = Project(
    title=project_data.title,
    description=project_data.description,
    budget=project_data.budget,
    deadline=deadline,
    guild_id=project_data.guild_id,
    owner_id=current_user.id,
    creator_id=current_user.id,
    status="pending_payment"  # Hidden from public view
)
```

### 2. Order Creation (POST /orders)

Create an order for the project:

```python
new_order = Order(
    order_number="ORD-XXXXXXXXXX",
    buyer_id=current_user.id,
    project_id=project.id,  # Link to the project
    item_name=project.title,
    item_cost=project.budget,
    service_fee=calculate_service_fee(project.budget),
    total_amount=project.budget + service_fee,
    status="pending"
)
```

### 3. Payment Initialization (POST /payments/initialize)

Initialize payment with Stripe:

```python
# Creates Stripe Checkout Session
# Redirects user to Stripe payment page
# Includes metadata: order_id, project_id, payment_id
```

### 4. Payment Completion (Two Methods)

#### Method A: Stripe Webhook (Automatic - Production)

**Endpoint:** `POST /payments/webhook/stripe`

Stripe calls this endpoint when payment is successful:

```python
if event_type == "checkout.session.completed":
    # 1. Update payment status to "success"
    payment.status = "success"

    # 2. Update order status to "paid"
    order.status = "paid"

    # 3. Activate the project
    if order.project_id:
        project.status = "active"  # ✅ Now visible!

    # 4. Create escrow
    escrow = Escrow(
        order_id=order.id,
        amount=order.total_amount,
        status="held"
    )
```

#### Method B: Manual Verification (Development/Testing)

**Endpoint:** `POST /payments/verify`

User manually verifies payment (for testing):

```python
# Same activation logic as webhook
payment.status = "success"
order.status = "paid"
if order.project_id:
    project.status = "active"
```

### 5. Project Visibility

**GET /projects** - Only returns active projects:

```python
query = db.query(Project).filter(
    Project.status == "active"  # Excludes pending_payment projects
)
```

**Ava AI Assistant** - Only shows active projects:

```python
projects = db.query(Project).filter(
    Project.status == "active"
).all()
```

## Project Status States

| Status | Description | Visible to Users? | Can Be Interacted With? |
|--------|-------------|-------------------|------------------------|
| `pending_payment` | Created but not paid | ❌ No | ❌ No |
| `active` | Payment completed, escrow held | ✅ Yes | ✅ Yes |
| `in_progress` | Work has started | ✅ Yes | ✅ Yes |
| `completed` | Work finished, payment released | ✅ Yes | 🔒 Read-only |
| `refunded` | Payment refunded | ✅ Yes | 🔒 Read-only |

## API Endpoints

### Create Project
```http
POST /projects
Authorization: Bearer <token>

{
  "title": "Build E-commerce Site",
  "description": "Need a modern e-commerce platform",
  "budget": 500000,
  "deadline": "2024-12-31",
  "guild_id": 1
}

Response: Project with status="pending_payment"
```

### Create Order for Project
```http
POST /orders
Authorization: Bearer <token>

{
  "project_id": 123,
  "seller_id": 456,
  "item_name": "Build E-commerce Site",
  "item_cost": 500000
}
```

### Initialize Payment
```http
POST /payments/initialize
Authorization: Bearer <token>

{
  "order_id": 789,
  "payment_method": "card",
  "payment_provider": "stripe"
}

Response: { "checkout_url": "https://checkout.stripe.com/..." }
```

### Verify Payment (Testing)
```http
POST /payments/verify
Authorization: Bearer <token>

{
  "provider_reference": "STRIPE-ORD-XXX-YYY"
}

Response: Payment status updated, project activated
```

### Get Active Projects
```http
GET /projects

Response: [ { id: 1, status: "active", ... } ]
```

## Frontend Integration

### 1. Create Project Page

```typescript
// Step 1: Create project (status: pending_payment)
const project = await API.projects.create({
  title: "My Project",
  budget: 100000
});

// Step 2: Redirect to payment page
navigate(`/projects/payment?projectId=${project.id}`);
```

### 2. Payment Page

```typescript
// Create order for the project
const order = await API.orders.create({
  project_id: projectId,
  seller_id: platformId, // Platform ID for escrow
  item_cost: project.budget
});

// Initialize Stripe payment
const payment = await API.payments.initialize({
  order_id: order.id,
  payment_method: "card",
  payment_provider: "stripe"
});

// Redirect to Stripe checkout
window.location.href = payment.checkout_url;
```

### 3. Payment Success Page

```typescript
// Stripe redirects here after successful payment
// Project is automatically activated via webhook

// Verify payment (optional, for manual verification)
await API.payments.verify({
  provider_reference: reference
});

// Redirect to project page
navigate(`/projects/${projectId}`);
```

## Testing the Flow

### 1. Create a Test Project

```bash
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "Testing escrow flow",
    "budget": 100.00
  }'
```

### 2. Verify Project is Pending

```bash
curl http://localhost:8000/projects
# Should return [] (empty - project not visible yet)
```

### 3. Create Order & Pay

```bash
# Create order
curl -X POST http://localhost:8000/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"project_id": 1, "item_cost": 100.00}'

# Initialize payment
curl -X POST http://localhost:8000/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"order_id": 1, "payment_provider": "stripe"}'
```

### 4. Simulate Payment Completion

```bash
# Manual verification (for testing without Stripe)
curl -X POST http://localhost:8000/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"provider_reference": "STRIPE-ORD-XXX"}'
```

### 5. Verify Project is Now Active

```bash
curl http://localhost:8000/projects
# Should return the project with status="active"
```

## Database Schema

### Projects Table
```sql
CREATE TABLE projects (
    id INTEGER PRIMARY KEY,
    title VARCHAR,
    description TEXT,
    budget DECIMAL,
    status VARCHAR DEFAULT 'pending_payment',  -- Key field
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    order_number VARCHAR UNIQUE,
    project_id INTEGER REFERENCES projects(id),  -- Links to project
    buyer_id INTEGER REFERENCES users(id),
    status VARCHAR DEFAULT 'pending',
    total_amount DECIMAL
);
```

### Escrow Table
```sql
CREATE TABLE escrow (
    id INTEGER PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    amount DECIMAL,
    status VARCHAR DEFAULT 'held',
    auto_release_days INTEGER DEFAULT 7
);
```

## Benefits

✅ **No Spam Projects** - Only paid projects enter the system
✅ **Serious Buyers Only** - Payment required upfront ensures commitment
✅ **Automatic Activation** - Webhook handles everything automatically
✅ **Escrow Protection** - Funds held safely until work is delivered
✅ **Clean Database** - No clutter from unpaid test projects
✅ **AI Assistant Accuracy** - Ava only shows real, paid projects

## Logging

Payment completion and project activation are logged:

```
INFO:payment_escrow:✅ Project 123 'Build E-commerce Site' activated via Stripe webhook
INFO:payment_escrow:✅ Payment 456 completed via Stripe webhook for order 789
```

## Error Handling

- Project not found → 404 error
- Payment already processed → Returns success (idempotent)
- Webhook signature invalid → 401 error (in production)
- Database error → 500 error, payment can be retried

## Security Considerations

1. **Webhook Verification**: In production, verify Stripe webhook signatures
2. **Authentication**: All endpoints require user authentication
3. **Authorization**: Only project owner can create orders
4. **Idempotency**: Webhooks can be called multiple times safely
5. **Audit Trail**: All status changes are logged

---

**Last Updated:** 2024-01-13
**Version:** 1.0
**Status:** Production Ready
