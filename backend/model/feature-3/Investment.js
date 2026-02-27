import mongoose from "mongoose";

const InvestmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DemoUser",
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DemoProject",
    required: true
  },
  investedAmount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ["INVESTOR", "MEMBERSHIP_FEE"], // differentiate contribution types
    default: "INVESTOR",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Investment", InvestmentSchema);
