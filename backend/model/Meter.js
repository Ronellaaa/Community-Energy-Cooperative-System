import mongoose from "mongoose";

const MeterSchema = new mongoose.Schema(
  {
    meterNumber: { type: String, required: true, unique: true, trim: true, index: true },
    provider: { type: String, enum: ["CEB", "LECO", "OTHER"], default: "CEB" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Meter", MeterSchema);