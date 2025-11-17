# Payment & Escrow API Documentation

## Overview
This document covers the Payment and Escrow endpoints for the Avalanche platform, which handle secure transactions between buyers and sellers.

**Base URL:** `http://localhost:8000`

---

## Order Management Endpoints

### POST /orders
Create a new order for a product or project.

**Authentication:** Required

**Request Body:**
```json
{
  "product_id": 1,           // Optional: ID of product being purchased
  "project_id": null,        // Optional: ID of project (for services)
  "seller_id": 2,            // Required: Seller's user ID
  "item_name": "Organic Rice 5kg",
  "item_description": "Premium organic rice",
  "item_cost": 500.00,
  "service_fee": 25.00,      // Optional: defaults to 5% of item_cost
  "payment_method": "card"   // card, bank_transfer, crypto
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "order_number": "ORD-20251110145623-A3F2B1C4",
  "buyer_id": 1,
  "seller_id": 2,
  "product_id": 1,
  "project_id": null,
  "item_name": "Organic Rice 5kg",
  "item_description": "Premium organic rice",
  "item_cost": 500.00,
  "service_fee": 25.00,
  "total_amount": 525.00,
  "status": "pending",
  "payment_method": "card",
  "payment_provider": null,
  "created_at": "2025-11-10T14:56:23",
  "updated_at": "2025-11-10T14:56:23",
  "completed_at": null
}
```

### GET /orders
Get all orders for current user (as buyer or seller).

**Authentication:** Required

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 20)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "order_number": "ORD-20251110145623-A3F2B1C4",
    "buyer_id": 1,
    "seller_id": 2,
    ...
  }
]
```

### GET /orders/{order_id}
Get specific order details.

**Authentication:** Required

**Response:** `200 OK`

### PUT /orders/{order_id}
Update order status.

**Authentication:** Required (buyer or seller only)

**Request Body:**
```json
{
  "status": "completed"  // pending, paid, processing, completed, cancelled, refunded
}
```

---

## Escrow Management Endpoints

### POST /escrow
Create escrow account for an order.

**Authentication:** Required (buyer only)

**Request Body:**
```json
{
  "order_id": 1,
  "amount": 525.00,
  "auto_release_days": 7,
  "requires_buyer_approval": true,
  "requires_delivery_confirmation": true
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "order_id": 1,
  "amount": 525.00,
  "status": "held",
  "auto_release_days": 7,
  "requires_buyer_approval": true,
  "requires_delivery_confirmation": true,
  "buyer_approved": false,
  "delivery_confirmed": false,
  "dispute_reason": null,
  "created_at": "2025-11-10T14:58:00",
  "released_at": null,
  "refunded_at": null
}
```

### GET /escrow
Get all escrow accounts for current user.

**Authentication:** Required

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 20)

**Response:** `200 OK`

### GET /escrow/{escrow_id}
Get specific escrow account.

**Authentication:** Required

**Response:** `200 OK`

### POST /escrow/{escrow_id}/action
Perform action on escrow account.

**Authentication:** Required

**Actions:**
- `approve` - Buyer approves the transaction
- `confirm_delivery` - Seller confirms delivery
- `dispute` - Either party raises a dispute
- `release` - Release funds to seller
- `refund` - Refund funds to buyer

**Request Body:**
```json
{
  "action": "approve",
  "reason": "Order received successfully"  // Optional, required for dispute
}
```

**Examples:**

**Buyer approves order:**
```json
{
  "action": "approve"
}
```

**Seller confirms delivery:**
```json
{
  "action": "confirm_delivery"
}
```

**Buyer disputes:**
```json
{
  "action": "dispute",
  "reason": "Item not as described"
}
```

**Release funds to seller:**
```json
{
  "action": "release"
}
```

**Refund to buyer:**
```json
{
  "action": "refund",
  "reason": "Order cancelled by seller"
}
```

**Response:** `200 OK`

---

## Payment Processing Endpoints

### POST /payments/initialize
Initialize payment with Paystack or Flutterwave.

**Authentication:** Required (buyer only)

**Request Body:**
```json
{
  "order_id": 1,
  "payment_method": "card",           // card, bank_transfer
  "payment_provider": "paystack"      // paystack, flutterwave
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "order_id": 1,
  "amount": 525.00,
  "currency": "USD",
  "payment_method": "card",
  "payment_provider": "paystack",
  "provider_reference": "PAYSTACK-ORD-20251110145623-A3F2B1C4-B5D3E7F9",
  "provider_transaction_id": null,
  "status": "pending",
  "created_at": "2025-11-10T15:00:00",
  "completed_at": null
}
```

**Note:** In production, this would return a `payment_url` or `authorization_url` to redirect the user to complete payment.

### POST /payments/verify
Verify payment completion.

**Authentication:** Required (buyer only)

**Request Body:**
```json
{
  "provider_reference": "PAYSTACK-ORD-20251110145623-A3F2B1C4-B5D3E7F9",
  "payment_provider": "paystack"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "order_id": 1,
  "amount": 525.00,
  "currency": "USD",
  "payment_method": "card",
  "payment_provider": "paystack",
  "provider_reference": "PAYSTACK-ORD-20251110145623-A3F2B1C4-B5D3E7F9",
  "provider_transaction_id": "PS_TXN_123456789",
  "status": "success",
  "created_at": "2025-11-10T15:00:00",
  "completed_at": "2025-11-10T15:02:30"
}
```

**Side Effects:**
- Order status updated to "paid"
- Escrow account automatically created if not exists
- Escrow status set to "held"

### GET /payments
Get all payments for current user.

**Authentication:** Required

**Query Parameters:**
- `skip`: int (default: 0)
- `limit`: int (default: 20)

**Response:** `200 OK`

---

## Complete Transaction Flow

### 1. Buyer creates order
```bash
POST /orders
{
  "product_id": 1,
  "seller_id": 2,
  "item_name": "Project Phoenix - UI/UX Design",
  "item_cost": 500.00,
  "payment_method": "card"
}
```

### 2. Buyer initializes payment
```bash
POST /payments/initialize
{
  "order_id": 1,
  "payment_method": "card",
  "payment_provider": "paystack"
}
```

### 3. Buyer completes payment (redirect to Paystack/Flutterwave)
*In production, user would be redirected to payment gateway*

### 4. Verify payment
```bash
POST /payments/verify
{
  "provider_reference": "PAYSTACK-ORD-...",
  "payment_provider": "paystack"
}
```
*Escrow is automatically created with status "held"*

### 5. Seller confirms delivery
```bash
POST /escrow/1/action
{
  "action": "confirm_delivery"
}
```

### 6. Buyer approves
```bash
POST /escrow/1/action
{
  "action": "approve"
}
```

### 7. Funds released to seller
```bash
POST /escrow/1/action
{
  "action": "release"
}
```
*Order status updated to "completed"*

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Escrow already exists for this order"
}
```

