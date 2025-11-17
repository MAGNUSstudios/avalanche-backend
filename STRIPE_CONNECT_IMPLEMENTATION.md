# Stripe Connect Withdrawal Implementation

## Overview
This implementation allows sellers to withdraw their earnings from the escrow wallet directly to their bank account using Stripe Connect.

## How It Works

### 1. Escrow Release → Wallet Credit
When an escrow is released (payment_escrow.py:264-292):
```python
# Funds are deposited into seller's wallet
seller_wallet.balance += escrow.amount

# Transaction record is created
transaction = WalletTransaction(
    wallet_id=seller_wallet.id,
    transaction_type="deposit",
    amount=escrow.amount,
    description=f"Payment for order #{order.order_number}"
)
```

### 2. Connect Stripe Account
**Endpoint**: `POST /stripe-connect/create-account`

**Frontend**: WalletPage.tsx shows "Connect Stripe Account" button if not connected

**Process**:
1. Creates Stripe Connect Express account
2. Returns onboarding URL
3. Redirects user to Stripe to complete setup
4. Saves `stripe_account_id` to `seller_payment_info` table

**Return URLs**:
- Refresh: `/wallet?setup=refresh` - If user needs to restart onboarding
- Complete: `/wallet?setup=complete` - After successful onboarding

### 3. Check Account Status
**Endpoint**: `GET /stripe-connect/account-status`

**Returns**:
```json
{
  "connected": true,
  "account_id": "acct_xxx",
  "details_submitted": true,
  "charges_enabled": true,
  "payouts_enabled": true,
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "past_due": []
  }
}
```

### 4. Withdraw Funds
**Process Flow**:

1. **User clicks "Request Withdrawal"** (WalletPage.tsx)
   - Opens WithdrawalModal
   - User enters amount

2. **Create Withdrawal Request** (wallet_routes.py)
   ```
   POST /wallet/withdraw
   {
     "amount": 100.00,
     "payout_method": "stripe_connect",
     "payout_details": {"method": "stripe_transfer"}
   }
   ```

3. **Process via Stripe Connect** (stripe_connect_routes.py)
   ```
   POST /stripe-connect/process-withdrawal/{withdrawal_id}
   ```

   This:
   - Validates Stripe account is connected and ready
   - Creates Stripe Transfer to seller's connected account
   - Deducts amount from wallet balance
   - Creates negative wallet transaction (withdrawal record)
   - Updates withdrawal request status to "completed"
   - Stores Stripe transfer ID

4. **Stripe handles the rest**
   - Transfers funds to seller's Stripe account
   - Stripe pays out to seller's bank account per their schedule

## Database Schema

### SellerPaymentInfo Table
```sql
- stripe_account_id (VARCHAR) - Stripe Connect account ID
```

### WithdrawalRequest Table
```sql
- id (INTEGER)
- wallet_id (INTEGER) - FK to wallets
- amount (FLOAT)
- status (VARCHAR) - "pending" or "completed"
- payout_method (VARCHAR) - "stripe_connect"
- payout_details (TEXT) - JSON string
- stripe_transfer_id (VARCHAR) - Stripe transfer ID
- created_at (DATETIME)
- updated_at (DATETIME)
```

## Frontend Components

### WalletPage.tsx
- Shows current balance and locked balance
- Displays Stripe connection status
- "Connect Stripe Account" button (if not connected)
- "Request Withdrawal" button (if connected)
- Transaction history

### WithdrawalModal.tsx
- Simple amount input form
- Validates balance
- Creates withdrawal request
- Processes via Stripe Connect immediately
- Shows success/error messages

## API Endpoints

### Stripe Connect Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stripe-connect/create-account` | Create/re-onboard Stripe account |
| GET | `/stripe-connect/account-status` | Check account connection status |
| POST | `/stripe-connect/process-withdrawal/{id}` | Process withdrawal via Stripe |
| POST | `/stripe-connect/dashboard-link` | Get Stripe Express dashboard link |

