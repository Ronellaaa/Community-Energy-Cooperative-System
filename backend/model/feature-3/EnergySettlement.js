import mongoose from "mongoose";

const EnergySettlementSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },

  billingPeriod: {
    type: String,
    required: true // e.g. "2026-02"
  },

  totalEnergyProducedKWh: {
    type: Number,
    required: true
  },

  tariffRate: {
    type: Number,
    required: true
  },

  totalCredits: {
    type: Number,
    required: true
  },

  createdBy: {
    type: String,
    enum: ["system", "admin"],
    default: "system"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("EnergySettlement", EnergySettlementSchema);