### 403 Forbidden
```json
{
  "detail": "Only buyer can create escrow"
}
```

### 404 Not Found
```json
{
  "detail": "Order not found"
}
```

---

## Frontend Integration Example

```typescript
import API from './services/api';

// Create order
const order = await API.orders.create({
  product_id: 1,
  seller_id: 2,
  item_name: "Organic Rice 5kg",
  item_cost: 500.00,
  payment_method: "card"
});

// Initialize payment
const payment = await API.payments.initialize({
  order_id: order.id,
  payment_method: "card",
  payment_provider: "paystack"
});

// Verify payment (after redirect back from gateway)
const verifiedPayment = await API.payments.verify({
  provider_reference: payment.provider_reference,
  payment_provider: "paystack"
});

// Buyer approves order
await API.escrow.approve(escrow.id);

// Release funds
await API.escrow.release(escrow.id);
```

---

## Status Codes

### Order Status
- `pending` - Order created, awaiting payment
- `paid` - Payment completed, escrow created
- `processing` - Seller is fulfilling order
- `completed` - Order fulfilled, funds released
- `cancelled` - Order cancelled
- `refunded` - Funds refunded to buyer

### Escrow Status
- `held` - Funds held in escrow
- `released` - Funds released to seller
- `refunded` - Funds refunded to buyer
- `disputed` - Dispute raised, under review

### Payment Status
- `pending` - Payment initiated
- `processing` - Payment being processed
- `success` - Payment completed
- `failed` - Payment failed
- `cancelled` - Payment cancelled

---

## Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **Authorization Checks** - Users can only access their own orders/escrow
3. **Escrow Protection** - Funds held until buyer approval
4. **Auto-release** - Configurable auto-release after N days
5. **Dispute Resolution** - Built-in dispute mechanism
6. **Audit Trail** - All actions tracked with timestamps

---

## Next Steps (Production)

1. **Integrate Paystack SDK** - Replace mock payment with real Paystack API
2. **Integrate Flutterwave SDK** - Add Flutterwave payment option
3. **Webhook Handlers** - Handle payment callbacks from providers
4. **Email Notifications** - Send emails for order status changes
5. **Admin Dashboard** - Dispute resolution and manual escrow management
6. **Automated Testing** - Unit and integration tests
7. **Rate Limiting** - Prevent abuse of payment endpoints
8. **Logging & Monitoring** - Track all transactions
