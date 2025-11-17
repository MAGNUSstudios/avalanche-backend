# 🤖 AI Actions System - Documentation

## Overview

The AI Actions System enables the AI assistant ("Ava") to perform actions on behalf of logged-in users through natural language commands. Users can simply tell the AI what they want to do, and the AI will detect the intent, extract parameters, and execute the action.

## ✨ Features

- **Natural Language Processing**: Users can request actions in plain English
- **AI-Powered Intent Detection**: GPT-4-mini detects what action user wants to perform
- **Parameter Extraction**: Automatically extracts relevant data from the message
- **Authorization Checks**: Ensures users have permission to perform actions
- **Confirmation Flow**: Destructive actions require explicit user confirmation
- **Deep Links**: Returns navigation links after successful actions

## 🎯 Available Actions

### 1. **Create Project**
- **Command Examples:**
  - "Create a new project called E-commerce Site with $5000 budget"
  - "Make a project for building a mobile app"
  - "Start a new project named Website Redesign"
- **Parameters:**
  - `title` (required)
  - `description` (optional)
  - `budget` (optional)
  - `deadline` (optional)
- **Permission:** Authenticated users only

### 2. **Join Guild**
- **Command Examples:**
  - "Join the Web Developers guild"
  - "I want to join Python Programmers"
  - "Add me to the Data Science community"
- **Parameters:**
  - `guild_id` OR `guild_name` (one required)
- **Permission:** Authenticated users only

### 3. **Leave Guild**
- **Command Examples:**
  - "Leave the React Developers guild"
  - "Remove me from Designers community"
- **Parameters:**
  - `guild_id` OR `guild_name` (one required)
- **Permission:** Authenticated users only
- **Note:** Cannot leave guilds you own

### 4. **Create Product Listing**
- **Command Examples:**
  - "List a Nike shoe for $150"
  - "Create a product: Laptop - $1200"
  - "Sell my MacBook Pro for 1500 dollars"
- **Parameters:**
  - `name` (required)
  - `description` (optional)
  - `price` (required)
  - `category` (optional)
  - `stock` (optional)
- **Permission:** Authenticated users only

### 5. **Update Profile**
- **Command Examples:**
  - "Update my bio to 'Full-stack developer'"
  - "Change my country to United States"
- **Parameters:**
  - `first_name`, `last_name`, `bio`, `country` (all optional)
- **Permission:** Authenticated users only

### 6. **Search Projects**
- **Command Examples:**
  - "Find AI projects"
  - "Search for projects with budget over $1000"
  - "Show me completed projects"
- **Parameters:**
  - `query`, `status`, `min_budget`, `max_budget` (all optional)
- **Permission:** Public

### 7. **Search Guilds**
- **Command Examples:**
  - "Find Python guilds"
  - "Search for design communities"
- **Parameters:**
  - `query`, `category` (all optional)
- **Permission:** Public

### 8. **Search Products**
- **Command Examples:**
  - "Show me laptops under $1000"
  - "Find Nike shoes"
- **Parameters:**
  - `query`, `category`, `min_price`, `max_price` (all optional)
- **Permission:** Public

### 9. **Create Task**
- **Command Examples:**
  - "Create a task for project #5: Design homepage"
  - "Add task 'Setup database' to my project"
- **Parameters:**
  - `project_id` (required)
  - `title` (required)
  - `description`, `priority`, `deadline` (optional)
- **Permission:** Authenticated users only

### 10. **Send Message**
- **Command Examples:**
  - "Send a message to user #10: Hello!"
  - "Message John: Are you available tomorrow?"
- **Parameters:**
  - `recipient_id` (required)
  - `content` (required)
- **Permission:** Authenticated users only

## 🔌 API Endpoints

### 1. `/ai/chat` (POST) - Enhanced with Actions
**Description:** Main chat endpoint that now detects and executes actions automatically

**Request:**
```json
{
  "message": "Create a project called Mobile App with $3000 budget",
  "conversation_history": []
}
```

