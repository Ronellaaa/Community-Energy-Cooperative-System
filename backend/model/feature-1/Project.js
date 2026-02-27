import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },

  type: {
    type: String,
    enum: ["Solar", "Wind", "Hydro"],
    required: true,
  },

  capacityKW: { type: Number, required: true },
  cost: { type: Number, required: true },

  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  }],

  expectedMonthlyGeneration: { type: Number, default: 0 },
  expectedMonthlySavings: { type: Number, default: 0 },
  totalFunding: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Active"],
    default: "Pending"
  }

}, { timestamps: true });

export default mongoose.model("Project", projectSchema);