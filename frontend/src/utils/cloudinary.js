/**
 * Cloudinary Image Delivery & Dynamic Optimization Utility
 * 
 * Automatically applies Cloudinary transformations:
 * - f_auto: Serves modern formats (AVIF / WebP) based on browser support
 * - q_auto: Intelligent content-aware compression with zero visible loss
 * - w_{width},c_limit: Responsive resizing so 20MB images are reduced to ~80KB
 */

let dynamicCloudName = '';

/**
 * Configure the Cloud Name dynamically at runtime (e.g. from backend API)
 */
export function setCloudinaryCloudName(name) {
  if (name && typeof name === 'string') {
    dynamicCloudName = name.trim();
  }
}

/**
 * Get active Cloudinary Cloud Name (from Vite env or dynamic setting)
 */
export function getCloudinaryCloudName() {
  const envName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (envName && envName.trim() && !envName.includes('your_cloud_name')) {
    return envName.trim();
  }
  return dynamicCloudName;
}

/**
 * Generate an ultra-fast Cloudinary CDN URL with automatic optimizations
 * 
 * @param {string} src - Image path (e.g. '/gallery/6.jpg' or remote URL)
 * @param {object} options - Transformation options ({ width, quality, format, crop })
 * @returns {string} Optimized image URL (or original fallback if Cloudinary is not configured)
 */
export function getOptimizedImageUrl(src, options = {}) {
  if (!src) return '';

  const cloudName = getCloudinaryCloudName();

  // If no Cloudinary Cloud Name configured yet, fallback to original local asset path
  if (!cloudName) {
    return src;
  }

  const {
    width,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
  } = options;

  // Build transformation string (e.g. "f_auto,q_auto,w_800,c_limit")
  const transformations = [
    `f_${format}`,
    `q_${quality}`,
  ];

  if (width) {
    transformations.push(`w_${width}`);
    transformations.push(`c_${crop}`);
  }

  const transStr = transformations.join(',');

  // If src is already a Cloudinary URL, inject transformations
  if (src.includes('res.cloudinary.com')) {
    if (src.includes('/image/upload/')) {
      return src.replace('/image/upload/', `/image/upload/${transStr}/`);
    }
    return src;
  }

  // If src is an external URL, use Cloudinary Fetch API
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return `https://res.cloudinary.com/${cloudName}/image/fetch/${transStr}/${encodeURIComponent(src)}`;
  }

  // Local assets (e.g. '/gallery/6.jpg', '/gallery/tt.png', '/assets/crowd_art.jpg')
  // Clean path and build public_id under 'colorido2026/' namespace
  let cleanPath = src.startsWith('/') ? src.slice(1) : src;
  
  // Extract filename without extension for clean public ID
  const parts = cleanPath.split('/');
  const filename = parts.pop();
  const folder = parts.join('/'); // e.g. "gallery" or "assets"
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  const publicId = `colorido2026/${folder ? `${folder}/` : ''}${nameWithoutExt}`;

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transStr}/${publicId}`;
}

export default getOptimizedImageUrl;
