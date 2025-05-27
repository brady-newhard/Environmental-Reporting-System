import axios from './axios';

/**
 * Uploads a photo to the server
 * @param {File} photo - The photo file to upload
 * @returns {Promise<string>} - The URL of the uploaded photo
 */
export const uploadPhoto = async (photo) => {
  try {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await axios.post('/api/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.url;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('Failed to upload photo');
  }
};

/**
 * Deletes a photo from the server
 * @param {string} photoUrl - The URL of the photo to delete
 * @returns {Promise<void>}
 */
export const deletePhoto = async (photoUrl) => {
  try {
    await axios.delete(`/api/photos/delete`, {
      data: { url: photoUrl }
    });
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
  return `${process.env.REACT_APP_API_URL || ''}${url}`;
}; 