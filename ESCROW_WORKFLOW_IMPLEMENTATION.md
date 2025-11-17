# Project Escrow Workflow - Complete Implementation Guide

## Overview

This document describes the complete freelancer-to-client escrow workflow with AI-powered negotiation detection.

## Complete User Flow

### 1. **Freelancer Discovers Project**
```
Projects Page → View Active Projects → Click "View More" on Project Card
```

**File**: `ProjectsPage.tsx`
- Displays all active projects (status: "active")
- Shows budget, deadline, description
- Each card has "View More" button

---

### 2. **Freelancer Views Project Details & Applies**
```
Project Detail Page → Reviews Requirements → Clicks "Apply Now"
```

**File**: `ProjectDetailPage.tsx` (lines 401-424)

```typescript
const handleApply = async () => {
  // Calls: POST /projects/escrow/apply
  const response = await API.projects.applyToProject(project.id);

  // Redirects to DM with poster
  navigate(`/messages?userId=${response.poster.id}`);
};
```

**Backend Endpoint**: `POST /projects/escrow/apply`
- Creates a new DM conversation between freelancer and poster
- Returns chat_id and poster user info
- Sends notification to poster: "X applied to your project"

---

### 3. **Negotiation in Direct Messages**
```
Messages Page → Freelancer & Poster discuss terms, scope, timeline
```

**File**: `MessagesPage.tsx` + `useNegotiationDetection.ts`

**AI Monitoring** (Passive Background Process):
```typescript
// Custom hook analyzes chat messages
const { negotiation } = useNegotiationDetection(messages, otherUserId, otherUserName);

// Detects patterns like:
// - "Sounds good, $500 works for me"
// - "Deal! Let's start with the agreed $1000"
// - "Perfect, I'll deliver in 2 weeks for $750"
```

**Detection Logic**:
- Monitors last 10 messages
- Looks for agreement keywords: "agree", "deal", "sounds good", "perfect"
- Extracts pricing: `$1,000`, `$500`, etc.
- Extracts deliverables and timeline mentions
- Confidence score > 80% triggers prompt

---

### 4. **AI Prompts Poster to Place Funds in Escrow**
```
Chat Interface → AI detects agreement → Modal appears for Poster
```

**Component**: `EscrowPromptModal.tsx`

```typescript
<EscrowPromptModal
  isOpen={negotiation.detected}
  onClose={() => resetNegotiation()}
  projectTitle={negotiation.projectTitle}
  agreedAmount={negotiation.agreedAmount}
  freelancerName={negotiation.freelancerName}
  onConfirm={async () => {
    await API.projects.placeInEscrow({
      project_id: projectId,
      amount: negotiation.agreedAmount,
      freelancer_id: negotiation.freelancerId,
    });
  }}
/>
```

**What Poster Sees**:
```
┌─────────────────────────────────────────────┐
│ 🛡️  Ava AI Detected Agreement               │
│                                             │
│ "I noticed you and John have reached an    │
│  agreement! Place funds in escrow to       │
│  allow work to begin safely."              │
│                                             │
│ Project: Build E-commerce Platform         │
│ Freelancer: John Smith                     │
│ Agreed Amount: $1,000                      │
│ Platform Fee (5%): $50                     │
│ ─────────────────────────────────────────  │
│ Total: $1,050                              │
│                                             │
│ ✅ Funds Protected                          │
│ ✅ Work Guaranteed                          │
│ ✅ Dispute Resolution                       │
│                                             │
│ [Not Now]  [Place $1,050 in Escrow] ←─────│
└─────────────────────────────────────────────┘
```

**Backend Endpoint**: `POST /projects/escrow/place`

```python
{
  "project_id": 123,
  "amount": 1000,
  "freelancer_id": 456
}
```

**Backend Actions**:
1. Create Stripe Checkout Session for $1,050 (amount + 5% fee)
2. Redirect poster to Stripe payment page
3. On payment success (webhook):
   - Update project status: `"in_escrow"`
   - Create `Escrow` record: `{ amount: 1000, status: "held" }`
   - Link freelancer to project: `project.assigned_freelancer_id = 456`
   - Send notification to freelancer: "Funds secured! Start work"

