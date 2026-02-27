import express from 'express';
import mongoose from 'mongoose';
import Bill from '../../model/feature-3/Bill.js';
import Credit from '../../model/feature-3/Credit.js';
import upload from '../../middleware/feature-3/upload.js';
import cloudinary from '../../config/feature-3/cloudinary.js';
import fs from 'fs';
import { createBill,getBills,  getBillById, updateBill, deleteBill    } from '../../controllers/feature-3/bill.controller.js';


const router = express.Router();



const TEST_USER_ID = new mongoose.Types.ObjectId("642f20000000000000000001");

// CREATE BILL - POST(BY THE CLIENT)
router.post('/', upload.fields([
  { name: 'billImage', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), createBill);

// GET ALL BILLS WITH FILTERING SUPPORT (BY THE CLIENT)
router.get('/', getBills);

// GET SINGLE BILL - GET (BY THE CLIENT)
router.get('/:id', getBillById);

// UPDATE BILL FULLY - PUT (BY THE CLIENT)
router.put('/:id', upload.fields([
  { name: 'billImage', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), updateBill);

// DELETE PENDING BILL - DELETE (BY THE CLIENT)
router.delete('/:id', deleteBill); 




// ============================================
// CREATE BILL - POST
{/*
router.post('/', upload.single('billImage'), async (req, res) => {
  try {
    // Parse the bill data from the request
    const billData = JSON.parse(req.body.billData);
    
    // Add test user ID and set initial status
    billData.userId = TEST_USER_ID;
    billData.status = 'pending';
    
    // Upload image to Cloudinary if provided
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'electricity-bills',
        resource_type: 'auto'
      });
      
      billData.billImage = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: req.file.originalname,
        uploadDate: new Date()
      };
      
      // Delete local file after upload
      fs.unlinkSync(req.file.path);
    }
    
    const bill = new Bill(billData);
    await bill.save();
    
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
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});*/}

// ============================================
// GET ALL BILLS - GET
// ============================================
{/*router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate, userId } = req.query;
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
    
    const bills = await Bill.find(query).sort({ createdAt: -1 });
    
    // Calculate totals
    const totals = bills.reduce((acc, bill) => {
      acc.totalOriginal += bill.totalAmountDue || 0;
      if (bill.status === 'approved') {
        acc.totalReduced += bill.reducedAmount || 0;
        acc.totalCustomerPays += (bill.totalAmountDue - bill.reducedAmount) || 0;
        acc.approvedCount++;
      }
      return acc;
    }, { totalOriginal: 0, totalReduced: 0, totalCustomerPays: 0, approvedCount: 0 });
    
    res.json({
      success: true,
      userId: query.userId,
      summary: {
        totalBills: bills.length,
        pendingBills: bills.filter(b => b.status === 'pending').length,
        approvedBills: bills.filter(b => b.status === 'approved').length,
        rejectedBills: bills.filter(b => b.status === 'rejected').length,
        totals
      },
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});*/}

// ============================================
// GET SINGLE BILL - GET
// ============================================
{/*router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: TEST_USER_ID
    });
    
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
});*/}

// ============================================
// UPDATE BILL FULLY - PUT
// ============================================
{/*router.put('/:id', upload.single('billImage'), async (req, res) => {
  try {
    let updateData = req.body.billData ? JSON.parse(req.body.billData) : req.body;
    
    // Find existing bill
    const existingBill = await Bill.findOne({
      _id: req.params.id,
      userId: TEST_USER_ID
    });
    
    if (!existingBill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Handle new image upload
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (existingBill.billImage && existingBill.billImage.publicId) {
        await cloudinary.uploader.destroy(existingBill.billImage.publicId);
      }
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'electricity-bills',
        resource_type: 'auto'
      });
      
      updateData.billImage = {
        url: result.secure_url,
        publicId: result.public_id,
        filename: req.file.originalname,
        uploadDate: new Date()
      };
      
      fs.unlinkSync(req.file.path);
    }
    
    // Ensure userId remains the test user
    updateData.userId = TEST_USER_ID;
    
    const bill = await Bill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });
  } catch (error) {
    console.error('Error updating bill:', error);
    
    // Clean up uploaded file if there's an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});*/}

// ============================================
// DELETE BILL - DELETE
// ============================================
{/*router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: TEST_USER_ID
    });
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Delete image from Cloudinary if exists
    if (bill.billImage && bill.billImage.publicId) {
      await cloudinary.uploader.destroy(bill.billImage.publicId);
    }
    
    await bill.deleteOne();
    
    res.json({
      success: true,
      message: 'Bill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});*/}

// ============================================
// GET BILLS BY STATUS - GET
// ============================================
{/*router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const bills = await Bill.find({ 
      userId: TEST_USER_ID,
      status 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      userId: TEST_USER_ID,
      status,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
*/}
// ============================================
// GET PENDING BILLS FOR REVIEW - GET
// ============================================
{/*router.get('/admin/pending', async (req, res) => {
  try {
    const pendingBills = await Bill.find({ 
      userId: TEST_USER_ID,
      status: 'pending' 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      userId: TEST_USER_ID,
      count: pendingBills.length,
      data: pendingBills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});*/}

// ============================================
// UPDATE BILL STATUS - PATCH (FIXED VERSION)
// ============================================
{/*router.patch('/:id/status', async (req, res) => {
  try {
    const { status, rejectionReason, reviewedBy } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status value
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }
    
    // Find the bill
    const bill = await Bill.findOne({
      _id: req.params.id,
      userId: TEST_USER_ID
    });
    
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }
    
    // Check if bill is already processed
    if (bill.status !== 'pending' && status !== bill.status) {
      return res.status(400).json({
        success: false,
        message: `Bill is already ${bill.status}. Cannot change to ${status}`
      });
    }
    
    // ============================================
    // HANDLE APPROVAL LOGIC (FIXED)
    // ============================================
    if (status === 'approved') {
      // Get ALL credits with remaining amount > 0 for this user
      const allCredits = await Credit.find({
        userId: TEST_USER_ID,
        remainingAmount: { $gt: 0 }
      }).sort({ createdAt: 1 }); // Oldest first (FIFO)
      
      if (allCredits.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User has no credits available',
          billAmount: bill.totalAmountDue
        });
      }
      
      // Calculate total credits available
      const totalCreditsAvailable = allCredits.reduce(
        (sum, c) => sum + c.remainingAmount, 0
      );
      
      // Determine how much credit to use (up to bill amount)
      const creditsToUse = Math.min(totalCreditsAvailable, bill.totalAmountDue);
      const finalAmount = bill.totalAmountDue - creditsToUse;
      
      // Apply credits (oldest first)
      let remainingToUse = creditsToUse;
      const usedCredits = [];
      
      console.log(`💰 Starting approval: Need ${creditsToUse} credits`);
      
      for (const credit of allCredits) {
        if (remainingToUse <= 0) {
          console.log('✅ Target reached, stopping credit usage');
          break;
        }
        
        // Check if this credit was already used for this bill
        const alreadyUsed = credit.usageHistory?.some(
          u => u.billId && u.billId.toString() === bill._id.toString()
        );
        
        if (alreadyUsed) {
          console.log(`⚠️ Credit ${credit._id} already used for this bill, skipping`);
          continue;
        }
        
        const amountToUse = Math.min(credit.remainingAmount, remainingToUse);
        const previousRemaining = credit.remainingAmount;
        
        console.log(`   Using credit ${credit._id}: ${amountToUse} from ${previousRemaining}`);
        
        // 👇 UPDATE FIRST - then calculate remainingAfter
        credit.remainingAmount -= amountToUse;
        
        // Track usage in history
        if (!credit.usageHistory) credit.usageHistory = [];
        credit.usageHistory.push({
          billId: bill._id,
          amountUsed: amountToUse,
          usedAt: new Date(),
          remainingAfter: credit.remainingAmount // Now correct!
        });
        
        // Keep old fields for backward compatibility
        if (credit.remainingAmount === 0) {
          credit.usedForBillReduction = true;
          credit.billId = bill._id;
          credit.usedAt = new Date();
        }
        
        await credit.save();
        
        usedCredits.push({
          id: credit._id,
          amount: amountToUse,
          originalAmount: credit.originalAmount,
          remainingAfter: credit.remainingAmount,
          month: credit.billingPeriod,
          isFullyUsed: credit.remainingAmount === 0
        });
        
        remainingToUse -= amountToUse;
        console.log(`   Remaining to use: ${remainingToUse}`);
      }
      
      // Verify we used exactly what we needed
      if (creditsToUse - remainingToUse !== creditsToUse) {
        console.log(`⚠️ Used ${creditsToUse - remainingToUse} of ${creditsToUse} needed`);
      }
      
      // Update bill
      bill.status = 'approved';
      bill.reducedAmount = finalAmount;
      bill.creditId = usedCredits[0]?.id;
      bill.reviewedBy = reviewedBy || 'admin';
      bill.reviewedAt = new Date();
      
      await bill.save();
      
      // Calculate remaining credits
      const remainingCredits = await Credit.find({
        userId: TEST_USER_ID,
        remainingAmount: { $gt: 0 }
      });
      
      const totalRemaining = remainingCredits.reduce(
        (sum, c) => sum + c.remainingAmount, 0
      );
      
      return res.json({
        success: true,
        message: 'Bill approved successfully',
        data: {
          bill: {
            id: bill._id,
            accountNumber: bill.accountNumber,
            consumerName: bill.consumerName,
            month: bill.billMonth,
            originalAmount: bill.totalAmountDue,
            creditsUsed: creditsToUse,
            finalAmount: finalAmount,
            savings: creditsToUse,
            status: bill.status
          },
          credits: {
            used: usedCredits,
            totalUsed: creditsToUse,
            remaining: totalRemaining,
            remainingCount: remainingCredits.length
          },
          reviewedBy: bill.reviewedBy,
          reviewedAt: bill.reviewedAt
        }
      });
    }
    
    // ============================================
    // HANDLE REJECTION LOGIC
    // ============================================
    else if (status === 'rejected') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required when rejecting a bill'
        });
      }
      
      bill.status = 'rejected';
      bill.rejectionReason = rejectionReason;
      bill.reviewedBy = reviewedBy || 'admin';
      bill.reviewedAt = new Date();
      
      await bill.save();
      
      return res.json({
        success: true,
        message: 'Bill rejected successfully',
        data: {
          id: bill._id,
          accountNumber: bill.accountNumber,
          consumerName: bill.consumerName,
          status: bill.status,
          rejectionReason: bill.rejectionReason,
          reviewedBy: bill.reviewedBy,
          reviewedAt: bill.reviewedAt
        }
      });
    }
    
    // ============================================
    // HANDLE PENDING (reset if needed)
    // ============================================
    else if (status === 'pending') {
      bill.status = 'pending';
      bill.reviewedBy = null;
      bill.reviewedAt = null;
      bill.rejectionReason = null;
      bill.reducedAmount = null;
      bill.creditId = null;
      
      await bill.save();
      
      return res.json({
        success: true,
        message: 'Bill status updated to pending',
        data: {
          id: bill._id,
          status: bill.status,
          accountNumber: bill.accountNumber,
          consumerName: bill.consumerName
        }
      });
    }
    
  } catch (error) {
    console.error('Error updating bill status:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});*/}

// ============================================
// GET USER BILL SUMMARY - GET
// ============================================
router.get('/summary/user', async (req, res) => {
  try {
    const bills = await Bill.find({ userId: TEST_USER_ID });
    
    // Get credit summary with remaining amount
    const credits = await Credit.find({ userId: TEST_USER_ID });
    const totalOriginalCredits = credits.reduce((sum, c) => sum + (c.originalAmount || c.creditAmount || 0), 0);
    const totalRemainingCredits = credits.reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
    const totalUsedCredits = totalOriginalCredits - totalRemainingCredits;
    
    const summary = {
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
    
    res.json({
      success: true,
      userId: TEST_USER_ID,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// GET OVERDUE BILLS - GET
// ============================================
router.get('/analysis/overdue', async (req, res) => {
  try {
    const today = new Date();
    const overdueBills = await Bill.find({
      userId: TEST_USER_ID,
      dueDate: { $lt: today },
      status: 'pending'
    }).sort({ dueDate: 1 });
    
    res.json({
      success: true,
      count: overdueBills.length,
      data: overdueBills
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
