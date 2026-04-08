import FundingSource from "../../model/finance-payments/fundingSourceModel.js";
import mongoose from "mongoose";

export const createFundingSource = async (req, res) => {
  try {
    const { fundName, fundType, description, contactPhone, isActive } =
      req.body;

    const fundingSource = await FundingSource.create({
      fundName,
      fundType,
      description,
      contactPhone,
      isActive: isActive || false,
      createdBy: req.user._id,
    });

    return res.status(201).json({ success: true, data: fundingSource });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const listFundingSources = async (req, res) => {
  try {
    const fundingSources = await FundingSource.find().lean();
    return res.status(200).json({
      success: true,
      count: fundingSources.length,
      data: fundingSources,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch funding sources",
      error: error.message,
    });
  }
};

export const updateFundingSource = async (req, res) => {
  try {
    const { id } = req.params;
    const { fundName, fundType, description, contactPhone, isActive } =
      req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid funding source ID" });
    }

    const fundingSource = await FundingSource.findById(id);

    if (!fundingSource) {
      return res
        .status(404)
        .json({ success: false, message: "Funding source not found" });
    }

    const updatedData = {};

    if (fundName !== undefined) updatedData.fundName = fundName;
    if (fundType !== undefined) updatedData.fundType = fundType;
    if (description !== undefined) updatedData.description = description;
    if (contactPhone !== undefined) updatedData.contactPhone = contactPhone;
    if (isActive !== undefined) updatedData.isActive = isActive;

    const updatedFundingSource = await FundingSource.findByIdAndUpdate(
      id,
      updatedData,
      { new: true, runValidators: true },
    );

    if (!updatedFundingSource) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to update funding source" });
    }

    return res.status(200).json({ success: true, data: updatedFundingSource });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to update funding source",
    });
  }
};

export const deleteFundingSource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid funding source ID" });
    }

    const deletedFundingSource = await FundingSource.findByIdAndDelete(id);

    if (!deletedFundingSource) {
      return res
        .status(404)
        .json({ success: false, message: "Funding source not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Funding source deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to delete funding source",
    });
  }
};
