# Project Escrow Workflow Documentation

## Overview
The new project escrow workflow implements a secure payment system where:
1. Poster pays $25 subscription to post a job
2. Freelancer navigates to projects, picks a job, views details, and presses "Apply"
3. **Application automatically opens a chat** between freelancer and poster
4. They discuss and negotiate price in the chat
5. After agreement, AI prompts poster to fund escrow
6. AI notifies freelancer when money is in escrow
7. Freelancer completes work
8. Escrow releases payment to freelancer's wallet

## Workflow States
Projects progress through these workflow_status values:
- `posted` - Job posted, waiting for freelancer
- `accepted` - Freelancer has accepted
- `negotiating` - Price negotiation (optional intermediate state)
- `price_agreed` - Both parties agreed on price
- `escrow_funded` - Money is in escrow, work can begin
- `completed` - Work finished, waiting for payment release
- `paid` - Payment released to freelancer

## API Endpoints

### Base URL
All endpoints are under `/projects/escrow`

### 1. Post a Project
**POST** `/projects/escrow/post`

Poster pays $25 subscription and creates a project.

**Request Body:**
```json
{
  "title": "E-Commerce Website Development",
  "description": "Need a full-featured online store",
  "budget": 250000,
  "deadline": "2025-12-31T23:59:59",
  "payment_reference": "PAY_REF_12345"
}
```

**Response:**
```json
{
  "message": "Project posted successfully",
  "project_id": 123,
  "workflow_status": "posted",
  "subscription_fee": 25.0,
  "next_step": "Wait for freelancers to accept your project"
}
```

### 2. Apply to Project
**POST** `/projects/escrow/apply`

Freelancer applies to a project and automatically opens a chat with the poster.

**Request Body:**
```json
{
  "project_id": 123
}
```

**Response:**
```json
{
  "message": "Application sent successfully",
  "project_id": 123,
  "chat_id": 45,
  "poster": {
    "id": 10,
    "name": "John Doe",
    "avatar_url": "https://..."
  },
  "redirect_to_chat": true,
  "next_step": "Discuss project details with the poster in the chat"
}
```

**Frontend Action:**
After receiving this response, the frontend should:
1. Redirect the user to the project chat page
2. Open the chat with `chat_id: 45`
3. Show an initial message: "Hi! I'm interested in your project..."

### 3. Agree on Price
**POST** `/projects/escrow/agree-price`

Both parties agree on the final price.

**Request Body:**
```json
{
  "project_id": 123,
  "agreed_price": 180000
}
```

**Response:**
```json
{
  "message": "Price agreed successfully",
  "project_id": 123,
  "agreed_price": 180000,
  "workflow_status": "price_agreed",
  "ai_prompt": "🤖 AI Assistant: Great news! You and the freelancer have agreed on a price of $180000...",
  "next_step": "Poster should fund escrow"
}
```

### 4. Fund Escrow
**POST** `/projects/escrow/fund-escrow`

Poster moves agreed amount to escrow.

**Request Body:**
```json
{
  "project_id": 123
}
```

**Response:**
```json
{
  "message": "Escrow funded successfully",
  "project_id": 123,
  "escrow_amount": 180000,
  "workflow_status": "escrow_funded",
  "freelancer_name": "Jane Smith",
  "ai_notification_to_freelancer": "🤖 AI Assistant: Excellent news! The project owner has successfully funded the escrow...",
  "next_step": "Freelancer should start working on the project"
}
```

### 5. Complete Project
**POST** `/projects/escrow/complete`

Freelancer marks work as complete.

**Request Body:**
```json
{
  "project_id": 123
}
```

**Response:**
```json
{
  "message": "Project marked as complete",
  "project_id": 123,
  "workflow_status": "completed",
  "next_step": "Waiting for poster to release payment from escrow"
}
```

### 6. Release Payment
**POST** `/projects/escrow/release-payment`

