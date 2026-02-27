import mongoose from "mongoose";

const MembershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },

    status: {
      type: String,
      enum: ["pending", "verified", "approved", "rejected"],
      default: "pending",
      index: true,
    },


    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", default: null },

    meterNumber: { type: String, trim: true, default: null },
    isLowIncome: { type: Boolean, default: false },

    rejectionReason: { type: String, trim: true, default: "" },

    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Membership", MembershipSchema);