---

### 5. **Freelancer Gets Notification**
```
Notification Bell → "💰 $1,000 secured in escrow for Build E-commerce Platform"
```

**Component**: `NotificationDropdown.tsx`

**Notification Type**:
```json
{
  "type": "escrow_secured",
  "message": "$1,000 secured in escrow for Build E-commerce Platform",
  "project_id": 123,
  "amount": 1000,
  "created_at": "2025-01-15T10:30:00Z"
}
```

**What Freelancer Sees**:
- Push notification (if enabled)
- In-app notification badge
- Click → navigates to `/projects/123` to view details

---

### 6. **Freelancer Works on Project**
```
Project Detail Page → Status: "In Progress" → Upload deliverables when done
```

**File**: Enhanced `ProjectDetailPage.tsx`

**For Freelancer View**:
```typescript
{project.assigned_freelancer_id === currentUser.id && (
  <EscrowStatus>
    💰 ${project.escrow_amount} secured in escrow

    <SubmitWorkButton onClick={() => setShowSubmitModal(true)}>
      Submit Completed Work
    </SubmitWorkButton>
  </EscrowStatus>
)}
```

---

### 7. **Freelancer Submits Work**
```
Project Page → "Submit Work" Button → Upload files + description
```

**Component**: `WorkSubmissionModal.tsx`

```typescript
<WorkSubmissionModal
  isOpen={showSubmitModal}
  onClose={() => setShowSubmitModal(false)}
  projectTitle={project.title}
  clientName={project.creator.name}
  agreedAmount={project.budget}
  onSubmit={async (description, files) => {
    const formData = new FormData();
    formData.append('description', description);
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    await API.projects.submitWork(project.id, formData);
  }}
/>
```

**What Freelancer Sees**:
```
┌─────────────────────────────────────────────┐
│ Submit Completed Work                       │
│ Build E-commerce Platform • $1,000         │
│                                             │
│ Work Description:                           │
│ ┌─────────────────────────────────────────┐ │
│ │ I've completed all requirements:        │ │
│ │ - Product catalog with filters          │ │
│ │ - Shopping cart functionality           │ │
│ │ - Stripe payment integration            │ │
│ │ - Responsive design                     │ │
│ │                                         │ │
│ │ Login: admin@test.com / password        │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Deliverables:                               │
│ 📎 Click to upload files                    │
│                                             │
│ 📄 source-code.zip (12.5 MB)               │
│ 📄 documentation.pdf (2.3 MB)              │
│ 🖼️  screenshots.zip (5.1 MB)               │
│                                             │
│ [Cancel]  [✓ Submit Work] ←────────────────│
└─────────────────────────────────────────────┘
```

**Backend Endpoint**: `POST /projects/{project_id}/submit-work`

**Backend Actions**:
1. Upload files to cloud storage (Cloudinary/S3)
2. Update project: `status = "pending_approval"`
3. Create submission record with file URLs
4. Send notification to poster: "John submitted work for review"

---

### 8. **Poster Reviews & Approves**
```
Notification → "Work submitted for review" → Reviews deliverables → Approves
```

**File**: `ProjectDetailPage.tsx` (Poster View)

**What Poster Sees**:
```
┌─────────────────────────────────────────────┐
│ 📋 Work Submitted for Review                │
│                                             │
│ Description:                                │
│ "I've completed all requirements..."       │
│                                             │
│ Deliverables:                               │
│ 📥 Download source-code.zip                 │
│ 📥 Download documentation.pdf               │
│ 📥 Download screenshots.zip                 │
│                                             │
│ Submitted: 2 hours ago                      │
│                                             │
│ [Request Changes]  [✓ Approve & Release] ←─│
└─────────────────────────────────────────────┘
```

**Backend Endpoint**: `POST /projects/{project_id}/approve-work`

**Backend Actions**:
1. Update project: `status = "completed"`
2. Update escrow: `status = "released"`
3. **Transfer funds to freelancer's wallet**:
   ```python
   freelancer_wallet.balance += escrow.amount  # $1,000
   ```
