import mongoose from "mongoose";

const { Schema } = mongoose;

const benificiaryApplicationSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  reason: { type: String, trim: true, maxlength: 500 },
  documents: [
    {
      fileUrl: { type: String },
      fileType: {
        type: String,
        enum: ["income", "medical", "bill", "other"],
        default: "other",
      },
    },
  ],
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviewedAt: Date,
});

const BeneficiaryApplication = mongoose.model(
  "BeneficiaryApplication",
  benificiaryApplicationSchema,
);

export default BeneficiaryApplication;
