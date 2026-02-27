import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "OFFICER", "USER"], default: "USER" },

    // becomes non-null when approved
    communityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default: null,
    },
    isArchived: { type: Boolean, default: false },

    walletBalance: {
    type: Number,
    default: 0,
    min: 0,
    required: false  // Making it optional so existing docs don't break
  },
  },
  
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
