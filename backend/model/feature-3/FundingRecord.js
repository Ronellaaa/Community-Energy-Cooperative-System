//money recorded for a specific project
import mongoose from "mongoose";

const fundingRecorrdSchema = new mongoose.Schema({
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
  amount: Number,
  status: {
    type: String,
    enum: ["PENDING", "RECEIVED", "REJECTED"],
    default: "PENDING",
  },
  date: String,
  note: {
    type: String,
    maxlength: 500,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const FundingRecord = mongoose.model("FundingRecord", fundingRecorrdSchema);

export default FundingRecord;