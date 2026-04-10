import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },

 //User
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  type: {
    type: String,
    enum: ["Solar", "Wind", "Hydro"],
    required: true,
  },

  capacityKW: { type: Number, required: true },
  cost: { type: Number, required: true },

  communityId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Community",
  required: true,
},

  expectedMonthlyGeneration: { type: Number, default: 0 },
  expectedMonthlySavings: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["Pending", "Approved", "Active", "Rejected"],
    default: "Pending",
  },
}, { timestamps: true });


export default mongoose.model("Project", projectSchema);