Poster releases payment to freelancer's wallet.

**Request Body:**
```json
{
  "project_id": 123
}
```

**Response:**
```json
{
  "message": "Payment released successfully",
  "project_id": 123,
  "amount_released": 180000,
  "freelancer_name": "Jane Smith",
  "workflow_status": "paid",
  "project_completed": true
}
```

### 7. Get Project Status
**GET** `/projects/escrow/{project_id}/status`

Get current escrow workflow status.

**Response:**
```json
{
  "project_id": 123,
  "title": "E-Commerce Website Development",
  "workflow_status": "paid",
  "subscription_paid": true,
  "agreed_price": 180000,
  "escrow_funded": false,
  "escrow_amount": 180000,
  "completed_at": "2025-01-15T10:30:00",
  "payment_released_at": "2025-01-15T14:20:00",
  "poster": "John Doe",
  "freelancer": "Jane Smith"
}
```

## Database Schema

### New Project Fields

```python
# Workflow tracking
freelancer_id = Integer (ForeignKey to users.id)
workflow_status = String (default: "posted")
agreed_price = Float
subscription_paid = Boolean (default: False)
subscription_payment_ref = String

# Escrow tracking
escrow_funded = Boolean (default: False)
escrow_amount = Float
escrow_funded_at = DateTime

# Completion tracking
completed_at = DateTime
payment_released_at = DateTime
```

## Wallet Integration

When escrow is funded:
- **Poster's wallet**: Debit `agreed_price`
- **Transaction type**: "debit"
- **Description**: "Escrow funding for project: {title}"

When payment is released:
- **Freelancer's wallet**: Credit `agreed_price`
- **Transaction type**: "credit"
- **Description**: "Payment received for project: {title}"

## AI Assistant Integration

The AI provides contextual prompts at key stages:

1. **After price agreement**: Prompts poster to fund escrow
2. **After escrow funding**: Notifies freelancer money is secured
3. **Throughout process**: Can answer questions about workflow status

## Error Handling

### Common Errors:

- **403 Forbidden**: User not authorized for this action
- **404 Not Found**: Project doesn't exist
- **400 Bad Request**: Invalid workflow state transition
- **400 Insufficient Balance**: Poster doesn't have enough in wallet

## Security

- Only project **owner** can fund escrow and release payment
- Only assigned **freelancer** can mark project complete
- Escrow funds are held separately from active balances
- All state transitions are validated

## Migration

Run the migration script to add new fields:

```bash
python migrate_project_escrow.py
```

## Testing Workflow

1. Create test users (poster and freelancer)
2. Poster: Fund wallet with sufficient balance
3. Poster: Post project with payment reference
4. Freelancer: Accept project
5. Either party: Agree on price
6. Poster: Fund escrow (money deducted from wallet)
7. Freelancer: Complete project
8. Poster: Release payment (money added to freelancer wallet)

## Frontend Integration

### Key UI Components Needed:

1. **Project Posting Form**: Include $25 subscription payment
2. **Accept Button**: For freelancers viewing projects
3. **Price Negotiation Chat**: DM with price agreement button
4. **Fund Escrow Button**: Shown to poster after price agreement
5. **Complete Button**: Shown to freelancer when work is done
6. **Release Payment Button**: Shown to poster after completion
7. **Status Badge**: Shows current workflow_status
8. **AI Chat Widget**: Shows AI prompts and notifications

### Status Badge Colors:
- `posted`: Blue
- `accepted`: Purple
- `price_agreed`: Yellow
- `escrow_funded`: Green (money secured)
- `completed`: Orange (awaiting release)
- `paid`: Success Green

## Notes

- The $25 subscription fee is a one-time charge per project post
- Escrow protects both parties - poster doesn't pay until work starts, freelancer knows money is secured
- AI prompts guide users through the workflow
- All transactions are recorded in wallet_transactions table
- Projects can be tracked by their workflow_status for analytics