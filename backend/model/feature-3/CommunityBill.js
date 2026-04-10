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
  },

  distributionStatus: {
    type: String,
    enum: ['pending', 'distributed'],
    default: 'pending'
  },

  distributedAt: {
    type: Date,
    default: null
  },

  distributedBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

communityBillSchema.pre('validate', function () {
  const effectiveDistributionStatus = this.distributionStatus || 'pending';

  if (effectiveDistributionStatus !== 'distributed' && this.paymentStatus === 'paid') {
    this.paymentStatus = 'pending';
  }

  if (effectiveDistributionStatus !== 'distributed') {
    this.distributedAt = null;
    this.distributedBy = null;
  }
});

communityBillSchema.index({ communityId: 1, 'billingPeriod.year': -1, 'billingPeriod.month': -1 });

const CommunityBill = mongoose.model('CommunityBill', communityBillSchema);

export default CommunityBill;
