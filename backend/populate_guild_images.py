"""
Script to add random placeholder images to guilds without images
"""
import random
from database import get_db, Guild
from sqlalchemy import or_

def get_random_placeholder_image(category: str = None, image_type: str = "banner") -> str:
    """
    Generate a random placeholder image using Picsum Photos (reliable Lorem Ipsum for photos).
    """
    # Dimensions based on image type
    width = 200 if image_type == "icon" else 1200
    height = 200 if image_type == "icon" else 400
    
    # Generate random seed for consistent variety
    seed = random.randint(1, 1000)
    
    # Use Picsum Photos - reliable, no API key required, great quality
    if image_type == "banner":
        picsum_url = f"https://picsum.photos/seed/{seed}/{width}/{height}?blur=2"
    else:
        picsum_url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    
    return picsum_url


def main():
    db = next(get_db())
    
    # Get all guilds without images
    guilds_without_avatar = db.query(Guild).filter(
        or_(Guild.avatar_url == None, Guild.avatar_url == "")
    ).all()
    
    guilds_without_banner = db.query(Guild).filter(
        or_(Guild.banner_url == None, Guild.banner_url == "")
    ).all()
    
    print(f"Found {len(guilds_without_avatar)} guilds without avatars")
    print(f"Found {len(guilds_without_banner)} guilds without banners")
    
    # Update guilds without avatars
    for guild in guilds_without_avatar:
        old_avatar = guild.avatar_url
        guild.avatar_url = get_random_placeholder_image(guild.category, "icon")
        print(f"  ✅ Updated avatar for guild '{guild.name}' (category: {guild.category})")
    
    # Update guilds without banners
    for guild in guilds_without_banner:
        old_banner = guild.banner_url
        guild.banner_url = get_random_placeholder_image(guild.category, "banner")
        print(f"  ✅ Updated banner for guild '{guild.name}' (category: {guild.category})")
    
    db.commit()
    
    print(f"\n✅ Successfully updated images for guilds!")
    print(f"   - {len(guilds_without_avatar)} avatars added")
    print(f"   - {len(guilds_without_banner)} banners added")


if __name__ == "__main__":
    main()
