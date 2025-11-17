"""
Fix guild images by replacing broken Unsplash URLs with working Picsum Photos URLs
"""
import random
from database import get_db, Guild
from sqlalchemy import or_

def get_placeholder_image(seed: int, image_type: str = "banner") -> str:
    """
    Generate a placeholder image using Picsum Photos (reliable Lorem Ipsum for photos).
    Uses smaller sizes for faster loading.
    """
    # Smaller dimensions for faster loading
    width = 200 if image_type == "icon" else 800
    height = 200 if image_type == "icon" else 300
    
    # Use Picsum Photos - reliable, no API key required, no blur for faster loading
    picsum_url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    
    return picsum_url


def main():
    db = next(get_db())
    
    # Get all guilds with Unsplash URLs (which are broken)
    guilds = db.query(Guild).filter(
        or_(
            Guild.avatar_url.like('%unsplash%'),
            Guild.banner_url.like('%unsplash%')
        )
    ).all()
    
    print(f"Found {len(guilds)} guilds with broken Unsplash URLs")
    
    # Update guilds with new working URLs
    for i, guild in enumerate(guilds):
        # Use guild ID as seed for consistent images
        seed = guild.id * 100
        
        if guild.avatar_url and 'unsplash' in guild.avatar_url:
            guild.avatar_url = get_placeholder_image(seed, "icon")
            print(f"  ✅ Updated avatar for '{guild.name}'")
        
        if guild.banner_url and 'unsplash' in guild.banner_url:
            guild.banner_url = get_placeholder_image(seed + 1, "banner")
            print(f"  ✅ Updated banner for '{guild.name}'")
    
    db.commit()
    
    print(f"\n✅ Successfully updated {len(guilds)} guilds with working image URLs!")


if __name__ == "__main__":
    main()
