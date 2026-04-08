import mongoose from "mongoose";

const paymentSlipSchema = new mongoose.Schema(
  {
    memberConsumptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MemberConsumption",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    communityId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    billingPeriod: {
      month: { type: Number, required: true },
      year: { type: Number, required: true },
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    referenceNumber: {
      type: String,
      trim: true,
      required: true,
      maxlength: 100,
    },
    payerName: {
      type: String,
      trim: true,
      required: true,
      maxlength: 120,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    slipImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      filename: String,
      uploadDate: {
        type: Date,
        default: Date.now,
      },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null,
    },
    reviewedBy: {
      type: String,
      trim: true,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSlipSchema.index(
  { memberConsumptionId: 1, status: 1, createdAt: -1 },
  { name: "payment_slip_status_lookup" },
);

const PaymentSlip = mongoose.model("PaymentSlip", paymentSlipSchema);

export default PaymentSlip;