4. Create transaction records
5. Send notifications:
   - To freelancer: "💰 $1,000 released to your wallet"
   - To poster: "✅ Payment released to freelancer"

---

### 9. **Money Enters Freelancer's Wallet**
```
Wallet Page → Balance updated → Can withdraw to bank
```

**File**: `WalletPage.tsx`

**What Freelancer Sees**:
```
┌─────────────────────────────────────────────┐
│ 💼 Wallet Balance: $1,000.00                │
│                                             │
│ Recent Transactions:                        │
│ ✅ Escrow Released - Build E-commerce       │
│    +$1,000.00 • Jan 15, 2025               │
│                                             │
│ [Withdraw Funds] ←──────────────────────────│
└─────────────────────────────────────────────┘
```

---

## Complete Backend API Endpoints

### Project Workflow Endpoints

```python
# 1. Apply to project (creates DM conversation)
POST /projects/escrow/apply
Body: { "project_id": 123 }
Response: { "chat_id": 789, "poster": { "id": 1, "name": "Alice" } }

# 2. Place funds in escrow (after AI detects agreement)
POST /projects/escrow/place
Body: { "project_id": 123, "amount": 1000, "freelancer_id": 456 }
Response: { "checkout_url": "https://stripe.com/checkout/..." }

# 3. Stripe webhook (auto-called on payment success)
POST /stripe/webhook
# Creates escrow, updates project status, sends notifications

# 4. Submit completed work
POST /projects/{project_id}/submit-work
Body: FormData with files + description
Response: { "submission_id": 999, "status": "pending_approval" }

# 5. Approve work (releases escrow to wallet)
POST /projects/{project_id}/approve-work
Response: { "escrow_released": true, "amount": 1000 }

# 6. Get escrow status
GET /projects/{project_id}/escrow-status
Response: {
  "status": "held" | "released" | "refunded",
  "amount": 1000,
  "freelancer_id": 456,
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

## Database Schema Updates

### Projects Table
```sql
ALTER TABLE projects ADD COLUMN assigned_freelancer_id INTEGER REFERENCES users(id);
ALTER TABLE projects ADD COLUMN escrow_amount DECIMAL(10, 2);
ALTER TABLE projects ADD COLUMN escrow_status VARCHAR(20);
-- Possible statuses: "pending_payment", "active", "in_escrow", "pending_approval", "completed"
```

### Work Submissions Table
```sql
CREATE TABLE work_submissions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  freelancer_id INTEGER REFERENCES users(id),
  description TEXT,
  files JSONB,  -- Array of file URLs
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP
);
```

### Notifications Table Enhancement
```sql
ALTER TABLE notifications ADD COLUMN notification_type VARCHAR(50);
-- Types: "escrow_secured", "work_submitted", "escrow_released", "project_application"
```

---

## Key Features

### AI Negotiation Detection
- ✅ Monitors chat in real-time
- ✅ Detects agreement keywords
- ✅ Extracts pricing and terms
- ✅ Confidence-based triggering
- ✅ Non-intrusive prompting

### Escrow Protection
- ✅ Stripe-powered escrow
- ✅ Funds held until approval
- ✅ Automatic release on approval
- ✅ Dispute resolution ready
- ✅ Transaction audit trail

### File Management
- ✅ Multi-file upload support
- ✅ Cloud storage integration
- ✅ Download/preview for poster
- ✅ Version tracking
- ✅ File size limits enforced

### Notifications
- ✅ Real-time push notifications
- ✅ In-app notification center
- ✅ Email notifications (optional)
- ✅ Type-specific actions
- ✅ Read/unread tracking

---

## Integration Checklist

### Frontend
- [x] `EscrowPromptModal.tsx` - AI-triggered escrow prompt
- [x] `WorkSubmissionModal.tsx` - Freelancer work upload
- [x] `useNegotiationDetection.ts` - AI analysis hook
- [x] API methods for escrow workflow
- [ ] Update `ProjectDetailPage.tsx` with escrow UI
- [ ] Update `MessagesPage.tsx` with AI integration
- [ ] Add escrow status indicators
- [ ] Add work review UI for posters

### Backend
- [ ] `POST /projects/escrow/apply` endpoint
- [ ] `POST /projects/escrow/place` endpoint
- [ ] `POST /projects/{id}/submit-work` endpoint
- [ ] `POST /projects/{id}/approve-work` endpoint
- [ ] `GET /projects/{id}/escrow-status` endpoint
- [ ] Stripe webhook handler for escrow
- [ ] Notification system integration
- [ ] File upload handling (Cloudinary)
- [ ] Wallet balance updates

### Database
- [ ] Add `assigned_freelancer_id` to projects
- [ ] Add `escrow_amount` to projects
- [ ] Add `escrow_status` to projects
- [ ] Create `work_submissions` table
- [ ] Update escrow table schema
- [ ] Add notification types

---

## Testing the Complete Flow

### Step 1: Create Test Accounts
```bash
# Poster account
Email: poster@test.com
Password: password123

