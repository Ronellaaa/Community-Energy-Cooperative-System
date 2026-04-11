// services/billService.js
import Bill from '../../model/feature-3/Bill.js';
import Credit from '../../model/feature-3/Credit.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary  } from './handleImgService.js';
import { calculateTotals } from '../../utils/feature-3/client.bill.utils.js';

const TEST_USER_ID = new mongoose.Types.ObjectId("444444444444444444444443");

// CREATE BILL SERVICE (CALLED FROM CONTROLLER)
export const createBill = async (billData, file) => {
  // Add test user ID and set initial status
  billData.userId = TEST_USER_ID;
  billData.status = 'pending';
  
  // Upload image to Cloudinary if provided
  if (file) {
    billData.billImage = await uploadToCloudinary(file);
  }
  
  const bill = new Bill(billData);
  await bill.save();
  return bill;
};

// GET BILLS SERVICE WITH FILTERING (CALLED FROM CONTROLLER)
export const getBills = async (filters) => {
  const { status, startDate, endDate, userId } = filters;
  let query = {};
  
  // Filter by user - convert string to ObjectId if provided
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  } else {
    throw new Error("User ID is required");
  }
  
  // Add status filter if provided
  if (status) {
    query.status = status;
  }
  
  // Add date range filter if provided
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  // Get bills from database
  const bills = await Bill.find(query).sort({ createdAt: -1 });
  
  // Calculate totals using utility function
  const totals = calculateTotals(bills);
  
  return {
    bills,
    totals,
    userId: query.userId
  };
};

// GET SINGLE BILL BY ID SERVICE (CALLED FROM CONTROLLER)
export const getBillById = async (id, userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const bill = await Bill.findOne({
    _id: id,
    userId
  });
  
  return bill;
};

// UPDATE BILL SERVICE (CALLED FROM CONTROLLER)
export const updateBill = async (id, updateData, file) => {
  // Find existing bill by ID first to avoid false 404s for older records
  const existingBill = await Bill.findById(id);
  
  if (!existingBill) {
    const error = new Error('Bill not found');
    error.status = 404;
    throw error;
  }

   // CHECK IF BILL STATUS IS PENDING
  if (existingBill.status !== 'pending') {
    const error = new Error('Bill can only be updated when status is pending');
    error.status = 400;
    throw error;
  }
  
  // Handle new image upload
  if (file) {
    // Delete old image from Cloudinary if exists
    if (existingBill.billImage && existingBill.billImage.publicId) {
      await deleteFromCloudinary(existingBill.billImage.publicId);
    }
    
    // Upload new image using existing uploadService
    updateData.billImage = await uploadToCloudinary(file);
  }
  
  // Use provided userId
  updateData.userId = userId;
  
  const bill = await Bill.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  return bill;
};

// DELETE BILL SERVICE (CALLED FROM CONTROLLER)
export const deleteBill = async (id, userId) => {
  // Find existing bill
  const bill = await Bill.findOne({
    _id: id,
    userId
  });
  
  if (!bill) {
    const error = new Error('Bill not found');
    error.status = 404;
    throw error;
  }

  // Check if bill is in pending state
  if (bill.status !== 'pending') {
    const error = new Error('Cannot delete bill that is not in pending state');
    error.status = 403; // Forbidden
    throw error;
  }
  
  // Delete image from Cloudinary if exists
  if (bill.billImage && bill.billImage.publicId) {
    await deleteFromCloudinary(bill.billImage.publicId);
  }
  
  // Delete bill from database
  await Bill.deleteOne({ _id: id });
  
  return { message: 'Bill deleted successfully' };
};

export const getUserBillSummaryService = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const bills = await Bill.find({ userId });
  
  // Get credit summary with remaining amount
  const credits = await Credit.find({ userId });
  const totalOriginalCredits = credits.reduce((sum, c) => sum + (c.originalAmount || c.creditAmount || 0), 0);
  const totalRemainingCredits = credits.reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
  const totalUsedCredits = totalOriginalCredits - totalRemainingCredits;
  
  return {
    userId,
    bills: {
      total: bills.length,
      pending: bills.filter(b => b.status === 'pending').length,
      approved: bills.filter(b => b.status === 'approved').length,
      rejected: bills.filter(b => b.status === 'rejected').length
    },
    financials: {
      totalOriginalAmount: bills.reduce((sum, b) => sum + (b.totalAmountDue || 0), 0),
      totalReducedAmount: bills
        .filter(b => b.status === 'approved')
        .reduce((sum, b) => sum + (b.reducedAmount || 0), 0),
      totalSaved: bills
        .filter(b => b.status === 'approved')
        .reduce((sum, b) => sum + ((b.totalAmountDue - b.reducedAmount) || 0), 0)
    },
    credits: {
      totalOriginal: totalOriginalCredits,
      totalRemaining: totalRemainingCredits,
      totalUsed: totalUsedCredits,
      count: credits.length,
      fullyUsedCount: credits.filter(c => c.remainingAmount === 0).length,
      partiallyUsedCount: credits.filter(c => c.remainingAmount > 0 && c.remainingAmount < (c.originalAmount || c.creditAmount)).length
    }
  };
};
