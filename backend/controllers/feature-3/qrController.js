import { generateAndUploadQR, getQRUrl } from '../../service/feature-3/qrService.js';

export const handleNewMember = async (req, res) => {
  try {
    const { memberId, communityId } = req.body;

    if (!memberId || !communityId) {
      return res.status(400).json({
        success: false,
        message: 'memberId and communityId are required',
      });
    }
    
    const qrUrl = await generateAndUploadQR(memberId, communityId);
    
    res.status(201).json({
      success: true,
      data: { qrUrl }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

export const getMemberQR = async (req, res) => {
  try {
    const { memberId, communityId } = req.params;

    if (!memberId || !communityId) {
      return res.status(400).json({
        success: false,
        message: 'memberId and communityId are required',
      });
    }
    
    const qrUrl = await getQRUrl(memberId, communityId);
    
    res.status(200).json({
      success: true,
      data: { qrUrl }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve QR code',
      error: error.message
    });
  }
};
