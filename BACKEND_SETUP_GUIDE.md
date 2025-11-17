# Backend Setup & Integration Guide

## Overview

This guide will help you set up the complete project escrow workflow backend that connects with the frontend components.

## What's Been Implemented

### ✅ Frontend Components
- `EscrowPromptModal.tsx` - AI-triggered escrow payment modal
- `WorkSubmissionModal.tsx` - Freelancer work submission interface
- `useNegotiationDetection.ts` - AI chat analysis hook
- Updated `services/api.ts` with escrow endpoints

### ✅ Backend Components
- `WorkSubmission` model in `database.py`
- Enhanced `project_escrow_routes.py` with 4 new endpoints
- Updated Stripe webhook in `stripe_integration.py`
- Migration script `migrate_work_submissions.py`

---

## Step 1: Run Database Migration

The `WorkSubmission` table needs to be created in your database.

```bash
cd backend
python migrate_work_submissions.py
```

**Expected Output:**
```
Creating work_submissions table...
✓ work_submissions table created successfully

Migration completed!
```

---

## Step 2: Verify Cloudinary Configuration

File uploads require Cloudinary to be configured in your `.env`:

```bash
# Check your backend/.env file
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

If not configured, sign up at https://cloudinary.com/users/register/free and add your credentials.

---

## Step 3: Start the Backend Server

```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

The server should start with the new routes included:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

---

## Step 4: Verify New API Endpoints

Visit http://localhost:8000/docs to see the Swagger documentation.

You should see these NEW endpoints under **"Project Escrow Workflow"**:

### 1. POST `/projects/escrow/place`
**Purpose**: Place funds in escrow (triggered by AI after detecting agreement)

**Request Body:**
```json
{
  "project_id": 1,
  "amount": 1000,
  "freelancer_id": 2
}
```

**Response:**
```json
{
  "message": "Checkout session created",
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_...",
  "project_id": 1,
  "amount": 1000,
  "platform_fee": 50,
  "total": 1050
}
```

---

### 2. POST `/projects/escrow/{project_id}/submit-work`
**Purpose**: Freelancer submits completed work with file uploads

**Request (multipart/form-data):**
- `description`: Text description of work completed
- `files`: Array of files (deliverables)

**Response:**
```json
{
  "message": "Work submitted successfully",
  "submission_id": 1,
  "project_id": 1,
  "files_uploaded": 3,
  "status": "pending_approval",
  "next_step": "Waiting for client approval"
}
```

---

### 3. POST `/projects/escrow/{project_id}/approve-work`
**Purpose**: Client approves work and releases escrow to freelancer wallet

**Response:**
```json
{
  "message": "Work approved and payment released",
  "project_id": 1,
  "amount_released": 1000,
  "freelancer_wallet_balance": 1000,
  "freelancer_name": "John Doe",
  "status": "completed",
  "payment_released": true
}
```

---

### 4. GET `/projects/escrow/{project_id}/escrow-status`
**Purpose**: Get current escrow status and work submissions

**Response:**
```json
{
  "project_id": 1,
  "title": "Build E-commerce Platform",
  "workflow_status": "escrow_funded",
  "escrow_funded": true,
  "escrow_amount": 1000,
  "agreed_price": 1000,
  "submission": {
    "id": 1,
    "description": "Completed all requirements...",
    "files": [
      {
        "filename": "source-code.zip",
        "url": "https://res.cloudinary.com/...",
        "size": 12500000
      }
    ],
    "status": "pending"
  },
  "owner": {
    "id": 1,
    "name": "Alice Smith",
    "avatar_url": "..."
  },
  "freelancer": {
    "id": 2,
    "name": "John Doe",
    "avatar_url": "..."
  }
}
```

---

## Step 5: Test the Complete Flow

### Prerequisites
1. Backend running on `http://localhost:8000`
2. Frontend running on `http://localhost:5173`
3. Two test accounts created:
   - **Poster**: `poster@test.com`
   - **Freelancer**: `freelancer@test.com`

### Test Sequence

#### 1. Create a Project (as Poster)
```bash
curl -X POST http://localhost:8000/projects \
  -H "Authorization: Bearer YOUR_POSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Build E-commerce Platform",
    "description": "Need a full e-commerce website",
    "budget": 1000,
    "deadline": "2025-02-01"
  }'
```

#### 2. Apply to Project (as Freelancer)
```bash
curl -X POST http://localhost:8000/projects/escrow/apply \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1
  }'
```

**Expected**: DM conversation created, freelancer can chat with poster

#### 3. Place Funds in Escrow (as Poster)
```bash
curl -X POST http://localhost:8000/projects/escrow/place \
  -H "Authorization: Bearer YOUR_POSTER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": 1,
    "amount": 1000,
    "freelancer_id": 2
  }'
```

**Expected**: Returns Stripe checkout URL
**Action**: Complete Stripe payment with test card `4242 4242 4242 4242`

#### 4. Verify Escrow Funded (Webhook)
After Stripe payment completes, webhook should automatically:
- Update `project.escrow_funded = true`
- Set `project.workflow_status = "escrow_funded"`
- Set `project.escrow_amount = 1000`

**Verify:**
```bash
curl http://localhost:8000/projects/escrow/1/escrow-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should show:
```json
{
  "escrow_funded": true,
  "workflow_status": "escrow_funded"
}
```

#### 5. Submit Work (as Freelancer)
```bash
curl -X POST http://localhost:8000/projects/escrow/1/submit-work \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN" \
  -F "description=Completed all requirements. Login: admin@test.com / password" \
  -F "files=@source-code.zip" \
  -F "files=@documentation.pdf"
