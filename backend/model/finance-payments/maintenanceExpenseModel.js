//money spent for repairs
import mongoose from "mongoose";

const maintenanceExpensesSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    amount: Number,
    date: String,
    category: {
      type: String,
      enum: ["REPAIR", "SERVICE", "REPLACEMENT", "OTHER"],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MaintenanceExpense = mongoose.model(
  "MaintenanceExpense",
  maintenanceExpensesSchema,
);

export default MaintenanceExpense;
