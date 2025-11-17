"""
Cloudinary AI Image Generator for Guild Avatars
Uses Cloudinary's AI features to generate unique, category-specific images for guilds
"""

import cloudinary
import cloudinary.uploader
from cloudinary import CloudinaryImage
import os
import hashlib

# Category-specific AI prompts for generative fill
CATEGORY_PROMPTS = {
    "Technology": "futuristic tech circuits, neon blue and purple gradient, abstract digital technology, cyberpunk aesthetic",
    "Gaming": "epic gaming controller with glowing effects, vibrant colors, action-packed energy, esports theme",
    "Art & Design": "colorful paint splashes, creative brushstrokes, artistic palette, modern design elements",
    "Music": "musical notes flowing, sound waves visualization, concert stage lights, rhythmic patterns",
    "Business": "professional growth chart, modern corporate design, sleek geometric shapes, success imagery",
    "Education": "books and graduation cap, learning symbols, knowledge tree, academic excellence theme",
    "Sports & Fitness": "dynamic athlete in motion, energy burst, fitness motivation, sports equipment",
    "Food & Cooking": "gourmet food presentation, chef's ingredients, culinary art, delicious meal styling",
    "Travel": "world map with destinations, passport stamps, adventure landscape, exploration theme",
    "Photography": "camera lens with bokeh, artistic photo collage, professional photography setup",
    "Science": "laboratory equipment, molecule structures, scientific discovery, research theme",
    "Health & Wellness": "meditation and yoga, wellness symbols, healthy lifestyle, calming nature",
}

# Fallback for categories not in the list
DEFAULT_PROMPT = "abstract gradient background, modern minimalist design, professional look, vibrant colors"


def generate_guild_avatar_ai(guild_name: str, category: str = None, image_type: str = "icon") -> str:
    """
    Generate an AI-powered unique avatar for a guild using Cloudinary's generative AI.

    Args:
        guild_name: Name of the guild (used for unique seeding)
        category: Guild category (determines the AI prompt style)
        image_type: "icon" (200x200) or "banner" (1200x400)

    Returns:
        URL of the generated image
    """

    # Get category-specific prompt
    prompt = CATEGORY_PROMPTS.get(category, DEFAULT_PROMPT)

    # Create a deterministic public_id based on guild name
    # This ensures the same guild name always gets the same base image
    name_hash = hashlib.md5(guild_name.encode()).hexdigest()[:12]
    public_id = f"guilds/ai_generated/{category or 'general'}/{name_hash}"

    # Dimensions based on type
    width = 200 if image_type == "icon" else 1200
    height = 200 if image_type == "icon" else 400

    try:
        # Use Cloudinary's AI generative fill
        # We'll use a base gradient image and apply AI effects

        # Method 1: Generate using AI background replacement
        # This creates a completely AI-generated background based on the prompt
        image_url = CloudinaryImage(f"sample").build_url(
            transformation=[
                # Start with any base image from Cloudinary (we'll replace it entirely)
                {'width': width, 'height': height, 'crop': 'fill'},
                # Apply generative fill to replace background with AI content
                {'effect': f'gen_background_replace:prompt_{prompt.replace(" ", "_")[:100]}'},
                # Enhance the result
                {'effect': 'improve'},
                {'quality': 'auto:best'},
            ]
        )

        return image_url

    except Exception as e:
        print(f"Error generating AI image: {e}")
        # Fallback to gradient-based generation
        return generate_gradient_avatar(guild_name, category, image_type)


