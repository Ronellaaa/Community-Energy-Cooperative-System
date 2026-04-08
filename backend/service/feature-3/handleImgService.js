// services/uploadService.js
import cloudinary from '../../config/feature-3/cloudinary.js';
import fs from 'fs';

export const uploadToCloudinary = async (file, folder = 'electricity-bills') => {
  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    resource_type: 'auto'
  });
  
  // Delete local file after upload
  fs.unlinkSync(file.path);
  
  // Return formatted image data
  return {
    url: result.secure_url,
    publicId: result.public_id,
    filename: file.originalname,
    uploadDate: new Date()
  };
};

export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};