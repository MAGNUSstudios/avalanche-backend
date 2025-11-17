# Payment & Escrow Implementation

## Overview
The Avalanche platform includes a complete payment and escrow system for secure transactions between buyers and sellers.

## Features

### ✅ Implemented
- **Secure Checkout Pages**: Two payment page designs with theme support
- **Escrow System**: Funds held securely until project/order completion
- **Payment Integration**: Paystack and Flutterwave ready
- **Order Management**: Complete order lifecycle tracking
- **Theme Support**: Light/dark mode for all payment pages
- **Responsive Design**: Mobile-first approach

### 🔄 Payment Flow
1. **Create Order**: Order details are saved with pending status
2. **Initialize Payment**: Payment provider (Paystack/Flutterwave) is initialized
3. **User Payment**: User completes payment on provider's secure interface
4. **Payment Verification**: Backend verifies payment with provider
5. **Escrow Holding**: Funds are held in escrow until completion
6. **Release/Refund**: Funds released to seller or refunded to buyer

## Pages

### CheckoutPage (`/checkout`)
Light-themed checkout page with:
- Order summary with product details
- Payment method selection (Card/Bank Transfer)
- Card payment form
- Escrow protection notice
- Responsive layout

**Usage:**
```tsx
<CheckoutPage 
  productId={1}
  itemName="Digital Art Package"
  itemCost={250.00}
  sellerId={5}
/>
```

### SecureCheckoutPage (`/secure-checkout`)
Dark-themed secure checkout with:
- Enhanced security badges
- Project/order visualization
- Payment method cards
- Inline card form
- Trust indicators

**Usage:**
```tsx
<SecureCheckoutPage 
  projectId={10}
  itemName="UI/UX Design Collaboration"
  itemCost={500.00}
  sellerId={8}
/>
```

## Components

### PaymentProcessor
Handles Paystack payment initialization:

```tsx
import PaymentProcessor from '@/components/payment/PaymentProcessor';

<PaymentProcessor
  amount={262.50}
  email="user@example.com"
  orderId={123}
  onSuccess={(reference) => {
    console.log('Payment successful:', reference);
    // Verify payment and update order
  }}
  onCancel={() => {
    console.log('Payment cancelled');
  }}
/>
```

### OrderStatus
Displays order/payment status with visual feedback:

```tsx
import OrderStatus from '@/components/payment/OrderStatus';

<OrderStatus 
  status="escrow"
  title="Funds Secured"
  description="Your payment is held safely until delivery"
  showBadge={true}
/>
```

**Available statuses:**
- `completed` - Green checkmark
- `pending` - Yellow clock
- `failed` - Red X
- `escrow` - Blue shield

## API Endpoints

### Orders
```typescript
// Create new order
POST /api/orders
Body: {
  product_id?: number,
  project_id?: number,
  seller_id: number,
  item_name: string,
  item_description: string,
  item_cost: number,
  service_fee: number,
  payment_method: 'card' | 'bank_transfer'
}

// Get order by ID
GET /api/orders/{id}

// Get user's orders
GET /api/orders/my

// Update order status
PATCH /api/orders/{id}
Body: { status: 'pending' | 'completed' | 'cancelled' }
```

### Payments
```typescript
// Initialize payment
POST /api/payments/initialize
Body: {
  order_id: number,
  payment_method: 'card' | 'bank_transfer',
  payment_provider: 'paystack' | 'flutterwave'
}
Response: {
  authorization_url: string,
  access_code: string,
  reference: string
}

// Verify payment
POST /api/payments/verify
Body: {
  provider_reference: string,
  payment_provider: 'paystack' | 'flutterwave'
}

// Get payment by order
GET /api/payments/order/{order_id}

// Webhook (for payment providers)
POST /api/payments/webhook/{provider}
```

### Escrow
```typescript
// Create escrow
POST /api/escrow
Body: {
  order_id: number,
  amount: number
}

// Release escrow to seller
POST /api/escrow/{id}/release

// Refund escrow to buyer
POST /api/escrow/{id}/refund

// Get escrow by order
GET /api/escrow/order/{order_id}
```

## Setup Instructions

### 1. Environment Variables
Create `.env` file from `.env.example`:

```bash
# Required for payment processing
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxx

# Backend API
VITE_API_BASE_URL=http://localhost:8000
```

