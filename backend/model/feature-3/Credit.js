import mongoose from "mongoose";

const CreditSchema = new mongoose.Schema({
  // User who owns this credit
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false  // Not required because some credits may be linked to funding sources instead 
  },

    // Funding source that owns this credit (new field)
  fundingSourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FundingSource",
    required: false
  },
  
  // Project that generated this credit
  projectId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Project", 
    required: true 
  },
  
  // Billing period this credit is for (e.g., "SEP-2023")
  billingPeriod: { 
    type: String, 
    required: true 
  },
  
  // Settlement that created this credit
  settlementId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EnergySettlement", 
    required: true 
  },
  
  // ============================================
  // CREDIT AMOUNT FIELDS
  // ============================================
  
  // Original credit amount when created
  originalAmount: { 
    type: Number, 
    required: true,
    min: [0, 'Credit amount cannot be negative']
  },
  
  // Remaining amount that can still be used
  remainingAmount: {
    type: Number,
    required: true,
    min: [0, 'Remaining amount cannot be negative'],
    default: function() {
      return this.originalAmount;
    }
  },
  
  // ============================================
  // USAGE TRACKING
  // ============================================
  
  // Whether this credit has been fully used
  isFullyUsed: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Array to track partial usage history
  usageHistory: [{
    billId: { type: mongoose.Schema.Types.ObjectId, ref: "Bill" },
    amountUsed: Number,
    usedAt: Date,
    remainingAfter: Number
  }],
  
  // ============================================
  // LEGACY FIELDS (for backward compatibility)
  // ============================================
  
  usedForBillReduction: {
    type: Boolean,
    default: false,
    index: true
  },
  
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
    default: null
  },
  
  usedAt: {
    type: Date,
    default: null
  },
  
  // ============================================
  // AUDIT FIELDS
  // ============================================
  
  createdBy: { 
    type: String, 
    default: "system" 
  },
  
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true 
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add validation to ensure either userId OR fundingSourceId is present
CreditSchema.pre('validate', async function() {
  if (!this.userId && !this.fundingSourceId) {
    throw new Error('Either userId or fundingSourceId must be provided');
  }
  if (this.userId && this.fundingSourceId) {
    throw new Error('Cannot have both userId and fundingSourceId - choose one');
  }
});

// ✅ SINGLE pre-save hook - does everything in one place
CreditSchema.pre('save', function() {
  console.log('🔄 Credit pre-save hook running for:', this._id);
  
  // 1. Update timestamp
  this.updatedAt = Date.now();
  
  // 2. Update isFullyUsed based on remainingAmount
  this.isFullyUsed = this.remainingAmount <= 0;
  
  console.log('   remainingAmount:', this.remainingAmount);
  console.log('   isFullyUsed:', this.isFullyUsed);
  
});

// Indexes for common queries
CreditSchema.index({ userId: 1, isFullyUsed: 1 });
CreditSchema.index({ userId: 1, billingPeriod: 1 });
CreditSchema.index({ 'usageHistory.billId': 1 });

export default mongoose.model("Credit", CreditSchema);
