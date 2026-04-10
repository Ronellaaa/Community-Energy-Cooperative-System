import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    actionType: { type: String, required: true, trim: true },

    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    entityType: { type: String, required: true, trim: true },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    timestamp: { type: Date, default: Date.now, index: true },

    details: { type: Object, default: {} },


    prevHash: { type: String, default: "GENESIS" },
    hash: { type: String, default: "" },
  },
  { timestamps: true },
);

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
