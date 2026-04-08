//money recorded for a specific project
import mongoose from "mongoose";

const fundingRecorrdSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundingSource",
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["PENDING", "RECEIVED", "REJECTED"],
      default: "PENDING",
    },
    date: { type: Date, default: Date.now },
    note: {
      type: String,
      maxlength: 500,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const FundingRecord = mongoose.model("FundingRecord", fundingRecorrdSchema);

export default FundingRecord;
