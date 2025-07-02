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
 * @param {string} url - The photo URL to format
 * @returns {string} - The formatted URL
 */
export const formatPhotoUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_URL || ''}${url}`;
}; 