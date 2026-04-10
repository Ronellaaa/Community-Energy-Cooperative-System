//member contribution

import mongoose from "mongoose";

const memberPaymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["JOINING", "MONTHLY_MAINTENANCE", "OTHER"],
    },
    method: {
      type: String,
      enum: ["CASH", "BANK", "TRANSFER"],
    },

    amount: Number,
    month: String, //for monthly maintenance
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
  },
  { timestamps: true },
);

const MemberPayment = mongoose.model("MemberPayment", memberPaymentSchema);

export default MemberPayment;