```

**Expected**: Files uploaded to Cloudinary, `WorkSubmission` created

#### 6. Approve Work (as Poster)
```bash
curl -X POST http://localhost:8000/projects/escrow/1/approve-work \
  -H "Authorization: Bearer YOUR_POSTER_TOKEN"
```

**Expected**:
- Freelancer wallet balance increases by $1,000
- Project status = "completed"
- Escrow released

#### 7. Check Freelancer Wallet
```bash
curl http://localhost:8000/wallet/ \
  -H "Authorization: Bearer YOUR_FREELANCER_TOKEN"
```

Should show:
```json
{
  "balance": 1000.00,
  "transactions": [
    {
      "type": "credit",
      "amount": 1000,
      "description": "Escrow released for project: Build E-commerce Platform"
    }
  ]
}
```

---

## Step 6: Frontend Integration Testing

### 1. Test AI Negotiation Detection

**Frontend File**: `MessagesPage.tsx`

Add this code to integrate the hook:

```typescript
import { useNegotiationDetection } from '../hooks/useNegotiationDetection';
import EscrowPromptModal from '../components/modals/EscrowPromptModal';

// Inside your MessagesPage component:
const { negotiation, reset } = useNegotiationDetection(
  messages,
  otherUserId,
  otherUserName
);

// Render the modal
<EscrowPromptModal
  isOpen={negotiation.detected}
  onClose={reset}
  projectTitle={negotiation.projectTitle || 'Project'}
  agreedAmount={negotiation.agreedAmount || 0}
  freelancerName={negotiation.freelancerName || ''}
  onConfirm={async () => {
    const response = await API.projects.placeInEscrow({
      project_id: projectId, // Get from URL or context
      amount: negotiation.agreedAmount,
      freelancer_id: negotiation.freelancerId
    });

    // Redirect to Stripe
    window.location.href = response.checkout_url;
  }}
/>
```

**Test**:
1. Login as freelancer, apply to project
2. In DM, type: "I can do this for $500"
3. Poster replies: "Sounds good, let's do it!"
4. AI should detect agreement and show modal to poster

---

### 2. Test Work Submission

**Frontend File**: `ProjectDetailPage.tsx`

```typescript
import WorkSubmissionModal from '../components/modals/WorkSubmissionModal';

// Show button when freelancer views project with escrow funded
{project.escrow_funded && currentUser.id === project.freelancer_id && (
  <WorkSubmissionModal
    isOpen={showSubmitModal}
    onClose={() => setShowSubmitModal(false)}
    projectTitle={project.title}
    clientName={project.owner.name}
    agreedAmount={project.escrow_amount}
    onSubmit={async (description, files) => {
      const formData = new FormData();
      formData.append('description', description);
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      await API.projects.submitWork(project.id, formData);

      // Refresh project data
      fetchProject();
    }}
  />
)}
```

---

### 3. Test Work Approval

**Frontend File**: `ProjectDetailPage.tsx` (Poster View)

```typescript
// Show approval UI when work is submitted
{project.workflow_status === 'pending_approval' && currentUser.id === project.owner_id && (
  <div>
    <h3>Work Submitted for Review</h3>
    <p>{submission.description}</p>

    <div>
      <h4>Deliverables:</h4>
      {submission.files.map((file, i) => (
        <a key={i} href={file.url} download>
          Download {file.filename}
        </a>
      ))}
    </div>

    <button onClick={async () => {
      await API.projects.approveWork(project.id);
      alert('Payment released to freelancer!');
      fetchProject();
    }}>
      Approve & Release $1,000
    </button>
  </div>
)}
```

---

## Troubleshooting

### Issue: work_submissions table not found
**Solution**:
```bash
cd backend
python migrate_work_submissions.py
```

### Issue: Cloudinary upload failed
**Solution**: Check `.env` for correct Cloudinary credentials

### Issue: Stripe webhook not firing
**Solution**:
1. Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:8000/stripe/webhook
```
2. Update `STRIPE_WEBHOOK_SECRET` in `.env` with the webhook signing secret

### Issue: Foreign key constraint error
**Solution**: Ensure `WorkSubmission` is imported in `database.py` exports:
```python
from database import WorkSubmission  # Add to imports
```

---

## Environment Variables Checklist

Ensure these are in your `backend/.env`:

```bash
# Database
DATABASE_URL=sqlite:///./avalanche.db

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (for Stripe redirects)
FRONTEND_URL=http://localhost:5173
```

---

## Project Workflow States

```
posted
  ↓ (freelancer applies)
accepted
  ↓ (AI detects agreement)
price_agreed
  ↓ (poster pays via Stripe)
escrow_funded  ← Freelancer can start work
  ↓ (freelancer submits work)
pending_approval
  ↓ (poster approves)
paid / completed  ← Money released to wallet
```

---

## API Response Codes

- `200` - Success
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (not allowed to perform action)
- `404` - Resource not found
- `500` - Server error

---

## Next Steps

1. ✅ Run migration: `python migrate_work_submissions.py`
2. ✅ Start backend: `uvicorn main:app --reload`
3. ✅ Test API endpoints in Swagger docs
4. ✅ Integrate frontend components
5. ✅ Test complete flow with 2 user accounts
6. 🔄 Add notification system for escrow events
7. 🔄 Implement dispute resolution flow
8. 🔄 Add auto-release after X days

---

## Support

If you encounter issues:
1. Check backend logs for error messages
2. Verify database has `work_submissions` table
3. Ensure Stripe test mode is enabled
4. Check Cloudinary uploads folder
5. Verify user authentication tokens are valid

---

**Last Updated**: January 15, 2025
**Status**: Backend fully integrated, ready for testing
**Version**: 2.0