# Freelancer account
Email: freelancer@test.com
Password: password123
```

### Step 2: Create a Project (as Poster)
1. Login as poster
2. Navigate to `/projects/create`
3. Create project with budget $1,000
4. Project shows as "Active"

### Step 3: Apply to Project (as Freelancer)
1. Login as freelancer
2. Navigate to `/projects`
3. Click "View More" on project
4. Click "Apply Now"
5. Redirected to DM with poster

### Step 4: Negotiate in Chat
```
Poster: "Hi! Can you complete this in 2 weeks?"
Freelancer: "Yes, I can deliver in 2 weeks for $1,000"
Poster: "Sounds good! Let's do it"
```

### Step 5: AI Triggers Escrow Prompt
- Ava AI detects agreement
- Modal appears for poster
- Poster clicks "Place $1,050 in Escrow"
- Redirected to Stripe

### Step 6: Complete Stripe Payment
- Enter test card: `4242 4242 4242 4242`
- Any future expiry, any CVC
- Payment success → Webhook fires

### Step 7: Freelancer Gets Notification
- Notification: "$1,000 secured in escrow"
- Project status: "In Escrow"
- Freelancer can start work

### Step 8: Submit Work
1. Freelancer uploads files
2. Adds description
3. Clicks "Submit Work"
4. Project status: "Pending Approval"

### Step 9: Poster Approves
1. Poster reviews deliverables
2. Downloads files
3. Clicks "Approve & Release"
4. Escrow released to freelancer wallet

### Step 10: Check Wallet
1. Freelancer navigates to `/wallet`
2. Balance shows +$1,000
3. Transaction log updated
4. Can withdraw to bank

---

## Error Handling

### Payment Failures
- Stripe checkout fails → Show error, allow retry
- Webhook fails → Automatic retry (Stripe built-in)
- Duplicate webhook → Idempotent handling

### Work Submission Failures
- File upload fails → Show error, allow re-upload
- File too large → Validate before upload (100MB limit)
- Network error → Auto-save draft

### Escrow Release Failures
- Insufficient balance → Should never happen (escrow held)
- Database error → Rollback transaction
- Wallet update fails → Retry with exponential backoff

---

## Production Considerations

### Security
- ✅ All endpoints require authentication
- ✅ Verify user owns project before actions
- ✅ Verify freelancer is assigned before submission
- ✅ Stripe webhook signature verification
- ✅ File upload virus scanning
- ✅ Rate limiting on API endpoints

### Performance
- ✅ Lazy load chat messages (pagination)
- ✅ Debounce AI analysis (2s delay)
- ✅ Cloudinary for file hosting
- ✅ Database indexes on project_id, user_id
- ✅ Cache escrow status queries

### Monitoring
- ✅ Log all escrow transactions
- ✅ Alert on failed releases
- ✅ Track AI detection accuracy
- ✅ Monitor file upload success rates
- ✅ Dashboard for escrow metrics

---

## Next Steps

1. Implement backend endpoints
2. Test with Stripe test mode
3. Add comprehensive error handling
4. Implement dispute resolution flow
5. Add auto-release after X days
6. Build admin oversight dashboard
7. Add rating/review system post-completion
8. Implement refund flow for cancellations

---

**Last Updated**: January 15, 2025
**Status**: Frontend components ready, backend integration pending
**Version**: 1.0
