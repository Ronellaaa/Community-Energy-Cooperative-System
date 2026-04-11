import PaymentSlip from '../../model/feature-3/PaymentSlip.js';
import MemberConsumption from '../../model/feature-3/MemberConsumption.js';
import { uploadToCloudinary, deleteFromCloudinary } from './handleImgService.js';

/**
 * Member Payment Slip Service - Following Single Responsibility Principle
 * Handles member-side payment slip operations (create, update, delete)
 * Separated from admin payment slip operations (approve/reject)
 */

const MEMBER_EDITABLE_SLIP_STATUSES = ["pending", "rejected"];

const canMemberEditPaymentSlip = (status) =>
  MEMBER_EDITABLE_SLIP_STATUSES.includes(status);

// CREATE PAYMENT SLIP (CALLED FROM MEMBER CONTROLLER)
export const createPaymentSlip = async (paymentSlipData, file, authenticatedUserId) => {
  if (!file) {
    throw new Error("Payment slip image is required");
  }

  const {
    memberConsumptionId,
    amountPaid,
    paymentDate,
    referenceNumber,
    payerName,
    notes,
  } = paymentSlipData;

  if (!memberConsumptionId) {
    throw new Error("memberConsumptionId is required");
  }

  // Resolve member consumption ID
  const resolvedConsumptionId = memberConsumptionId.startsWith('MC-')
    ? memberConsumptionId.substring(3)
    : memberConsumptionId;

  // Get member consumption record
  const memberConsumption = await MemberConsumption.findById(resolvedConsumptionId);
  if (!memberConsumption) {
    throw new Error("Member consumption record not found");
  }

  // Validate user ID from the authenticated session
  if (!authenticatedUserId) {
    throw new Error("userId is required");
  }

  const resolvedUserId = authenticatedUserId;

  // Validate amount paid
  if (!amountPaid || amountPaid <= 0) {
    throw new Error("Amount paid must be greater than 0");
  }

  // Validate payment date
  if (!paymentDate) {
    throw new Error("Payment date is required");
  }

  // Validate reference number
  if (!referenceNumber?.trim()) {
    throw new Error("Reference number is required");
  }

  // Validate payer name
  if (!payerName?.trim()) {
    throw new Error("Payer name is required");
  }

  // Upload image to Cloudinary
  const slipImage = await uploadToCloudinary(file, "payment-slips");

  // Create payment slip
  const paymentSlip = await PaymentSlip.create({
    memberConsumptionId: resolvedConsumptionId,
    userId: resolvedUserId,
    memberId: memberConsumption.memberId,
    communityId: memberConsumption.communityId,
    billingPeriod: memberConsumption.billingPeriod,
    amountPaid: Number(amountPaid),
    paymentDate: new Date(paymentDate),
    referenceNumber: referenceNumber.trim(),
    payerName: payerName.trim(),
    notes: notes?.trim() || undefined,
    slipImage,
    status: "pending",
  });

  return paymentSlip;
};

