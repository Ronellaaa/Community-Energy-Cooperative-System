//FundingSource (where money comes from) - Government / NGO / Loan / Community Fund
import mongoose from "mongoose";

const fundingSourceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fundName: String,
  fundType: {
    type: String,
    enum: ["GRANT", "LOAN", "COMMUNITY FUND", "DONATION", "OTHER"],
    required: true,
  },
  description: String,
  contactPhone: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const FundingSource = mongoose.model("FundingSource", fundingSourceSchema);

export default FundingSource;