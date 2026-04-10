import fs from "fs";
import {
  createPaymentSlip as createPaymentSlipService,
  getAdminPaymentSlips as getAdminPaymentSlipsService,
  updatePaymentSlipStatus as updatePaymentSlipStatusService,
} from "../../service/feature-3/payment.slip.service.js";

const getUploadedFile = (req) => {
  if (req.file) return req.file;
  if (!req.files) return null;
  return (
    req.files.slipImage?.[0] ||
    req.files.paymentSlip?.[0] ||
    req.files.image?.[0] ||
    req.files.file?.[0] ||
    null
  );
};

export const createPaymentSlip = async (req, res) => {
  try {
    const uploadedFile = getUploadedFile(req);
    const paymentSlipData = req.body.paymentSlipData
      ? JSON.parse(req.body.paymentSlipData)
      : req.body;

    const paymentSlip = await createPaymentSlipService(
      paymentSlipData,
      uploadedFile,
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

export const getAdminPaymentSlips = async (req, res) => {
  try {
    const { status } = req.query;

    if (status && !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be pending, approved, or rejected",
      });
    }

    const paymentSlips = await getAdminPaymentSlipsService({ status });

    res.json({
      success: true,
      count: paymentSlips.length,
      data: paymentSlips,
    });
  } catch (error) {
    console.error("Error fetching payment slips:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePaymentSlipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be approved or rejected",
      });
    }

    const result = await updatePaymentSlipStatusService(id, {
      status,
      rejectionReason,
      reviewedBy: reviewedBy || "admin",
    });

    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error updating payment slip status:", error);

    const badRequestMessages = [
      "Payment slip not found",
      "Member consumption record not found",
      "Rejection reason is required when rejecting a payment slip",
    ];

    if (
      badRequestMessages.includes(error.message) ||
      error.message.startsWith("Payment slip amount must match the amount owed exactly") ||
      error.message.startsWith("Approved payment amount must match the amount owed exactly")
    ) {
      return res.status(
        error.message === "Payment slip not found" ? 404 : 400,
      ).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("already")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
