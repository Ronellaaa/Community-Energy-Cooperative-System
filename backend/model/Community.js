import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true }, // e.g. "Moratuwa"
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

communitySchema.index({ name: 1, location: 1 }, { unique: true });

export default mongoose.model("Community", communitySchema);