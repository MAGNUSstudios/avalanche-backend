# Guild Membership & Posting Restrictions

## Overview
Implemented membership-based posting restrictions for guilds. Only users who are members of a guild (or the guild owner) can create posts in that guild.

## New API Endpoints

### 1. Join a Guild
```
POST /guilds/{guild_id}/join
```
**Authentication:** Required  
**Description:** Allows a user to join a guild as a member

**Response:**
```json
{
  "message": "Successfully joined the guild",
  "guild_id": 1,
  "member_count": 132
}
```

**Error Cases:**
- 404: Guild not found
- 400: Already a member
- 400: User is the guild owner

---

### 2. Leave a Guild
```
DELETE /guilds/{guild_id}/leave
```
**Authentication:** Required  
**Description:** Allows a member to leave a guild

**Response:**
```json
{
  "message": "Successfully left the guild",
  "guild_id": 1,
  "member_count": 131
}
```

**Error Cases:**
- 404: Guild not found
- 400: Not a member of the guild
- 400: Guild owner cannot leave (must transfer ownership or delete guild)

---

### 3. View Guild Members
```
GET /guilds/{guild_id}/members
```
**Authentication:** Not required  
**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Max records to return (default: 50)

**Response:**
```json
{
  "guild_id": 1,
  "guild_name": "Code Ninjas",
  "owner": {
    "id": 2,
    "name": "Avalanche Admin",
    "email": "admin@avalanche.com",
    "avatar_url": null,
    "role": "owner"
  },
  "members": [
    {
      "id": 3,
      "name": "John Doe",
      "email": "john@example.com",
      "avatar_url": null,
      "role": "member"
    }
  ],
  "total_members": 131
}
```

---

### 4. Create Post (Updated)
```
POST /guilds/{guild_id}/posts
```
**Authentication:** Required  
**Restriction:** ⚠️ **Only guild members and guild owner can post**

**Error Cases:**
- 403: "Only guild members can post in this guild. Please join the guild first."

---

## Implementation Details

### Backend Changes (`main.py`)

1. **Join Guild Endpoint:**
   - Checks if guild exists
   - Verifies user is not already a member
   - Adds user to `guild_members` table
   - Increments guild member count

2. **Leave Guild Endpoint:**
   - Checks if guild exists
   - Prevents owner from leaving
   - Removes user from `guild_members` table
   - Decrements guild member count

3. **View Members Endpoint:**
   - Returns guild owner information
   - Lists all members with pagination
   - Shows total member count

4. **Create Post (Modified):**
   - Added membership check before allowing post creation
   - Checks `guild_members` table or if user is guild owner
   - Returns 403 Forbidden if user is not a member

### Database Structure

**guild_members** (Association Table)
- `user_id`: Foreign key to users table
- `guild_id`: Foreign key to guilds table
- `joined_at`: Timestamp of when user joined

## Testing

Run the test script to verify setup:
```bash
cd backend
source venv/bin/activate
python3 test_guild_membership.py
```

## Usage Flow

1. **User browses guilds** → GET /guilds
2. **User clicks "Join Guild"** → POST /guilds/{id}/join
3. **User is now a member** → Can create posts
4. **User creates a post** → POST /guilds/{id}/posts
5. **User can leave anytime** → DELETE /guilds/{id}/leave

## Frontend Integration Needed

To fully implement this feature in the frontend, you'll need to:

1. **Add "Join Guild" button** on GuildDetailPage
   - Check if current user is a member
   - Show "Join" button if not a member
   - Show "Leave" button if a member
   - Disable posting UI if not a member

2. **Add membership indicator**
   - Show "Member" badge on guild cards
   - Display member count on guild pages

3. **Handle post creation errors**
   - Show proper error message when non-member tries to post
   - Redirect to join the guild

4. **Add members list page**
   - Show all guild members
   - Display owner separately from members

## Security Features

- ✅ Guild owner cannot leave (prevents orphaned guilds)
- ✅ Only members can post (prevents spam)
- ✅ Authentication required for all member actions
- ✅ Proper error messages for all cases
- ✅ Member count automatically updated

## API Documentation

Full API documentation available at: `http://localhost:8000/docs`

The interactive Swagger UI will show all the new endpoints with try-it-out functionality.