### Wallet Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/wallet/` | Get wallet balance |
| GET | `/wallet/transactions` | Get transaction history |
| POST | `/wallet/withdraw` | Create withdrawal request |
| GET | `/wallet/withdrawal-requests` | Get all withdrawal requests |

## Configuration

### Backend (.env)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## Testing the Flow

### 1. Complete an escrow transaction
- Create an order as buyer
- Funds go into escrow
- Release escrow (as admin or buyer)
- Funds appear in seller's wallet

### 2. Connect Stripe Account
- Go to Wallet page
- Click "Connect Stripe Account"
- Complete Stripe onboarding (test mode)
- Return to wallet page

### 3. Withdraw Funds
- Click "Request Withdrawal"
- Enter amount
- Click "Withdraw Funds"
- Check Stripe dashboard to see transfer

## Important Notes

### Test Mode
- Use Stripe test account IDs
- Transfers appear in Stripe dashboard but don't actually pay out
- Use test bank account numbers for onboarding

### Production Considerations
1. **Verification**: Stripe requires identity verification for live mode
2. **Fees**: Stripe charges fees for transfers (check Stripe Connect pricing)
3. **Minimum Transfer**: May want to set minimum withdrawal amount
4. **Transfer Limits**: Stripe has daily/weekly limits per account
5. **Webhooks**: Consider adding webhook handlers for transfer events
6. **Currency**: Currently hardcoded to USD, make dynamic if needed

### Security
- Never expose `STRIPE_SECRET_KEY` in frontend
- Validate all amounts server-side
- Check wallet balance before processing
- Ensure user owns the wallet being withdrawn from
- Store sensitive data encrypted

## Stripe Connect Express vs Standard

We use **Express** accounts because:
- ✅ Simpler onboarding for sellers
- ✅ Stripe handles compliance and verification
- ✅ Better UX - Stripe-hosted onboarding
- ✅ Less maintenance for us

## Future Enhancements

1. **Webhook Integration**: Listen for transfer events
2. **Automatic Payouts**: Schedule regular payouts
3. **Multi-currency**: Support multiple currencies
4. **Fee Management**: Handle platform fees
5. **Admin Dashboard**: View and manage all withdrawals
6. **Email Notifications**: Notify users of successful withdrawals
7. **Withdrawal History**: Enhanced UI for viewing past withdrawals
8. **Refund Support**: Handle withdrawal reversals if needed

## Troubleshooting

### "Stripe Connect account not set up"
- User needs to complete Stripe onboarding first
- Click "Connect Stripe Account" button

### "Stripe account not ready for payouts"
- Onboarding incomplete
- Check `account_status` endpoint for requirements

### "Insufficient wallet balance"
- User doesn't have enough funds
- Wait for escrow release

### "Failed to process withdrawal"
- Check Stripe dashboard for error details
- Verify account is in good standing
- Check Stripe API logs

## Files Created/Modified

### Backend
- ✅ `stripe_connect_routes.py` - New Stripe Connect endpoints
- ✅ `database.py` - Added `stripe_transfer_id` column
- ✅ `wallet_routes.py` - Updated withdrawal request creation
- ✅ `main.py` - Registered Stripe Connect routes
- ✅ `migrate_add_stripe_transfer_id.py` - Database migration

### Frontend
- ✅ `services/api.ts` - Added Stripe Connect API calls
- ✅ `pages/WalletPage.tsx` - Stripe Connect UI integration
- ✅ `components/modals/WithdrawalModal.tsx` - Simplified for Stripe

## Success Criteria
- ✅ Users can connect Stripe accounts
- ✅ Escrow releases credit wallet balance
- ✅ Users can withdraw to connected Stripe account
- ✅ Funds transfer via Stripe Connect
- ✅ Transaction history records withdrawals
- ✅ Balance updates correctly after withdrawal
