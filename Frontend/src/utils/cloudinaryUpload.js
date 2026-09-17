import axios from 'axios';
import api from '../services/api';
import imageCompression from 'browser-image-compression';

/**
 * Cloudinary Direct Upload Utility
 * Uploads files directly to Cloudinary using a secure signature from our backend.
 * This prevents the backend from handling heavy file bytes.
 */

/**
 * Upload a file directly to Cloudinary
 * @param {File} file - The file object to upload
 * @param {string} folder - Target folder in Cloudinary
 * @param {Function} onProgress - Progress callback (percent) => {}
 * @returns {Promise<string>} - The secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file, folder = 'appzeto', onProgress) => {
  try {
    // 0. Compress the image before uploading to avoid timeouts and file size limits
    let fileToUpload = file;
    if (file instanceof File && file.type && file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 0.8,            // Max size 800 KB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (cErr) {
        console.warn('Image compression failed, proceeding with original file:', cErr);
      }
    }

    // 1. Get signature from our backend
    // Use the generic /upload/sign-signature instead of /admin prefix to ensure User access
    const signResponse = await api.get(`/upload/sign-signature?folder=${folder}`);

    if (!signResponse.data.success) {
      throw new Error('Failed to get upload signature');
    }

    const { signature, timestamp, apiKey, cloudName } = signResponse.data;

    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);

    // 3. Upload directly to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const response = await axios.post(cloudinaryUrl, formData, {
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });

    // 4. Return the secure URL
    return response.data.secure_url;
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Unknown upload error';
    console.error('Cloudinary Direct Upload Error:', errorMsg, error);
    throw new Error(errorMsg);
  }
};

export default uploadToCloudinary;