**Response (Action Detected & Executed):**
```json
{
  "response": "I've successfully created your project 'Mobile App' with a budget of $3000!",
  "intent": "action",
  "action_performed": "create_project",
  "action_result": {
    "success": true,
    "message": "Project 'Mobile App' created successfully!",
    "project_id": 42,
    "data": {...},
    "deep_link": "sneaker://projects/42"
  },
  "links": [
    {
      "link": "sneaker://projects/42",
      "type": "result",
      "label": "View Result"
    }
  ]
}
```

**Response (Action Failed):**
```json
{
  "response": "I tried to create project, but encountered an error: Project title is required",
  "intent": "action_failed",
  "action_attempted": "create_project",
  "error": "Project title is required",
  "requires_auth": false
}
```

### 2. `/ai/detect-action` (POST)
**Description:** Detect action intent without executing

**Request:**
```json
{
  "message": "Join the Web Developers guild"
}
```

**Response:**
```json
{
  "has_action": true,
  "action": "join_guild",
  "confidence": 0.92,
  "parameters": {
    "guild_name": "Web Developers"
  },
  "confirmation_needed": true,
  "reasoning": "User explicitly wants to join a guild",
  "message": "Join the Web Developers guild"
}
```

### 3. `/ai/execute-action` (POST)
**Description:** Execute a specific action directly

**Request:**
```json
{
  "action": "create_project",
  "parameters": {
    "title": "E-commerce Site",
    "budget": 5000,
    "description": "Build a full-stack e-commerce platform"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project 'E-commerce Site' created successfully!",
  "project_id": 43,
  "data": {
    "id": 43,
    "title": "E-commerce Site",
    "description": "Build a full-stack e-commerce platform",
    "budget": 5000.0,
    "status": "active"
  },
  "deep_link": "sneaker://projects/43"
}
```

### 4. `/ai/available-actions` (GET)
**Description:** Get all actions available to the current user

**Response:**
```json
{
  "actions": [
    {
      "key": "create_project",
      "name": "Create Project",
      "description": "Create a new project with specified details",
      "parameters": ["title", "description", "budget", "deadline"],
      "required": ["title"]
    },
    // ... more actions
  ],
  "total": 11,
  "user_authenticated": true
}
```

### 5. `/ai/action-from-chat` (POST)
**Description:** Combined detect + execute in one call (with confirmation support)

**Request (Detection):**
```json
{
  "message": "Create a project called Test Project",
  "confirm": false
}
```

**Response (Needs Confirmation):**
```json
{
  "has_action": true,
  "action": "create_project",
  "parameters": {"title": "Test Project"},
  "confirmation_needed": true,
  "message": "I detected that you want to create project. Please confirm to proceed.",
  "requires_confirmation": true
}
```

**Request (With Confirmation):**
```json
{
  "message": "Create a project called Test Project",
  "confirm": true
}
```

**Response (Executed):**
```json
{
  "has_action": true,
  "action": "create_project",
  "executed": true,
  "result": {
    "success": true,
    "message": "Project 'Test Project' created successfully!",
    "project_id": 44,
    "deep_link": "sneaker://projects/44"
  }
}
```

## 🔒 Security & Authorization

1. **Authentication Required:** Actions with `permission: "authenticated"` require logged-in users
2. **Public Actions:** Search actions are available to all users
3. **Ownership Checks:** Users can only modify/delete their own resources
4. **Confirmation Flow:** Destructive actions require explicit confirmation
5. **Parameter Validation:** All inputs are validated before execution
6. **Database Transactions:** Actions use database transactions for data integrity

## 🎨 Frontend Integration Examples

### Example 1: Simple Chat with Action Detection

```typescript
// User types: "Create a project called My App"
const response = await fetch('/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Create a project called My App"
  })
});

const data = await response.json();

if (data.intent === 'action' && data.action_result.success) {
  // Show success message
  alert(data.response);

  // Navigate to created project
  if (data.links[0]?.link) {
    window.location.href = data.links[0].link;
  }
}
```

### Example 2: Explicit Action Detection + Confirmation

