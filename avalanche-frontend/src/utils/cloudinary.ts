/**
 * Cloudinary utility functions
 */

const CLOUDINARY_CLOUD_NAME = 'dmesxfbef';

/**
 * Generate a Cloudinary placeholder image URL based on category
 */
export const getPlaceholderImage = (category?: string | null, width = 400, height = 300): string => {
  // Map categories to relevant placeholder images
  const categoryImages: { [key: string]: string } = {
    'food': 'samples/food/pot-mussels',
    'electronics': 'samples/bike',
    'fashion': 'samples/shoe',
    'home': 'samples/chair',
    'gaming': 'samples/bike',
    'books': 'samples/outdoor-fashion',
    'toys': 'samples/balloons',
    'sports': 'samples/bike',
    'art': 'samples/landscapes/beach-boat',
  };

  // Get the image for the category, or use a default
  const categoryKey = category?.toLowerCase() || 'default';
  const imagePath = categoryImages[categoryKey] || 'samples/food/pot-mussels';

  // Generate Cloudinary URL with transformations
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_${width},h_${height},g_auto/${imagePath}.jpg`;
};

/**
 * Get product image URL - returns actual image if available, otherwise returns placeholder
 */
export const getProductImageUrl = (imageUrl?: string | null, category?: string | null, width = 400, height = 300): string => {
  if (imageUrl) {
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a Cloudinary path, construct the full URL
    if (imageUrl.includes('cloudinary')) {
      return imageUrl;
    }
    // Otherwise assume it's a local path and return it
    return imageUrl;
  }
  
  // No image URL, return placeholder
  return getPlaceholderImage(category, width, height);
};

/**
 * Get optimized Cloudinary URL with transformations
 */
export const getOptimizedImageUrl = (imageUrl: string, width = 400, height = 300, quality = 'auto'): string => {
  // If it's not a Cloudinary URL, return as is
  if (!imageUrl.includes('cloudinary.com')) {
    return imageUrl;
  }

  // Add optimization parameters
  const transformations = `c_fill,w_${width},h_${height},q_${quality},f_auto`;
  
  // Insert transformations into URL
  return imageUrl.replace('/upload/', `/upload/${transformations}/`);
};
