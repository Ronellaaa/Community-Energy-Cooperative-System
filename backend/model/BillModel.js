import mongoose from "mongoose";

const { Schema } = mongoose;

const billSchema = new Schema({
  memberId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  monthYear: Date,
  kwhUsed: Number,
  amountLKR: Number,
  creditAppliedLKR: Number,
  fileUrl: String,
});

const Bill = mongoose.model("Bill", billSchema);

export default Bill;
