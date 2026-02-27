import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    // Mongoose automatically creates _id for you
    estimatedCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;