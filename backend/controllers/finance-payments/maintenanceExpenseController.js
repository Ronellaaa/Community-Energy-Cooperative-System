import mongoose from "mongoose";
import FundService from "../../services/finance-payments/financeService.js";
import MaintenanceExpense from "../../model/finance-payments/maintenanceExpenseModel.js";

export const createMaintenanceExpense = async (req, res) => {
  try {
    const { projectId, amount, date, category, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Project ID" });
    }
    const amt = Number(amount);

    if (!Number.isFinite(amount) || amt <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be a positive number" });
    }
    const expense = await MaintenanceExpense.create({
      projectId,
      amount: amt,
      date: date ? new Date(date) : new Date(),
      category,
      description,
      createdBy: req.user._id,
    });
    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const getProjectMaintenanceExpenses = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Project ID" });
    }

    const getMaintenanceExpenses =
      await FundService.getProjectMaintenanceExpenses(projectId);
    return res
      .status(200)
      .json({ success: true, data: getMaintenanceExpenses });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMaintenanceExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectId, amount, date, category, description } = req.body;

    const maintenanceExpense = await MaintenanceExpense.findById(id);
    if (!maintenanceExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Maintenance Expense not found" });
    }
    const updateData = {};

    if (projectId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(projectId))
        return res
          .status(400)
          .json({ success: false, message: "Invalid Project ID" });

      updateData.projectId = projectId;
    }
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
    if (date !== undefined) updateData.date = new Date(date);
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;

    const updatedExpense = await MaintenanceExpense.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true },
    );
    return res.status(200).json({ success: true, data: updatedExpense });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMaintenanceExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenanceExpense = await MaintenanceExpense.findById(id);
    if (!maintenanceExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Maintenance Expense not found" });
    }

    await MaintenanceExpense.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ success: true, message: "Maintenance Expense deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
