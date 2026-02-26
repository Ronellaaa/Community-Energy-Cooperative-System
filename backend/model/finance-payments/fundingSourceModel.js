//FundingSource (where money comes from) - Government / NGO / Loan / Community Fund
import mongoose from "mongoose";

const fundingSourceSchema = new mongoose.Schema(
  {
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const FundingSource = mongoose.model("FundingSource", fundingSourceSchema);

export default FundingSource;