### 2. Paystack Setup
1. Sign up at [https://paystack.com](https://paystack.com)
2. Go to Settings → API Keys & Webhooks
3. Copy your **Public Key** and **Secret Key**
4. Add public key to `.env`
5. Add secret key to backend `.env`
6. Set up webhook URL: `https://yourdomain.com/api/payments/webhook/paystack`

### 3. Flutterwave Setup (Optional)
1. Sign up at [https://flutterwave.com](https://flutterwave.com)
2. Go to Settings → API
3. Copy your **Public Key**
4. Add to `.env`

### 4. Testing
Use Paystack test cards:
```
Success: 4084084084084081
Decline: 4084080000000408
Insufficient Funds: 4084082000000401
PIN: 1234 | OTP: 123456
```

## Styling & Theming

All payment pages use CSS variables for theme support:

```css
/* Light Mode */
--primary-color: #0d7ff2
--card-background: #ffffff
--text-primary: #1a1a1a
--text-secondary: #6b7280
--border-color: #e5e7eb
--primary-glow: rgba(13, 127, 242, 0.3)

/* Dark Mode */
[data-theme='dark'] {
  --primary-color: #0d7ff2
  --card-background: #1b2127
  --text-primary: #f1f5f9
  --text-secondary: #9cabba
  --border-color: #283039
  --primary-glow: rgba(13, 127, 242, 0.5)
}
```

Pages automatically adapt to the user's theme preference.

## Security Features

1. **Escrow Protection**: Funds held until both parties agree
2. **SSL Encryption**: All payment data encrypted in transit
3. **PCI Compliance**: Paystack/Flutterwave handle card data
4. **Webhook Verification**: Payment webhooks verified with signature
5. **Fraud Detection**: Built into payment providers
6. **Dispute Resolution**: Manual escrow release/refund by admin

## Error Handling

```tsx
try {
  const order = await API.orders.create({ ... });
  const payment = await API.payments.initialize({ ... });
  
  // Open payment modal
  initializePaystackPayment(payment);
  
} catch (error) {
  if (error.response?.status === 400) {
    setError('Invalid payment details');
  } else if (error.response?.status === 401) {
    setError('Please login to continue');
  } else {
    setError('Payment failed. Please try again.');
  }
}
```

## Service Fees

The platform charges a **5% service fee** on all transactions:
- **Item Cost**: Seller's price
- **Service Fee**: 5% of item cost
- **Total**: Item cost + service fee

Example:
```
Item Cost:    $100.00
Service Fee:  $5.00 (5%)
----------------------------
Total:        $105.00
```

## Escrow Release Flow

### Buyer-Initiated Release
1. Buyer confirms work completion
2. Clicks "Release Payment" button
3. Funds transferred to seller
4. Email notifications sent

### Admin-Initiated Release
1. Admin reviews dispute/completion
2. Decides to release or refund
3. Action executed with reason
4. Both parties notified

### Auto-Release (Future)
- After 14 days with no disputes
- Funds automatically released to seller
- Can be extended by buyer request

## Integration Example

Complete checkout flow:

```tsx
import { useState } from 'react';
import PaymentProcessor from '@/components/payment/PaymentProcessor';
import OrderStatus from '@/components/payment/OrderStatus';
import API from '@/services/api';

function CheckoutFlow() {
  const [orderId, setOrderId] = useState<number | null>(null);
  const [orderStatus, setOrderStatus] = useState<'pending' | 'completed'>('pending');
  
  const handlePaymentSuccess = async (reference: string) => {
    try {
      // Verify payment with backend
      const result = await API.payments.verify({
        provider_reference: reference,
        payment_provider: 'paystack'
      });
      
      if (result.status === 'success') {
        setOrderStatus('completed');
      }
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };
  
  return (
    <div>
      {orderStatus === 'pending' ? (
        <PaymentProcessor
          amount={262.50}
          email="user@example.com"
          orderId={orderId}
          onSuccess={handlePaymentSuccess}
          onCancel={() => console.log('Cancelled')}
        />
      ) : (
        <OrderStatus
          status="completed"
          title="Payment Successful!"
          description="Your order has been placed and funds are in escrow"
        />
      )}
    </div>
  );
}
```

## Testing Checklist

- [ ] Create order successfully
- [ ] Initialize Paystack payment
- [ ] Complete test payment
- [ ] Verify payment webhook
- [ ] Escrow created automatically
- [ ] Order status updated
- [ ] Release escrow to seller
- [ ] Refund escrow to buyer
- [ ] Theme switching works
- [ ] Responsive on mobile
- [ ] Error messages display
- [ ] Loading states show

## Next Steps

1. **Add Flutterwave**: Implement alternative payment provider
2. **Bank Transfer**: Add manual bank transfer flow
3. **Crypto Payments**: Integrate Avalanche blockchain payments
4. **Recurring Payments**: Subscription/milestone billing
5. **International**: Multi-currency support
6. **Invoices**: Generate PDF invoices
7. **Analytics**: Payment success tracking

## Support

For payment-related issues:
- Check API logs for detailed error messages
- Verify webhook is receiving events
- Test with Paystack test cards
- Contact support@avalanche.com

---

**Built with ❤️ by MAGNUS Studios**
