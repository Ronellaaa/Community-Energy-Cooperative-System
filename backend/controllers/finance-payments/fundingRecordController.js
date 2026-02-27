import FinanceService from "../../services/finance-payments/financeService.js";
import FundingRecord from "../../model/finance-payments/fundingRecordModel.js";
import mongoose from "mongoose";

export const createFundingRecord = async (req, res) => {
  try {
    const { projectId, sourceId, amount, status, date, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Project ID is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Funding Source ID " });
    }
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be a positive number" });
    }

    const FundRecord = await FundingRecord.create({
      projectId,
      sourceId,
      amount: amt,
      status: status || "RECEIVED",
      date: date ? new Date(date) : new Date(),
      note,
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: FundRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getprojectFundingSummary = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Project ID" });
    }

    const record = await FinanceService.getProjectFundingSummary(projectId);
    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFundingRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, sourceId, amount, status, date, note } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Funding Record ID" });
    }

    const fundingRecord = await FundingRecord.findById(id);

    if (!fundingRecord) {
      return res
        .status(404)
        .json({ success: false, message: "Funding Record not found" });
    }

    const updateRecord = {};
    if (projectId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Project ID" });
      }
      updateRecord.projectId = projectId;
    }
    if (sourceId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(sourceId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Funding Source ID" });
      }
      updateRecord.sourceId = sourceId;
    }

    if (amount !== undefined) {
      const amt = Number(amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Amount must be a positive number",
          });
      }
      updateRecord.amount = amt;
    }
    if (status !== undefined) updateRecord.status = status;
    if (date !== undefined) updateRecord.date = new Date(date);
    if (note !== undefined) updateRecord.note = note;

    const updateFundingRecord = await FundingRecord.findByIdAndUpdate(
      id,
      updateRecord,
      { new: true, runValidators: true },
    );

    return res.status(200).json({ success: true, data: updateFundingRecord });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFundingRecord = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Funding Record ID" });
    }

    const fundingReord = await FundingRecord.findByIdAndDelete(id);

    if (!fundingReord) {
      return res
        .status(404)
        .json({ success: false, message: "Funding Record not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Funding Record deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
