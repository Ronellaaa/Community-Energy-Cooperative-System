import mongoose from "mongoose";
import CommunityBill from "../../model/feature-3/CommunityBill.js";
import MemberConsumption from "../../model/feature-3/MemberConsumption.js";
import PaymentSlip from "../../model/feature-3/PaymentSlip.js";
import { deleteFromCloudinary, uploadToCloudinary } from "./handleImgService.js";

const ensureObjectId = (value, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error(`${fieldName} is invalid`);
  }

  return new mongoose.Types.ObjectId(value);
};

const syncCommunityBillPaymentStatus = async ({
  communityId,
  billingPeriod,
}) => {
  const records = await MemberConsumption.find({
    communityId,
    "billingPeriod.month": billingPeriod.month,
    "billingPeriod.year": billingPeriod.year,
  });

  if (records.length === 0) {
    return null;
  }

  const allPaid = records.every((record) => record.paymentStatus === "paid");

  const communityBill = await CommunityBill.findOne({
    communityId,
    "billingPeriod.month": billingPeriod.month,
    "billingPeriod.year": billingPeriod.year,
  });

  if (!communityBill) {
    return null;
  }

  communityBill.paymentStatus = allPaid ? "paid" : "pending";
  await communityBill.save();

  return communityBill;
};

export const createPaymentSlip = async (paymentSlipData, file) => {
  if (!file) {
    throw new Error("Payment slip image is required");
  }

  const {
    memberConsumptionId,
    userId,
    amountPaid,
    paymentDate,
    referenceNumber,
    payerName,
    notes,
  } = paymentSlipData;

  if (!memberConsumptionId) {
    throw new Error("memberConsumptionId is required");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!amountPaid || Number(amountPaid) <= 0) {
    throw new Error("amountPaid must be greater than 0");
  }

  if (!paymentDate) {
    throw new Error("paymentDate is required");
  }

  if (!referenceNumber?.trim()) {
    throw new Error("referenceNumber is required");
  }

  if (!payerName?.trim()) {
    throw new Error("payerName is required");
  }

  const resolvedConsumptionId = ensureObjectId(
    memberConsumptionId,
    "memberConsumptionId",
  );
  const resolvedUserId = ensureObjectId(userId, "userId");

  const memberConsumption = await MemberConsumption.findById(
    resolvedConsumptionId,
  );

  if (!memberConsumption) {
    throw new Error("Member consumption record not found");
  }

  if (memberConsumption.paymentStatus !== "pending") {
    throw new Error("Payment slip can only be uploaded for pending payments");
  }

  if (String(memberConsumption.memberId) !== String(userId)) {
    throw new Error("This payment does not belong to the provided user");
  }

  const existingActiveSlip = await PaymentSlip.findOne({
    memberConsumptionId: resolvedConsumptionId,
    status: { $in: ["pending", "approved"] },
  }).sort({ createdAt: -1 });

  if (existingActiveSlip?.status === "pending") {
    throw new Error("A payment slip is already pending review for this record");
  }

  if (existingActiveSlip?.status === "approved") {
    throw new Error("A payment slip has already been approved for this record");
  }

  const slipImage = await uploadToCloudinary(file, "payment-slips");

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

export const getAdminPaymentSlips = async (filters = {}) => {
  const { status } = filters;
  const query = {};

  if (status) {
    query.status = status;
  }

  return await PaymentSlip.find(query)
    .sort({ createdAt: -1 })
    .lean();
};

export const updatePaymentSlipStatus = async (paymentSlipId, updateData) => {
  const { status, rejectionReason, reviewedBy = "admin" } = updateData;

  const paymentSlip = await PaymentSlip.findById(paymentSlipId);

  if (!paymentSlip) {
    throw new Error("Payment slip not found");
  }

  if (paymentSlip.status !== "pending" && paymentSlip.status !== status) {
    throw new Error(
      `Payment slip is already ${paymentSlip.status}. Cannot change to ${status}`,
    );
  }

  const memberConsumption = await MemberConsumption.findById(
    paymentSlip.memberConsumptionId,
  );

  if (!memberConsumption) {
    throw new Error("Member consumption record not found");
  }

  if (status === "approved") {
    paymentSlip.status = "approved";
    paymentSlip.rejectionReason = null;
    paymentSlip.reviewedBy = reviewedBy;
    paymentSlip.reviewedAt = new Date();
    await paymentSlip.save();

    memberConsumption.paymentStatus = "paid";
    memberConsumption.paidAmount = Number(paymentSlip.amountPaid || 0);
    await memberConsumption.save();

    await syncCommunityBillPaymentStatus({
      communityId: paymentSlip.communityId,
      billingPeriod: paymentSlip.billingPeriod,
    });

    return {
      message: "Payment slip approved successfully",
      data: paymentSlip,
    };
  }

  if (status === "rejected") {
    if (!rejectionReason?.trim()) {
      throw new Error(
        "Rejection reason is required when rejecting a payment slip",
      );
    }

    paymentSlip.status = "rejected";
    paymentSlip.rejectionReason = rejectionReason.trim();
    paymentSlip.reviewedBy = reviewedBy;
    paymentSlip.reviewedAt = new Date();
    await paymentSlip.save();

    memberConsumption.paymentStatus = "pending";
    memberConsumption.paidAmount = 0;
    await memberConsumption.save();

    await syncCommunityBillPaymentStatus({
      communityId: paymentSlip.communityId,
      billingPeriod: paymentSlip.billingPeriod,
    });

    return {
      message: "Payment slip rejected successfully",
      data: paymentSlip,
    };
  }

  throw new Error("Invalid payment slip status operation");
};

export const deletePaymentSlipAssets = async (paymentSlip) => {
  if (paymentSlip?.slipImage?.publicId) {
    await deleteFromCloudinary(paymentSlip.slipImage.publicId);
  }
};
