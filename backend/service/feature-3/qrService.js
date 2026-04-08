import QRCode from "qrcode"; //a library which provides methods to generate QR codes
import cloudinary from "cloudinary"; //a cloud service for storing and managing images, videos etc

// Function to generate a QR code for a member and upload it to Cloudinary
export const generateAndUploadQR = async (memberId, communityId) => {
  const qrContent = `${memberId}|${communityId}`;

  // Generate QR code as a buffer
  const qrBuffer = await QRCode.toBuffer(qrContent, {
    width: 300,
    margin: 2,
  });

  // Convert the QR code buffer to a base64 string and upload to Cloudinary
  const base64 = `data:image/png;base64,${qrBuffer.toString("base64")}`;

  // Upload the QR code image to Cloudinary under a specific folder and public ID
  const result = await cloudinary.uploader.upload(base64, {
    folder: `community_qrs/${communityId}`,
    public_id: memberId,
  });

  // Return the secure URL which includes meta data of the uploaded QR code image
  return result.secure_url;
};

// Function to retrieve the QR code URL for a member, or generate it if it doesn't exist
export const getQRUrl = async (memberId, communityId) => {
  try {
    // Try to get the QR code image from Cloudinary using the public ID
    const result = await cloudinary.api.resource(
      `community_qrs/${communityId}/${memberId}`,
    );
    // If found, return the secure URL of the existing QR code image
    return result.secure_url;
  } catch (error) {
    // If the QR code image is not found (e.g., 404 error), generate and upload a new QR code
    return await generateAndUploadQR(memberId, communityId);
  }
};
