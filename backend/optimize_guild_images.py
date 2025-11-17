"""
Optimize guild images by reducing their size for faster loading
"""
import re
from database import get_db, Guild

def optimize_picsum_url(url: str, image_type: str = "banner") -> str:
    """
    Optimize Picsum Photos URLs by reducing size and removing blur
    """
    if not url or 'picsum.photos' not in url:
        return url
    
    # Extract the seed from the URL
    match = re.search(r'/seed/(\d+)/', url)
    if not match:
        return url
    
    seed = match.group(1)
    
    # Use smaller dimensions for faster loading
    width = 200 if image_type == "icon" else 800
    height = 200 if image_type == "icon" else 300
    
    # Create optimized URL without blur
    optimized_url = f"https://picsum.photos/seed/{seed}/{width}/{height}"
    
    return optimized_url


def main():
    db = next(get_db())
    
    # Get all guilds with Picsum URLs
    guilds = db.query(Guild).filter(
        Guild.banner_url.like('%picsum%')
    ).all()
    
    print(f"Found {len(guilds)} guilds with Picsum URLs to optimize")
    
    updated_count = 0
    for guild in guilds:
        if guild.avatar_url and 'picsum' in guild.avatar_url:
            old_url = guild.avatar_url
            guild.avatar_url = optimize_picsum_url(guild.avatar_url, "icon")
            if old_url != guild.avatar_url:
                print(f"  ✅ Optimized avatar for '{guild.name}' ({len(old_url)} → {len(guild.avatar_url)} chars)")
                updated_count += 1
        
        if guild.banner_url and 'picsum' in guild.banner_url:
            old_url = guild.banner_url
            guild.banner_url = optimize_picsum_url(guild.banner_url, "banner")
            if old_url != guild.banner_url:
                print(f"  ✅ Optimized banner for '{guild.name}' ({len(old_url)} → {len(guild.banner_url)} chars)")
                updated_count += 1
    
    db.commit()
    
    print(f"\n✅ Successfully optimized {updated_count} images!")
    print("   Smaller images = faster loading times!")


if __name__ == "__main__":
    main()
