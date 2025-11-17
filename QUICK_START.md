# Avalanche Payment & Escrow - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

---

## Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Check .env file exists
```bash
cat .env
```

Should contain:
```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./avalanche.db
FRONTEND_URL=http://localhost:5173
```

### 5. Start the backend
```bash
python main.py
```

✅ **Backend running at:** http://localhost:8000
✅ **API docs at:** http://localhost:8000/docs

---

## Frontend Setup

### 1. Navigate to frontend directory
```bash
cd avalanche-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Check .env file
```bash
cat .env
```

Should contain at minimum:
```env
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Start the frontend
```bash
npm run dev
```

✅ **Frontend running at:** http://localhost:5173

---

## Test the Integration

### 1. Create an account
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill in details:
   - Email: test@example.com
   - First Name: Test
   - Last Name: User
   - Country: Kenya
   - Password: password123
4. Click "Create Account"

### 2. View Guilds (Already Integrated!)
1. Click on "Guilds" in navigation
2. See guilds loaded from backend API
3. Try searching and filtering

### 3. Test Payment Flow (Example using API directly)

Open browser console and run:

```javascript
// Store the token from signup/login
const token = localStorage.getItem('avalanche_token');

// Create an order
const orderResponse = await fetch('http://localhost:8000/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    seller_id: 1,  // Replace with actual seller ID
    item_name: "Test Product",
    item_description: "Testing payment flow",
    item_cost: 100.00,
    payment_method: "card"
  })
});

const order = await orderResponse.json();
console.log('Order created:', order);

// Initialize payment
const paymentResponse = await fetch('http://localhost:8000/payments/initialize', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    order_id: order.id,
    payment_method: "card",
    payment_provider: "paystack"
  })
});

const payment = await paymentResponse.json();
console.log('Payment initialized:', payment);

// Verify payment (simulated - in production this happens after Paystack redirect)
const verifyResponse = await fetch('http://localhost:8000/payments/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    provider_reference: payment.provider_reference,
    payment_provider: "paystack"
  })
});

const verified = await verifyResponse.json();
console.log('Payment verified:', verified);

// Check escrow was created
const escrowResponse = await fetch('http://localhost:8000/escrow', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const escrows = await escrowResponse.json();
console.log('Escrow accounts:', escrows);
```

---

## API Endpoints Available

### Authentication
- POST /auth/signup - Create account
- POST /auth/login - Login
- GET /auth/me - Get current user

### Guilds (✅ Connected to Frontend)
- GET /guilds - List guilds
- POST /guilds - Create guild
- GET /guilds/{id} - Get guild details
- POST /guilds/{id}/join - Join guild

### Products
- GET /products - List products
- POST /products - Create product
- GET /products/{id} - Get product details

### Projects
- GET /projects - List projects
- POST /projects - Create project
- GET /projects/{id} - Get project details

### Orders (✨ NEW)
- POST /orders - Create order
- GET /orders - Get my orders
- GET /orders/{id} - Get order details
- PUT /orders/{id} - Update order status

### Escrow (✨ NEW)
- POST /escrow - Create escrow
- GET /escrow - Get my escrow accounts
- GET /escrow/{id} - Get escrow details
- POST /escrow/{id}/action - Perform action (approve, release, refund, dispute)

### Payments (✨ NEW)
- POST /payments/initialize - Start payment
- POST /payments/verify - Verify payment
- GET /payments - Get my payments

---

## Using the API Client in Frontend

### Import the API
```typescript
import API from './services/api';
```

### Create an Order
```typescript
try {
  const order = await API.orders.create({
    product_id: 1,
    seller_id: 2,
    item_name: "Organic Rice 5kg",
    item_cost: 500.00,
    payment_method: "card"
  });

  console.log('Order created:', order);
} catch (error) {
  console.error('Failed to create order:', error);
}
```

### Initialize Payment
```typescript
const payment = await API.payments.initialize({
  order_id: order.id,
  payment_method: "card",
  payment_provider: "paystack"
});

// Redirect user to Paystack payment page
// window.location.href = payment.authorization_url;
```

### Manage Escrow
```typescript
// Approve order
await API.escrow.approve(escrowId);

// Confirm delivery
await API.escrow.confirmDelivery(escrowId);

// Release funds
await API.escrow.release(escrowId);

// Dispute
await API.escrow.dispute(escrowId, "Item not as described");
```

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (should be 3.8+)
- Check all dependencies installed: `pip list`
- Check .env file exists and is valid

### Frontend won't connect to backend
- Verify backend is running: http://localhost:8000
- Check browser console for CORS errors
- Verify VITE_API_BASE_URL in .env is correct

### Authentication issues
- Check token is stored: `localStorage.getItem('avalanche_token')`
- Try logging in again
- Check token hasn't expired (default 30 minutes)

### Database errors
- Delete avalanche.db and restart backend (will recreate tables)
- Check SQLAlchemy is installed: `pip list | grep -i sqlalchemy`

---

## Next Steps

1. **Integrate Marketplace Page**
   - Replace static data with `API.products.getAll()`
   - See `GuildsPage.tsx` for reference implementation

2. **Integrate Projects Page**
   - Replace static data with `API.projects.getAll()`
   - Connect "Apply Now" to create order

3. **Integrate Checkout Pages**
   - Connect payment flow to real APIs
   - Add Paystack/Flutterwave redirect logic

4. **Add Payment Providers**
   - Sign up for Paystack: https://paystack.com
   - Sign up for Flutterwave: https://flutterwave.com
   - Add API keys to .env

---

## Documentation

- **Integration Summary**: `INTEGRATION_SUMMARY.md`
- **Main API Docs**: `backend/API_DOCUMENTATION.md`
- **Payment/Escrow Docs**: `backend/PAYMENT_ESCROW_API.md`
- **Swagger UI**: http://localhost:8000/docs (when running)

---

## Questions?

Check the documentation files or the API docs at http://localhost:8000/docs for detailed information about all endpoints.

Happy building! 🚀
