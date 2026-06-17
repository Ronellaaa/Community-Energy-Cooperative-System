import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["MEMBER", "ADMIN", "INVESTOR"], default: "MEMBER" },
  totalInvestment: { type: Number, default: 0 }, // cumulative across all projects
  walletBalance: { type: Number, default: 0 },   // cumulative credits
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DemoUser", UserSchema);
