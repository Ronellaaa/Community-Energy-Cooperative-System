import mongoose from 'mongoose';

const memberConsumptionSchema = new mongoose.Schema({
  memberId: {
    type: String,
    required: true
  },
  communityId: {
    type: String,
    required: true
  },
  billingPeriod: {
    month: { type: Number, required: true },
    year: { type: Number, required: true }
  },
  previousReading: { 
    type: Number, 
    required: true
  },
  currentReading: { 
    type: Number, 
    required: true 
 },

  unitsConsumed: {
    type: Number,
    required: true
  },
  amountOwed: {
    type: Number,
    default: 0  // Initially 0, updated after bill is allocated
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  }
});

const MemberConsumption = mongoose.model('MemberConsumption', memberConsumptionSchema);

export default MemberConsumption;
