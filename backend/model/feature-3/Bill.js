import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  // Who the bill belongs to
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // Bill details from the image
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  consumerName: {
    type: String,
    required: true,
    trim: true
  },
  billMonth: {
    type: String,
    required: true,
    trim: true
  },
  totalAmountDue: {
    type: Number,
    required: true,
    min: 0
  },

  // Optional fields from the image
  address: {
    type: String,
    trim: true
  },
  dueDate: Date,
  billNumber: String,

  // ============================================
  // BILL IMAGE - System generated
  // ============================================
  billImage: {
    url: { 
      type: String, 
      required: true  // Cloudinary URL - REQUIRED
    },
    publicId: { 
      type: String, 
      required: true  // Cloudinary public ID - REQUIRED for future updates/deletes
    },
    filename: String,  // Original filename (optional, nice to have)
    uploadDate: { 
      type: Date, 
      default: Date.now 
    }
  },

  // ============================================
  // STATUS & APPROVAL FIELDS
  // ============================================
  // Current status of the bill
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },

  // Final amount after applying credits (if approved)
  reducedAmount: {
    type: Number,
    min: 0
  },

  // If rejected, why?
  rejectionReason: {
    type: String,
    trim: true
  },

  // Link to the credit used (if any)
  creditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Credit'
  },

  // Who reviewed it and when
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,

  // ============================================
  // TIMESTAMPS
  // ============================================
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp automatically
billSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
