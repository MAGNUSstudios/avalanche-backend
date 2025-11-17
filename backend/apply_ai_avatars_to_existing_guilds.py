"""
Apply AI-Generated Avatars to Existing Guilds
This script updates all guilds that don't have avatars/banners with AI-generated ones
"""

from database import SessionLocal, Guild
from cloudinary_ai_generator import get_ai_guild_avatar
from sqlalchemy import or_

def apply_ai_avatars():
    """
    Find all guilds without avatars and generate AI-powered ones
    """
    db = SessionLocal()

    try:
        # Find guilds without avatars or with placeholder URLs
        guilds_without_avatars = db.query(Guild).filter(
            or_(
                Guild.avatar_url == None,
                Guild.avatar_url == "",
                Guild.avatar_url.like("%picsum%"),  # Old placeholder images
                Guild.avatar_url.like("%placeholder%")
            )
        ).all()

        # Find guilds without banners or with placeholder URLs
        guilds_without_banners = db.query(Guild).filter(
            or_(
                Guild.banner_url == None,
                Guild.banner_url == "",
                Guild.banner_url.like("%picsum%"),  # Old placeholder images
                Guild.banner_url.like("%placeholder%")
            )
        ).all()

        print(f"Found {len(guilds_without_avatars)} guilds without avatars")
        print(f"Found {len(guilds_without_banners)} guilds without banners")
        print("\n" + "="*60 + "\n")

        # Update avatars
        avatar_count = 0
        for guild in guilds_without_avatars:
            print(f"Generating avatar for: {guild.name}")
            print(f"  Category: {guild.category or 'None'}")

            # Generate AI avatar
            new_avatar_url = get_ai_guild_avatar(
                guild_name=guild.name,
                category=guild.category,
                image_type="icon"
            )

            guild.avatar_url = new_avatar_url
            print(f"  ✓ Avatar generated: {new_avatar_url[:80]}...")
            avatar_count += 1

        print("\n" + "="*60 + "\n")

        # Update banners
        banner_count = 0
        for guild in guilds_without_banners:
            print(f"Generating banner for: {guild.name}")
            print(f"  Category: {guild.category or 'None'}")

            # Generate AI banner
            new_banner_url = get_ai_guild_avatar(
                guild_name=guild.name,
                category=guild.category,
                image_type="banner"
            )

            guild.banner_url = new_banner_url
            print(f"  ✓ Banner generated: {new_banner_url[:80]}...")
            banner_count += 1

        # Commit all changes
        db.commit()

        print("\n" + "="*60)
        print("✅ MIGRATION COMPLETE!")
        print("="*60)
        print(f"Total avatars generated: {avatar_count}")
        print(f"Total banners generated: {banner_count}")
        print("="*60 + "\n")

        # Show some examples
        if avatar_count > 0 or banner_count > 0:
            print("\nExamples of updated guilds:\n")
            updated_guilds = db.query(Guild).filter(
                Guild.avatar_url.like("%cloudinary%")
            ).limit(5).all()

            for guild in updated_guilds:
                print(f"📌 {guild.name}")
                print(f"   Category: {guild.category or 'No category'}")
                print(f"   Avatar: {guild.avatar_url[:70]}...")
                print(f"   Banner: {guild.banner_url[:70]}...")
                print()

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


def preview_changes():
    """
    Preview which guilds will be updated WITHOUT making changes
    """
    db = SessionLocal()

    try:
        guilds_to_update = db.query(Guild).filter(
            or_(
                Guild.avatar_url == None,
                Guild.avatar_url == "",
                Guild.avatar_url.like("%picsum%"),
                Guild.avatar_url.like("%placeholder%"),
                Guild.banner_url == None,
                Guild.banner_url == "",
                Guild.banner_url.like("%picsum%"),
                Guild.banner_url.like("%placeholder%")
            )
        ).all()

        print("\n" + "="*60)
        print("PREVIEW: Guilds that will receive AI-generated images")
        print("="*60 + "\n")

        for i, guild in enumerate(guilds_to_update, 1):
            needs_avatar = not guild.avatar_url or "picsum" in guild.avatar_url or "placeholder" in guild.avatar_url
            needs_banner = not guild.banner_url or "picsum" in guild.banner_url or "placeholder" in guild.banner_url

            print(f"{i}. {guild.name}")
            print(f"   Category: {guild.category or 'No category'}")
            print(f"   Needs Avatar: {'✓' if needs_avatar else '✗'}")
            print(f"   Needs Banner: {'✓' if needs_banner else '✗'}")
            print()

        print(f"Total guilds to update: {len(guilds_to_update)}\n")

    finally:
        db.close()


if __name__ == "__main__":
    print("\n" + "="*60)
    print("AI Avatar Migration Tool")
    print("="*60 + "\n")

    # First show preview
    preview_changes()

    # Ask for confirmation
    response = input("Do you want to apply AI-generated avatars to these guilds? (yes/no): ")

    if response.lower() in ['yes', 'y']:
        print("\nStarting migration...\n")
        apply_ai_avatars()
    else:
        print("\n❌ Migration cancelled.")
