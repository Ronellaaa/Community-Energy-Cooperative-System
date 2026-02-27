// controllers/billController.js
import { createBill as createBillService, getBills as getBillsService, getBillById as getBillByIdService, updateBill as updateBillService, deleteBill as deleteBillService   } from '../../service/feature-3/client.bill.service.js';

import fs from 'fs';

const getUploadedFile = (req) => {
  if (req.file) return req.file;
  if (!req.files) return null;
  return req.files.billImage?.[0] || req.files.image?.[0] || req.files.file?.[0] || null;
};

// CREATE BILL - POST (CALLED FROM ROUTES)
export const createBill = async (req, res) => {
  try {
    const uploadedFile = getUploadedFile(req);
    const billData = JSON.parse(req.body.billData);
    const bill = await createBillService(billData, uploadedFile);
    
    res.status(201).json({
      success: true,
      message: 'Bill created successfully',
      data: {
        id: bill._id,
        userId: bill.userId,
        accountNumber: bill.accountNumber,
        consumerName: bill.consumerName,
        billMonth: bill.billMonth,
        totalAmountDue: bill.totalAmountDue,
        status: bill.status,
        billImage: {
          url: bill.billImage?.url,
          uploadDate: bill.billImage?.uploadDate
        },
        createdAt: bill.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    
    // Clean up uploaded file if there's an error
    const uploadedFile = getUploadedFile(req);
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET ALL BILLS WITH FILTERING SUPPORT (CALLED FROM ROUTES)
export const getBills = async (req, res) => {
  try {
    const { status, startDate, endDate, userId } = req.query;
    
    // Call service to get bills with filters
    const result = await getBillsService({ status, startDate, endDate, userId });
    
    res.json({
      success: true,
      userId: result.userId,
      summary: {
        totalBills: result.bills.length,
        pendingBills: result.bills.filter(b => b.status === 'pending').length,
        approvedBills: result.bills.filter(b => b.status === 'approved').length,
        rejectedBills: result.bills.filter(b => b.status === 'rejected').length,
        totals: result.totals
      },
      count: result.bills.length,
      data: result.bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE BILL BY ID (CALLED FROM ROUTES)
export const getBillById = async (req, res) => {
  try {
    const bill = await getBillByIdService(req.params.id);
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE BILL FULLY - PUT (CALLED FROM ROUTES)
export const updateBill = async (req, res) => {
  try {
    const uploadedFile = getUploadedFile(req);
    let updateData = req.body.billData ? JSON.parse(req.body.billData) : req.body;
    
    // Call service to update bill
    const bill = await updateBillService(req.params.id, updateData, uploadedFile);
    
    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    
    // Clean up uploaded file if there's an error
    const uploadedFile = getUploadedFile(req);
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      fs.unlinkSync(uploadedFile.path);
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE BILL - DELETE (CALLED FROM ROUTES)
export const deleteBill = async (req, res) => {
  try {
    await deleteBillService(req.params.id);
    
    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bill:', error);
    
    if (error.message === 'Bill not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Cannot delete bill that is not in pending state') {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
