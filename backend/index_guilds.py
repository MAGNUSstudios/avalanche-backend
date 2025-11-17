"""
Script to index all guilds in the database into Qdrant for semantic search
"""
from database import get_db, Guild
import qdrant_service

def index_all_guilds():
    """Index all guilds into Qdrant"""
    db = next(get_db())

    try:
        # Get all guilds
        guilds = db.query(Guild).all()

        print(f"Found {len(guilds)} guilds to index")

        indexed_count = 0
        failed_count = 0

        for guild in guilds:
            try:
                success = qdrant_service.index_guild(
                    guild_id=guild.id,
                    name=guild.name,
                    description=guild.description or "",
                    metadata={
                        "owner_id": guild.owner_id,
                        "member_count": guild.member_count or 0,
                        "category": guild.category or "General"
                    }
                )

                if success:
                    indexed_count += 1
                    print(f"✅ Indexed: {guild.name} (ID: {guild.id})")
                else:
                    failed_count += 1
                    print(f"❌ Failed to index: {guild.name} (ID: {guild.id})")

            except Exception as e:
                failed_count += 1
                print(f"❌ Error indexing {guild.name}: {str(e)}")

        print(f"\n📊 Indexing complete:")
        print(f"   ✅ Successfully indexed: {indexed_count}")
        print(f"   ❌ Failed: {failed_count}")
        print(f"   📦 Total guilds: {len(guilds)}")

    finally:
        db.close()

if __name__ == "__main__":
    index_all_guilds()
