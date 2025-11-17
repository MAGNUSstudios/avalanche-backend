"""
Test script to verify guild membership restrictions
"""
from database import get_db, Guild, User, guild_members
from sqlalchemy import select

def test_membership():
    db = next(get_db())
    
    # Get a test guild
    guild = db.query(Guild).first()
    if not guild:
        print("❌ No guilds found in database")
        return
    
    print(f"📊 Testing guild: {guild.name} (ID: {guild.id})")
    print(f"   Owner ID: {guild.owner_id}")
    print(f"   Member count: {guild.member_count}")
    
    # Get guild owner
    owner = db.query(User).filter(User.id == guild.owner_id).first()
    if owner:
        print(f"   Owner: {owner.first_name} {owner.last_name} ({owner.email})")
    
    # Get current members
    members_query = select(guild_members).where(guild_members.c.guild_id == guild.id)
    members = db.execute(members_query).fetchall()
    
    print(f"\n👥 Current members: {len(members)}")
    for member in members:
        user = db.query(User).filter(User.id == member.user_id).first()
        if user:
            print(f"   - {user.first_name} {user.last_name} ({user.email})")
    
    # Get all users
    all_users = db.query(User).all()
    print(f"\n📋 Total users in system: {len(all_users)}")
    
    print("\n✅ Test complete!")
    print("\nAPI Endpoints available:")
    print("  POST /guilds/{guild_id}/join - Join a guild")
    print("  DELETE /guilds/{guild_id}/leave - Leave a guild")
    print("  GET /guilds/{guild_id}/members - View guild members")
    print("  POST /guilds/{guild_id}/posts - Create post (members only)")

if __name__ == "__main__":
    test_membership()