```typescript
// Step 1: Detect action
const detection = await fetch('/ai/detect-action', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Join the Web Developers guild"
  })
});

const detectionData = await detection.json();

if (detectionData.has_action && detectionData.confirmation_needed) {
  // Step 2: Ask user for confirmation
  const confirmed = confirm(`Do you want to ${detectionData.action.replace('_', ' ')}?`);

  if (confirmed) {
    // Step 3: Execute action
    const execution = await fetch('/ai/execute-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: detectionData.action,
        parameters: detectionData.parameters
      })
    });

    const result = await execution.json();
    if (result.success) {
      alert(result.message);
    }
  }
}
```

### Example 3: Get Available Actions

```typescript
const response = await fetch('/ai/available-actions');
const data = await response.json();

console.log(`Available actions: ${data.total}`);
data.actions.forEach(action => {
  console.log(`- ${action.name}: ${action.description}`);
});
```

## 🧪 Testing Examples

### Test 1: Create Project via Chat
```bash
curl -X POST http://localhost:8000/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Create a project called AI Chatbot with $2000 budget"
  }'
```

### Test 2: Join Guild
```bash
curl -X POST http://localhost:8000/ai/execute-action \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "action": "join_guild",
    "parameters": {
      "guild_name": "Python Developers"
    }
  }'
```

### Test 3: Search Products
```bash
curl -X POST http://localhost:8000/ai/execute-action \
  -H "Content-Type: application/json" \
  -d '{
    "action": "search_products",
    "parameters": {
      "query": "laptop",
      "max_price": 1000
    }
  }'
```

## 📝 Adding New Actions

To add a new action to the system:

### Step 1: Define Action in `ai_actions.py`

```python
AVAILABLE_ACTIONS = {
    # ... existing actions
    "your_new_action": {
        "name": "Your Action Name",
        "description": "What this action does",
        "parameters": ["param1", "param2"],
        "required": ["param1"],
        "permission": "authenticated"  # or "public"
    }
}
```

### Step 2: Create Executor Function

```python
def execute_your_new_action(user: User, db: Session, params: Dict[str, Any]) -> Dict[str, Any]:
    """Execute your new action"""
    try:
        # Validate parameters
        if not params.get("param1"):
            return {"success": False, "error": "param1 is required"}

        # Perform action
        # ... your logic here

        return {
            "success": True,
            "message": "Action completed successfully!",
            "data": {...},
            "deep_link": "sneaker://..."
        }
    except Exception as e:
        logger.error(f"Error in your_new_action: {e}")
        db.rollback()
        return {"success": False, "error": str(e)}
```

### Step 3: Register Executor

```python
ACTION_EXECUTORS = {
    # ... existing executors
    "your_new_action": execute_your_new_action
}
```

That's it! The AI will automatically detect and execute your new action.

## 🎯 Best Practices

1. **Clear Commands**: Be specific in natural language commands
2. **Error Handling**: Always handle action failures gracefully
3. **Confirmation**: Use confirmation for important actions
4. **Deep Links**: Navigate users to created/modified resources
5. **Validation**: Validate all user inputs before execution
6. **Logging**: Log all actions for debugging and analytics
7. **Transactions**: Use database transactions for data consistency

## 🐛 Troubleshooting

### Issue: Action not detected
**Solution:** Be more specific in your command or use `/ai/detect-action` to see what was detected

### Issue: Action failed with authentication error
**Solution:** Ensure user is logged in and has proper permissions

### Issue: Parameters not extracted correctly
**Solution:** The AI might not have understood the parameters. Try rephrasing or use direct `/ai/execute-action` with explicit parameters

---

## 🎉 Summary

The AI Actions System transforms your AI assistant into a powerful automation tool that can:
- ✅ Create projects, guilds, products
- ✅ Join/leave communities
- ✅ Search and filter data
- ✅ Update user profiles
- ✅ Send messages
- ✅ Manage tasks

All through natural language commands! No forms, no clicking - just tell the AI what you want, and it happens.