// UPDATE PAYMENT SLIP (CALLED FROM MEMBER CONTROLLER)
export const updatePaymentSlip = async (id, updateData, file, userId) => {
  // Find existing payment slip by ID first
  const existingPaymentSlip = await PaymentSlip.findById(id);
  
  if (!existingPaymentSlip) {
    const error = new Error('Payment slip not found');
    error.status = 404;
    throw error;
  }

  // Members can correct slips that are still under review or explicitly rejected.
  if (!canMemberEditPaymentSlip(existingPaymentSlip.status)) {
    const error = new Error('Payment slip can only be updated when status is pending or rejected');
    error.status = 400;
    throw error;
  }

  // Validate user ownership
  if (!userId) {
    const error = new Error('User ID is required');
    error.status = 400;
    throw error;
  }

  if (String(existingPaymentSlip.userId) !== String(userId)) {
    const error = new Error('You can only update your own payment slips');
    error.status = 403;
    throw error;
  }

  // Handle new image upload
  if (file) {
    // Delete old image from Cloudinary if exists
    if (existingPaymentSlip.slipImage && existingPaymentSlip.slipImage.publicId) {
      await deleteFromCloudinary(existingPaymentSlip.slipImage.publicId);
    }
    
    // Upload new image
    updateData.slipImage = await uploadToCloudinary(file, "payment-slips");
  }

  // Validate amount paid if provided
  if (updateData.amountPaid !== undefined) {
    if (!updateData.amountPaid || updateData.amountPaid <= 0) {
      throw new Error("Amount paid must be greater than 0");
    }
    updateData.amountPaid = Number(updateData.amountPaid);
  }

  // Validate payment date if provided
  if (updateData.paymentDate !== undefined) {
    if (!updateData.paymentDate) {
      throw new Error("Payment date is required");
    }
    updateData.paymentDate = new Date(updateData.paymentDate);
  }

  // Validate reference number if provided
  if (updateData.referenceNumber !== undefined) {
    if (!updateData.referenceNumber?.trim()) {
      throw new Error("Reference number is required");
    }
    updateData.referenceNumber = updateData.referenceNumber.trim();
  }

  // Validate payer name if provided
  if (updateData.payerName !== undefined) {
    if (!updateData.payerName?.trim()) {
      throw new Error("Payer name is required");
    }
    updateData.payerName = updateData.payerName.trim();
  }

  // Clean up notes if provided
  if (updateData.notes !== undefined) {
    updateData.notes = updateData.notes?.trim() || undefined;
  }

  // Use provided userId
  updateData.userId = userId;

  // A corrected rejected slip becomes a fresh submission for admin review.
  if (existingPaymentSlip.status === "rejected") {
    updateData.status = "pending";
    updateData.rejectionReason = null;
    updateData.reviewedBy = null;
    updateData.reviewedAt = null;
  }

  const updatedPaymentSlip = await PaymentSlip.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedPaymentSlip;
};

// DELETE PAYMENT SLIP (CALLED FROM MEMBER CONTROLLER)
export const deletePaymentSlip = async (id, userId) => {
  // Find existing payment slip
  const paymentSlip = await PaymentSlip.findById(id);
  
  if (!paymentSlip) {
    const error = new Error('Payment slip not found');
    error.status = 404;
    throw error;
  }

  // CHECK IF PAYMENT SLIP STATUS IS PENDING
  if (paymentSlip.status !== 'pending') {
    const error = new Error('Payment slip can only be deleted when status is pending');
    error.status = 400;
    throw error;
  }

  // Validate user ownership
  if (!userId) {
    const error = new Error('User ID is required');
    error.status = 400;
    throw error;
  }

  if (String(paymentSlip.userId) !== String(userId)) {
    const error = new Error('You can only delete your own payment slips');
    error.status = 403;
    throw error;
  }

  // Delete image from Cloudinary if exists
  if (paymentSlip.slipImage && paymentSlip.slipImage.publicId) {
    await deleteFromCloudinary(paymentSlip.slipImage.publicId);
  }

  // Delete payment slip record
  await PaymentSlip.findByIdAndDelete(id);

  return paymentSlip;
};

// GET MEMBER'S PAYMENT SLIPS (CALLED FROM MEMBER CONTROLLER)
export const getMemberPaymentSlips = async (filters = {}, userId) => {
  const { status, memberConsumptionId } = filters;
  
  if (!userId) {
    throw new Error("User ID is required");
  }

  const query = { userId };

  if (status) {
    query.status = status;
  }

  if (memberConsumptionId) {
    const resolvedConsumptionId = memberConsumptionId.startsWith('MC-')
      ? memberConsumptionId.substring(3)
      : memberConsumptionId;
    query.memberConsumptionId = resolvedConsumptionId;
  }

  return await PaymentSlip.find(query)
    .sort({ createdAt: -1 })
    .lean();
};

// GET SINGLE PAYMENT SLIP BY ID (CALLED FROM MEMBER CONTROLLER)
export const getPaymentSlipById = async (id, userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const paymentSlip = await PaymentSlip.findOne({
    _id: id,
    userId
  });

  if (!paymentSlip) {
    const error = new Error('Payment slip not found');
    error.status = 404;
    throw error;
  }

  return paymentSlip;
};
