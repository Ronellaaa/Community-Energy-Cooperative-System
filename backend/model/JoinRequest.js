import mongoose from "mongoose";

const docSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["NIC", "GN_LETTER", "UTILITY_BILL", "OTHER"],
      required: true,
    },
    fileUrl: { type: String, required: true },     // store path or cloud URL
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const joinRequestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    communityId: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },

    // --- 11 fields payload ---
    applicantType: {
      type: String,
      enum: ["HOUSEHOLD", "SCHOOL", "TEMPLE", "SMALL_BUSINESS"],
      required: true,
    },

    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    address: { type: String, required: true, trim: true, maxlength: 200 },
    reason: { type: String, required: true, trim: true, maxlength: 300 },

    monthlyBillRange: {
      type: String,
      enum: ["0-3000", "3000-6000", "6000-10000", "10000+"],
      required: true,
    },

    meterNumber: { type: String, trim: true, maxlength: 40 }, // can be optional now; verify later

    contributionTypes: [
      {
        type: String,
        enum: ["MONEY", "ROOF_SPACE", "LABOUR_SUPPORT"],
      },
    ],

    lowIncomeRequested: { type: Boolean, default: false },
    incomeRange: {
      type: String,
      enum: ["<25000", "25000-50000", "50000-100000", "100000+"],
    },
    familySize: { type: Number, min: 1, max: 30 },

    documents: { type: [docSchema], default: [] },

    // officer review info
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true }
);

// Prevent duplicate PENDING per user
joinRequestSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "PENDING" } }
);

export default mongoose.model("JoinRequest", joinRequestSchema);