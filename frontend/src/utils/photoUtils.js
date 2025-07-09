import axios from './axios';

/**
 * Uploads a photo to the server
 * @param {File} photo - The photo file to upload
 * @param {Object} metadata - Additional metadata for the photo
 * @param {string} metadata.location - Location of the photo
 * @param {string} metadata.description - Description of the photo
 * @param {string} metadata.content_type - Type of content (e.g., 'swppp', 'utility', etc.)
 * @param {number} metadata.object_id - ID of the related object
 * @returns {Promise<Object>} - The uploaded photo data
 */
export const uploadPhoto = async (photo, metadata = {}) => {
  try {
    console.log('Uploading photo with metadata:', metadata); // Debug log
    
    const formData = new FormData();
    formData.append('image', photo);
    formData.append('location', metadata.location || '');
    formData.append('description', metadata.description || '');
    formData.append('content_type', metadata.content_type || '');
    if (metadata.object_id) {
      formData.append('object_id', metadata.object_id);
    }

    console.log('Making API call to /api/photos/photos/'); // Debug log
    const response = await axios.post('/api/photos/photos/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Photo upload response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error uploading photo:', error);
    console.error('Error response:', error.response?.data); // Debug log
    throw new Error(`Failed to upload photo: ${error.response?.data?.detail || error.message}`);
  }
};

/**
 * Uploads multiple photos to the server
 * @param {File[]} photos - Array of photo files to upload
 * @param {Object} metadata - Additional metadata for the photos
 * @returns {Promise<Object[]>} - Array of uploaded photo data
 */
export const uploadMultiplePhotos = async (photos, metadata = {}) => {
  try {
    console.log('Uploading multiple photos:', photos.length, 'with metadata:', metadata); // Debug log
    
    const formData = new FormData();
    photos.forEach(photo => {
      formData.append('photos', photo);
    });
    formData.append('location', metadata.location || '');
    formData.append('description', metadata.description || '');
    formData.append('content_type', metadata.content_type || '');
    if (metadata.object_id) {
      formData.append('object_id', metadata.object_id);
    }

    console.log('Making API call to /api/photos/photos/bulk_upload/'); // Debug log
    const response = await axios.post('/api/photos/photos/bulk_upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Multiple photos upload response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error uploading photos:', error);
    console.error('Error response:', error.response?.data); // Debug log
    throw new Error(`Failed to upload photos: ${error.response?.data?.detail || error.message}`);
  }
};

/**
 * Gets photos for a specific content type and object
 * @param {string} content_type - Type of content
 * @param {number} object_id - ID of the related object
 * @returns {Promise<Object[]>} - Array of photo data
 */
export const getPhotos = async (content_type, object_id) => {
  try {
    const response = await axios.get('/api/photos/photos/', {
      params: {
        content_type,
        object_id,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw new Error('Failed to fetch photos');
  }
};

/**
 * Deletes a photo
 * @param {number} photoId - ID of the photo to delete
 * @returns {Promise<void>}
 */
export const deletePhoto = async (photoId) => {
  try {
    await axios.delete(`/api/photos/photos/${photoId}/`);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error('Failed to delete photo');
  }
};

/**
 * Formats a photo URL to ensure it's absolute
 * @param {string|Object} photo - The photo URL string or photo object
 * @returns {string} - The formatted URL
 */
export const formatPhotoUrl = (photo) => {
  // Handle null, undefined values
  if (!photo) {
    return '';
  }
  
  let url = '';
  
  // If it's a string, use it directly
  if (typeof photo === 'string') {
    url = photo;
  }
  // If it's an object, extract the URL from various possible properties
  else if (typeof photo === 'object') {
    // Try different possible URL properties in order of preference
    // Don't use photo.file directly as it's a File object, not a URL
    url = photo.url || photo.image_url || photo.image || photo.preview || '';
  }
  else {
    return '';
  }
  
  // Handle null, undefined, or empty string
  if (!url || typeof url !== 'string') {
    return '';
  }
  
  // Trim whitespace
  url = url.trim();
  
  // If already empty after trimming, return empty string
  if (!url) return '';
  
  // If already starts with http/https, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If starts with blob:, return as is (for local previews)
  if (url.startsWith('blob:')) {
    return url;
  }
  
  // If starts with //, add https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  
  // Otherwise, prepend the API URL
  const apiUrl = import.meta.env.VITE_API_URL || '';
  return `${apiUrl}${url}`;
};

/**
 * Converts a blob URL to a base64 data URL
 * @param {string} blobUrl - The blob URL to convert
 * @returns {Promise<string>} - The base64 data URL
 */
export const blobUrlToBase64 = async (blobUrl) => {
  try {
    if (!blobUrl || !blobUrl.startsWith('blob:')) {
      return blobUrl; // Return as is if not a blob URL
    }
    
    // For CSP-restricted environments, we'll skip the conversion
    // and let the photo upload handle it instead
    console.warn('Blob URL conversion skipped due to CSP restrictions:', blobUrl);
    return blobUrl; // Return original blob URL
    
    // Note: The photo upload process will handle converting the blob to a proper URL
  } catch (error) {
    console.error('Error converting blob URL to base64:', error);
    return blobUrl; // Return original if conversion fails
  }
};

/**
 * Converts all blob URLs in a photo array to base64 data URLs
 * @param {Array} photos - Array of photo objects
 * @returns {Promise<Array>} - Array of photo objects with base64 URLs
 */
export const convertPhotosToBase64 = async (photos) => {
  if (!Array.isArray(photos)) return photos;
  
  const convertedPhotos = await Promise.all(
    photos.map(async (photo) => {
      if (photo.url && photo.url.startsWith('blob:')) {
        const base64Url = await blobUrlToBase64(photo.url);
        return { ...photo, url: base64Url };
      }
      if (photo.preview && photo.preview.startsWith('blob:')) {
        const base64Url = await blobUrlToBase64(photo.preview);
        return { ...photo, preview: base64Url };
      }
      return photo;
    })
  );
  
  return convertedPhotos;
}; 