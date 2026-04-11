import fs from 'fs';
import {
  createPaymentSlip,
  updatePaymentSlip,
  deletePaymentSlip,
  getMemberPaymentSlips,
  getPaymentSlipById
} from '../../service/feature-3/member.payment.slip.service.js';

/**
 * Member Payment Slip Controller - Following Single Responsibility Principle
 * Handles member-side payment slip operations (create, update, delete, read)
 * Separated from admin payment slip operations (approve/reject)
 */

// CREATE PAYMENT SLIP - POST (BY THE MEMBER)
export const createMemberPaymentSlip = async (req, res) => {
  try {
    const uploadedFile = getUploadedFile(req);
    const paymentSlipData = req.body.paymentSlipData
      ? JSON.parse(req.body.paymentSlipData)
      : req.body;

    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const paymentSlip = await createPaymentSlip(
      paymentSlipData,
      uploadedFile,
      userId,
    );

    res.status(201).json({
      success: true,
      message: "Payment slip uploaded successfully",
      data: paymentSlip,
    });
  } catch (error) {
    console.error("Error creating payment slip:", error);

    const uploadedFile = getUploadedFile(req);
    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PAYMENT SLIP - PUT (BY THE MEMBER)
export const updateMemberPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;
    const uploadedFile = getUploadedFile(req);
    const updateData = req.body.paymentSlipData
      ? JSON.parse(req.body.paymentSlipData)
      : req.body;

    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const updatedPaymentSlip = await updatePaymentSlip(
      id,
      updateData,
      uploadedFile,
      userId,
    );

    res.status(200).json({
      success: true,
      message: "Payment slip updated successfully",
      data: updatedPaymentSlip,
    });
  } catch (error) {
    console.error("Error updating payment slip:", error);

    const uploadedFile = getUploadedFile(req);
    if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE PAYMENT SLIP - DELETE (BY THE MEMBER)
export const deleteMemberPaymentSlip = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const deletedPaymentSlip = await deletePaymentSlip(id, userId);

    res.status(200).json({
      success: true,
      message: "Payment slip deleted successfully",
      data: deletedPaymentSlip,
    });
  } catch (error) {
    console.error("Error deleting payment slip:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// GET MEMBER'S PAYMENT SLIPS - GET (BY THE MEMBER)
export const getMemberPaymentSlipsController = async (req, res) => {
  try {
    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { status, memberConsumptionId } = req.query;
    const filters = {};

    if (status) {
      filters.status = status;
    }

    if (memberConsumptionId) {
      filters.memberConsumptionId = memberConsumptionId;
    }

    const paymentSlips = await getMemberPaymentSlips(filters, userId);

    res.status(200).json({
      success: true,
      data: paymentSlips,
      count: paymentSlips.length,
    });
  } catch (error) {
    console.error("Error fetching member payment slips:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE PAYMENT SLIP BY ID - GET (BY THE MEMBER)
export const getMemberPaymentSlipById = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = getAuthenticatedUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const paymentSlip = await getPaymentSlipById(id, userId);

    res.status(200).json({
      success: true,
      data: paymentSlip,
    });
  } catch (error) {
    console.error("Error fetching payment slip:", error);
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Helper function to get uploaded file from request
const getUploadedFile = (req) => {
  if (req.file?.path) {
    return req.file;
  }

  if (req.files && Object.keys(req.files).length > 0) {
    for (const fileKey of Object.keys(req.files)) {
      const fileGroup = req.files[fileKey];

      if (Array.isArray(fileGroup)) {
        const firstValidFile = fileGroup.find((file) => file?.path);
        if (firstValidFile) {
          return firstValidFile;
        }
      }

      if (fileGroup?.path) {
        return fileGroup;
      }
    }
  }

  return null;
};

const getAuthenticatedUserId = (req) =>
  req.user?._id || req.user?.id || req.headers['x-user-id'];
