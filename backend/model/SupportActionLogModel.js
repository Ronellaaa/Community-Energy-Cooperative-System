import mongoose from "mongoose";

const { Schema } = mongoose;

const supportActionLogSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doneAt: { type: Date, default: Date.now },
  doneBy: { type: String, required: true },
  actionType: {
    type: String,
    enum: ["application_review", "risk_assessment", "relief_distribution"],
    required: true,
  },
  notes: String,
});

const SupportActionLog = mongoose.model(
  "SupportActionLog",
  supportActionLogSchema,
);

export default SupportActionLog;
