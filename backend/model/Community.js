import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isArchived: { type: Boolean, default: false },

    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Community", communitySchema);