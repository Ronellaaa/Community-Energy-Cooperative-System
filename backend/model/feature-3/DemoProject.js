import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String
  },

  location: {
    type: String,
    required: true
  },

  projectType: {
    type: String,
    enum: ["SOLAR", "WIND", "HYDRO"],
    default: "SOLAR"
  },

  capacityKW: {
    type: Number,
    required: true // Max production capacity
  },

  tariffRate: {
    type: Number,
    required: true // Money per kWh (paid by CEB / grid)
  },

  totalEnergyProducedKWh: {
    type: Number,
    default: 0
  },

  totalCreditsGenerated: {
    type: Number,
    default: 0
  },

  totalInvestmentAmount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "COMPLETED"],
    default: "ACTIVE"
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("DemoProject", ProjectSchema);
