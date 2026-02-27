// services/billService.js
import Bill from '../../model/feature-3/Bill.js';
import mongoose from 'mongoose';
import { uploadToCloudinary, deleteFromCloudinary  } from './handleImgService.js';
import { calculateTotals } from '../../utils/feature-3/client.bill.utils.js';

const TEST_USER_ID = new mongoose.Types.ObjectId("642f20000000000000000001");

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
    query.userId = TEST_USER_ID;
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
export const getBillById = async (id) => {
  const bill = await Bill.findOne({
    _id: id,
    userId: TEST_USER_ID
  });
  
  return bill;
};

// UPDATE BILL SERVICE (CALLED FROM CONTROLLER)
export const updateBill = async (id, updateData, file) => {
  // Find existing bill
  const existingBill = await Bill.findOne({
    _id: id,
    userId: TEST_USER_ID
  });
  
  if (!existingBill) {
    const error = new Error('Bill not found');
    error.status = 404;
    throw error;
  }
  
  // Handle new image upload
  if (file) {
    // Delete old image from Cloudinary if exists
    if (existingBill.billImage && existingBill.billImage.publicId) {
      await cloudinary.uploader.destroy(existingBill.billImage.publicId);
    }
    
    // Upload new image using existing uploadService
    updateData.billImage = await uploadToCloudinary(file);
  }
  
  // Ensure userId remains the test user
  updateData.userId = TEST_USER_ID;
  
  const bill = await Bill.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  return bill;
};

// DELETE BILL SERVICE (CALLED FROM CONTROLLER)
export const deleteBill = async (id) => {
  // Find existing bill
  const bill = await Bill.findOne({
    _id: id,
    userId: TEST_USER_ID
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
  await bill.deleteOne();
  
  return { message: 'Bill deleted successfully' };
};