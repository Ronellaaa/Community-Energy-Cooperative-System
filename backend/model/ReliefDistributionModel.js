import mongoose from "mongoose";


const { Schema } = mongoose;

const reliefDistributionSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  monthYear: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reliefAmountLKR: Number,
  reliefType: {
    type: String,
    enum: ["extraCredit", "cashAid"],
  },

  approvedBy: String,
});
const ReliefDistribution = mongoose.model(
  "ReliefDistribution",
  reliefDistributionSchema,
);

export default ReliefDistribution;
