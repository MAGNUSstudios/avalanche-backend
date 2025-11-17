"""
Fix guild member counts to reflect actual membership data
"""
from database import get_db, Guild, guild_members
from sqlalchemy import select, func

def fix_member_counts():
    db = next(get_db())
    
    try:
        # Get all guilds
        guilds = db.query(Guild).all()
        
        print(f"Found {len(guilds)} guilds to update")
        print("=" * 60)
        
        updated_count = 0
        
        for guild in guilds:
            # Count actual members from guild_members table
            member_count_query = select(func.count()).select_from(guild_members).where(
                guild_members.c.guild_id == guild.id
            )
            actual_member_count = db.execute(member_count_query).scalar()
            
            # Guild member count should be at least 1 (the owner)
            # If no members in table, count is 1 (owner)
            # If members exist, count is members + 1 (owner)
            new_count = actual_member_count + 1  # +1 for the owner
            
            if guild.member_count != new_count:
                old_count = guild.member_count
                guild.member_count = new_count
                print(f"  ✅ Updated '{guild.name}': {old_count} → {new_count} members")
                updated_count += 1
            else:
                print(f"  ⏭️  '{guild.name}': {new_count} members (no change)")
        
        db.commit()
        
        print("=" * 60)
        print(f"\n✅ Successfully updated {updated_count} guilds!")
        print(f"   Total guilds processed: {len(guilds)}")
        
        # Show summary
        print("\n📊 Member count summary:")
        total_members = sum(g.member_count for g in guilds)
        avg_members = total_members / len(guilds) if guilds else 0
        print(f"   Total members across all guilds: {total_members}")
        print(f"   Average members per guild: {avg_members:.1f}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_member_counts()
