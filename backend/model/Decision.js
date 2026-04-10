import mongoose from "mongoose";

const DecisionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 5000 },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2,
        message: "Decision options must contain at least 2 options.",
      },
    },

    status: {
      type: String,
      enum: ["draft", "active", "closed", "finalized"],
      default: "draft",
      index: true,
    },

    startAt: { type: Date, default: null },
    endAt: { type: Date, required: true },

    quorumPercent: { type: Number, default: 50, min: 0, max: 100 },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    result: {
      eligibleVoters: { type: Number, default: 0 },
      votesCast: { type: Number, default: 0 },
      counts: { type: Map, of: Number, default: {} },
      quorumMet: { type: Boolean, default: false },
      outcome: { type: String, default: "PENDING" },
      computedAt: { type: Date, default: null },
    },
  },
  { timestamps: true },
);

const Decision = mongoose.model("Decision", DecisionSchema);
export default Decision;
