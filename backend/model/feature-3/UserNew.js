import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  // Some documents use "fullName", some use "name"
  fullName: {
    type: String,
    required: false  // Not required because some docs use "name" instead
  },
  name: {
    type: String,
    required: false  // Not required because some docs use "fullName" instead
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  phone: {
    type: String,
    required: false,
    trim: true
  },
  
  passwordHash: {
    type: String,
    required: false
  },
  
  role: {
    type: String,
    enum: ["ADMIN", "OFFICER", "USER", "MEMBER", "INVESTOR"], // Added all roles from your data
    default: "USER",
    required: true
  },
  
  communityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Community",
    required: false,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  isArchived: {
    type: Boolean,
    default: false
  },
  
  // ============================================
  // ADD THIS - walletBalance (optional)
  // ============================================
  walletBalance: {
    type: Number,
    default: 0,
    min: 0,
    required: false  // Making it optional so existing docs don't break
  },                                                                                                              createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});                                                                                                               const UserNew = mongoose.model('UserNew', userSchema);
export default UserNew;