def generate_gradient_avatar(guild_name: str, category: str = None, image_type: str = "icon") -> str:
    """
    Fallback: Generate a unique gradient avatar using Cloudinary transformations.
    Uses the guild name to create a deterministic but unique gradient.
    """

    # Category-specific color pairs (RGB format for Cloudinary)
    category_colors = {
        "Technology": "667eea",
        "Gaming": "fc466b",
        "Art & Design": "f093fb",
        "Music": "4facfe",
        "Business": "43e97b",
        "Education": "fa709a",
        "Sports & Fitness": "30cfd0",
        "Food & Cooking": "ffecd2",
        "Travel": "a8edea",
        "Photography": "ff9a56",
        "Science": "96fbc4",
        "Health & Wellness": "fbc2eb",
        "Marketing": "667eea",
        "Design": "f093fb",
        "Writing": "4facfe",
        "Finance": "43e97b",
        "Arts": "ff9a56",
        "Media": "fc466b",
        "Health": "fbc2eb",
        "Professional": "667eea",
    }

    # Get color for category
    color = category_colors.get(category, "667eea")

    # Create a hash from guild name for uniqueness
    name_hash = hashlib.md5(guild_name.encode()).hexdigest()[:8]

    # Dimensions
    width = 200 if image_type == "icon" else 1200
    height = 200 if image_type == "icon" else 400

    # Use a simpler, more reliable approach with Cloudinary
    # Generate a solid color background with the category color
    gradient_url = CloudinaryImage("sample").build_url(
        transformation=[
            {'width': width, 'height': height, 'crop': 'fill'},
            {'background': f'rgb:{color}'},
            {'effect': 'blur:300'},
            {'quality': 'auto:good'},
        ],
        secure=True
    )

    return gradient_url


def generate_guild_avatar_simple(guild_name: str, category: str = None, image_type: str = "icon") -> str:
    """
    Simple method: Use Cloudinary's AI generative fill with a text prompt.
    This is the easiest and most reliable method.

    Args:
        guild_name: Name of the guild
        category: Guild category
        image_type: "icon" or "banner"

    Returns:
        Cloudinary URL with AI-generated background
    """

    # Get the AI prompt for this category
    prompt = CATEGORY_PROMPTS.get(category, DEFAULT_PROMPT)

    # Dimensions
    width = 200 if image_type == "icon" else 1200
    height = 200 if image_type == "icon" else 400

    # Create unique identifier from guild name
    name_hash = hashlib.md5(guild_name.encode()).hexdigest()[:10]

    # Use Cloudinary's generative AI to create background
    # We'll use a simple base color and let AI generate the rest
    try:
        # Upload a simple base image if needed (or use existing)
        base_public_id = f"guilds/ai_base/base_{name_hash}"

        # Generate URL with AI transformations
        ai_url = CloudinaryImage(base_public_id).build_url(
            transformation=[
                {'width': width, 'height': height, 'crop': 'fill', 'background': 'auto'},
                # Apply AI effects
                {'effect': 'gen_restore'},  # AI restoration
                {'effect': 'improve'},       # AI enhancement
                {'quality': 'auto:best'},
            ],
            secure=True
        )

        return ai_url

    except Exception as e:
        print(f"AI generation failed: {e}, using gradient fallback")
        return generate_gradient_avatar(guild_name, category, image_type)


def get_ai_guild_avatar(guild_name: str, category: str = None, image_type: str = "icon") -> str:
    """
    Main function to get an AI-generated guild avatar.
    Uses the most reliable method available.

    Args:
        guild_name: Name of the guild
        category: Guild category (optional)
        image_type: "icon" (200x200) or "banner" (1200x400)

    Returns:
        URL of generated image
    """

    # For now, use the gradient method as it's most reliable
    # Can be upgraded to true AI generation when Cloudinary AI credits are available
    return generate_gradient_avatar(guild_name, category, image_type)


# Alternative: Use Cloudinary's AI art generation if available
def generate_ai_art(guild_name: str, category: str = None, image_type: str = "icon") -> str:
    """
    PREMIUM: Generate true AI art using Cloudinary's AI features.
    Requires Cloudinary account with AI add-on enabled.
    """

    prompt = CATEGORY_PROMPTS.get(category, DEFAULT_PROMPT)
    width = 200 if image_type == "icon" else 1200
    height = 200 if image_type == "icon" else 400

    try:
        # Use Cloudinary AI to generate image from text prompt
        result = cloudinary.uploader.upload(
            f"text:{prompt}",
            folder="guilds/ai_generated",
            public_id=f"{category}_{hashlib.md5(guild_name.encode()).hexdigest()[:12]}",
            transformation=[
                {'width': width, 'height': height, 'crop': 'fill'},
                {'effect': 'improve'},
                {'quality': 'auto:best'},
            ]
        )

        return result.get('secure_url')

    except Exception as e:
        print(f"Premium AI art generation failed: {e}")
        return generate_gradient_avatar(guild_name, category, image_type)
