# AI Navigation Feature - Deep Links Implementation

## Overview
The AI assistant now tracks user intent and provides contextual deep links to navigate users directly to relevant sections of the platform using a custom `sneaker://` protocol.

## Features

### 1. Context Tracking
- AI detects what users are looking for (products, guilds, projects, etc.)
- Tracks user intent throughout the conversation
- Maintains context across multiple messages

### 2. Deep Link Generation
- Uses custom `sneaker://` protocol instead of standard URLs
- Generates clickable navigation links based on user context
- Supports multiple entity types:
  - `sneaker://marketplace` - Marketplace overview
  - `sneaker://marketplace/products/{id}` - Specific product
  - `sneaker://guilds` - Guilds overview
  - `sneaker://guilds/{id}` - Specific guild
  - `sneaker://projects` - Projects overview
  - `sneaker://projects/{id}` - Specific project
  - `sneaker://marketplace/create` - Create product listing

### 3. Smart Responses
The AI provides deep links based on user intent:

#### Product Search
When users search for products (e.g., "find sneakers under 60k naira"):
- Links to specific matching products
- Link to browse all marketplace items

#### Guild Search
When users ask about guilds or communities:
- Link to guilds overview
- Links to recommended guilds

#### Project Search
When users look for projects:
- Link to projects overview
- Links to relevant projects

#### Selling Intent
When users want to sell items:
- Link to create product listing
- Link to view marketplace

## Implementation Details

### Backend (`ai_assistant.py`)

#### Functions Added:

1. **`generate_deep_link(entity_type, entity_id, entity_data)`**
   - Generates sneaker:// protocol links
   - Maps entity types to appropriate routes
   - Returns link object with metadata

2. **`format_response_with_links(response_text, context, intent)`**
   - Analyzes AI response and context
   - Generates relevant deep links based on intent
   - Returns formatted response with links array

3. **Updated `chat_with_ai()`**
   - Now includes `links` array in response
   - Tracks `context_type` for navigation history
   - Integrates deep link generation

### Frontend (`AIChatInterface.tsx`)

#### Components Added:

1. **`DeepLinksContainer`**
   - Styled container for displaying links
   - Vertical layout with proper spacing

2. **`DeepLinkButton`**
   - Styled clickable link button
   - Shows `sneaker://` prefix
   - Hover effects and transitions
   - Custom styling to match platform theme

#### Functions Added:

1. **`handleDeepLink(link)`**
   - Parses `sneaker://` protocol
   - Converts to React Router navigation
   - Navigates user to appropriate page

#### Interface Updates:

- Added `DeepLink` interface for type safety
- Extended `Message` interface to include `links` array
- Updated message rendering to display links

## Usage Examples

### Example 1: Product Search
**User:** "Find sneakers under 60k naira"

**AI Response:**
"I found 5 products within your ₦60,000 budget:
1. Nike Air Max - ₦45,000
2. Adidas Ultraboost - ₦55,000
..."

**Links Generated:**
- `sneaker://marketplace/products/1` → Nike Air Max
- `sneaker://marketplace/products/2` → Adidas Ultraboost
- `sneaker://marketplace` → Browse all marketplace items

### Example 2: Guild Discovery
**User:** "Show me tech communities"

**AI Response:**
"Here are some tech guilds you might like..."

**Links Generated:**
- `sneaker://guilds` → Browse all guilds

### Example 3: Selling Items
**User:** "I want to sell my items"

**AI Response:**
"Great! I can help you list your products..."

**Links Generated:**
- `sneaker://marketplace/create` → Create Product Listing
- `sneaker://marketplace` → View Marketplace

## Technical Flow

```
User Message
    ↓
AI Intent Detection (detect_intent)
    ↓
Context Gathering (gather_context)
    ↓
OpenAI Response Generation
    ↓
Deep Link Generation (format_response_with_links)
    ↓
Response with Links sent to Frontend
    ↓
User clicks link
    ↓
Deep Link Handler (handleDeepLink)
    ↓
React Router Navigation
    ↓
User navigated to destination
```

## Intent Types Supporting Deep Links

1. **search_products_budget** - Budget-constrained product search
2. **search_products** - General product search
3. **search_guilds** - Guild/community search
4. **search_projects** - Project search
5. **suggest_selling** - Marketplace selling intent
6. **general_search** - Multi-entity search

## Benefits

1. **Seamless Navigation** - Users can jump directly to relevant sections
2. **Context-Aware** - Links match user intent and conversation context
3. **Improved UX** - Reduces friction in finding what users need
4. **Custom Protocol** - `sneaker://` branding reinforces platform identity
5. **Visual Consistency** - Links styled to match platform design

## Future Enhancements

1. Track navigation analytics from AI chat
2. Add more entity types (users, tasks, messages)
3. Support query parameters in deep links
4. Add link previews before navigation
5. Implement link history within chat
6. Add "recently visited" quick links

## Testing

To test the feature:

1. Open the AI chat
2. Ask: "Find sneakers under 60k naira"
3. Verify deep links appear below AI response
4. Click a link and verify navigation works
5. Test other intents (guilds, projects, selling)

## Files Modified

### Backend
- `backend/ai_assistant.py` - Added deep link generation and formatting

### Frontend
- `avalanche-frontend/src/components/ai/AIChatInterface.tsx` - Added link rendering and navigation handling

## Dependencies

- React Router (for navigation)
- Existing AI infrastructure
- OpenAI API integration

## Notes

- Links are generated server-side for consistency
- Frontend handles all navigation
- Protocol prefix (`sneaker://`) is purely cosmetic but reinforces branding
- Links are optional - responses without context won't have links
