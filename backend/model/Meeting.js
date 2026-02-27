import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    dateTime: { type: Date, required: true, index: true },
    agenda: { type: String, trim: true, maxlength: 3000 },

    notesRaw: { type: String, trim: true, maxlength: 10000, default: "" },
    minutesClean: { type: String, trim: true, maxlength: 10000, default: "" },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model("Meeting", MeetingSchema);
export default Meeting;