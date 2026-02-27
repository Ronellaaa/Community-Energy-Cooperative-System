import MemberPayment from "../../model/finance-payments/memberPaymentModel.js";
import mongoose from "mongoose";
import FundService from "../../services/finance-payments/financeService.js";

export const createMemberPayment = async (req, res) => {
  try {
    const {
      memberId,
      projectId,
      paymentType,
      method,
      amount,
      month,
      date,
      note,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Member ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Project ID" });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be a positive number" });
    }

    const memberPayment = await MemberPayment.create({
      memberId,
      projectId,
      paymentType,
      method,
      amount: amt,
      month,
      date: date ? new Date(date) : new Date(),
      note,
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: memberPayment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectMemberPayments = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Project ID" });
    }
    const payments = await FundService.getProjectMemberPayments(projectId);
    return res.status(200).json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const updateMemberPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      memberId,
      projectId,
      paymentType,
      method,
      amount,
      month,
      date,
      note,
    } = req.body;

    const memberPayment = await MemberPayment.findById(id);
    if (!memberPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Member Payment not found" });
    }
    const updateData = {};

    if (memberId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(memberId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Member ID" });
      }
      updateData.memberId = memberId;
    }
    if (projectId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Project ID" });
      }
      updateData.projectId = projectId;
    }
    if (paymentType !== undefined) updateData.paymentType = paymentType;
    if (method !== undefined) updateData.method = method;
    if (amount !== undefined) {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a positive number",
        });
      }
      updateData.amount = amt;
    }
    if (month !== undefined) updateData.month = month;
    if (date !== undefined) updateData.date = new Date(date);
    if (note !== undefined) updateData.note = note;

    const updatedPayment = await MemberPayment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );
    return res.status(200).json({ success: true, data: updatedPayment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMemberPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const memberPayment = await MemberPayment.findById(id);
    if (!memberPayment) {
      return res
        .status(404)
        .json({ success: false, message: "Member Payment not found" });
    }
    await MemberPayment.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Member Payment deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
