import mongoose from 'mongoose';

const communityBillSchema = new mongoose.Schema({
  communityId: {
    type: String,
    required: true,
    index: true
  },
  
  billingPeriod: {
    month: { type: Number, required: true },
    year: { type: Number, required: true }
  },
  
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  totalAmount: {
    type: Number,
    required: true
  },
  
  totalImport: {
    type: Number,  // Total units consumed by community
    required: true
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending'
  }
}, {
  timestamps: true
});

communityBillSchema.index({ communityId: 1, 'billingPeriod.year': -1, 'billingPeriod.month': -1 });

const CommunityBill = mongoose.model('CommunityBill', communityBillSchema);

module.exports = CommunityBill;