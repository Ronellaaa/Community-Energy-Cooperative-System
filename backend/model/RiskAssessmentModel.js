import mongoose from "mongoose";

const { Schema } = mongoose;

const riskAssesmentSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  monthYear: Date,
  riskLevel: { type: String, enum: ["Low", "Medium", "High"], required: true },
  score: { type: Number, required: true },
  reasons: [{ type: String }],
});
const RiskAssesment = mongoose.model("RiskAssesment", riskAssesmentSchema);

export default RiskAssesment;
