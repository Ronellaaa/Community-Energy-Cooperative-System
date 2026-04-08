// services/adminBillService.js
import Bill from '../../model/feature-3/Bill.js';
import Credit from '../../model/feature-3/Credit.js';
import { processCreditUsage } from '../../utils/feature-3/admin.bill.utils.js';

export const getAdminBillsByStatus = async (status, filters = {}) => {
  const { startDate, endDate } = filters;
  
  // Build query - status is required, no userId filter
  let query = { status };
  
  // Add date range filter if provided
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  // Get bills - NO userId filter, so gets ALL users' bills
  const bills = await Bill.find(query)
    .sort({ createdAt: -1 });
  
  // Get date range for summary
  const dateRange = {};
  if (bills.length > 0) {
    dateRange.oldest = bills[bills.length - 1].createdAt;
    dateRange.newest = bills[0].createdAt;
  }
  
  return {
    bills,
    dateRange
  };
};

export const updateBillStatus = async (billId, updateData) => {
  const { status, rejectionReason, reviewedBy } = updateData;
  
  // Find the bill by ID only
  const bill = await Bill.findById(billId);
  
  if (!bill) {
    throw new Error('Bill not found');
  }
  
  const userId = bill.userId;
  
  if (bill.status !== 'pending' && status !== bill.status) {
    throw new Error(`Bill is already ${bill.status}. Cannot change to ${status}`);
  }
  
  if (status === 'approved') {
    return await approveBill(bill, userId, reviewedBy);
  } 
  else if (status === 'rejected') {
    return await rejectBill(bill, userId, rejectionReason, reviewedBy);
  } 
  else if (status === 'pending') {
    return await resetBillToPending(bill);
  }
  
  throw new Error('Invalid status operation');
};

// ============================================
// DEBUG VERSION: Helper function for approval
// ============================================
const approveBill = async (bill, userId, reviewedBy) => {
  console.log('\n🔍 ===== APPROVE BILL DEBUG =====');
  console.log('Bill ID:', bill._id.toString());
  console.log('User ID:', userId.toString());
  console.log('Bill Amount:', bill.totalAmountDue);
  
  // STEP 1: Check if ANY credits exist for this user (no filters)
  console.log('\n📋 STEP 1: Finding ANY credits for this user...');
  const anyCredits = await Credit.find({ userId: userId });
  console.log(`Found ${anyCredits.length} total credits for user`);
  
  if (anyCredits.length > 0) {
    console.log('All credits in DB:');
    anyCredits.forEach((c, i) => {
      console.log(`  ${i+1}. ID: ${c._id}, Period: ${c.billingPeriod}, Remaining: ${c.remainingAmount} (Type: ${typeof c.remainingAmount})`);
    });
  } else {
    console.log('❌ No credits at all found for this user!');
  }
  
  // STEP 2: Try the filtered query
  console.log('\n🔎 STEP 2: Finding credits with remainingAmount > 0...');
  const allCredits = await Credit.find({
    userId: userId,
    remainingAmount: { $gt: 0 }
  }).sort({ createdAt: 1 });
  
  console.log(`Found ${allCredits.length} credits with remainingAmount > 0`);
  
  if (allCredits.length > 0) {
    console.log('Credits with remainingAmount > 0:');
    allCredits.forEach((c, i) => {
      console.log(`  ${i+1}. ID: ${c._id}, Period: ${c.billingPeriod}, Remaining: ${c.remainingAmount} (Type: ${typeof c.remainingAmount})`);
    });
  }
  
  // STEP 3: Check for data type issues
  if (anyCredits.length > 0 && allCredits.length === 0) {
    console.log('\n⚠️ DATA TYPE ISSUE DETECTED!');
    console.log('You have credits but none with remainingAmount > 0');
    console.log('This usually means remainingAmount is stored as STRING');
    
    // Check types
    const stringCredits = anyCredits.filter(c => typeof c.remainingAmount === 'string');
    if (stringCredits.length > 0) {
      console.log(`Found ${stringCredits.length} credits with remainingAmount as STRING:`);
      stringCredits.forEach(c => {
        console.log(`  ID: ${c._id}, remainingAmount: "${c.remainingAmount}" (string)`);
      });
    }
  }
  
  // Initialize variables with defaults
  let creditsToUse = 0;
  let finalAmount = bill.totalAmountDue;
  let usedCredits = [];
  
  // ONLY process credits if they exist
  if (allCredits.length > 0) {
    console.log('\n💰 STEP 3: Processing credits...');
    const creditResult = await processCreditUsage(allCredits, bill, bill.totalAmountDue);
    creditsToUse = creditResult.creditsUsed;
    finalAmount = creditResult.finalAmount;
    usedCredits = creditResult.usedCredits;
    console.log(`✅ Used ${creditsToUse} credits from ${allCredits.length} credit sources`);
    console.log(`   Final amount: ${finalAmount}`);
  } else {
    console.log('\nℹ️ STEP 3: No credits with remainingAmount > 0 found');
    console.log('   Approving bill without credits at full amount:', bill.totalAmountDue);
  }
  
  // Update bill - ALWAYS approve regardless of credits
  bill.status = 'approved';
  bill.reducedAmount = finalAmount;
  bill.creditId = usedCredits[0]?.id || null;
  bill.reviewedBy = reviewedBy;
  bill.reviewedAt = new Date();
  
  await bill.save();
  console.log('✅ Bill saved with status: approved');
  
  // Get remaining credits for response
  const remainingCredits = await Credit.find({
    userId: userId,
    remainingAmount: { $gt: 0 }
  });
  
  const totalRemaining = remainingCredits.reduce(
    (sum, c) => sum + c.remainingAmount, 0
  );
  
  console.log('\n📊 Final remaining credits:', totalRemaining);
  console.log('===== END DEBUG =====\n');
  
  return {
    message: usedCredits.length > 0 
      ? 'Bill approved with credits' 
      : 'Bill approved (no credits available)',
    data: {
      bill: {
        id: bill._id,
        userId: userId,
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
  };
};

// Helper function for rejection
const rejectBill = async (bill, userId, rejectionReason, reviewedBy) => {
  if (!rejectionReason) {
    throw new Error('Rejection reason is required when rejecting a bill');
  }
  
  bill.status = 'rejected';
  bill.rejectionReason = rejectionReason;
  bill.reviewedBy = reviewedBy;
  bill.reviewedAt = new Date();
  
  await bill.save();
  
  return {
    message: 'Bill rejected successfully',
    data: {
      id: bill._id,
      userId: userId,
      accountNumber: bill.accountNumber,
      consumerName: bill.consumerName,
      status: bill.status,
      rejectionReason: bill.rejectionReason,
      reviewedBy: bill.reviewedBy,
      reviewedAt: bill.reviewedAt
    }
  };
};

// Helper function for reset to pending
const resetBillToPending = async (bill) => {
  bill.status = 'pending';
  bill.reviewedBy = null;
  bill.reviewedAt = null;
  bill.rejectionReason = null;
  bill.reducedAmount = null;
  bill.creditId = null;
  
  await bill.save();
  
  return {
    message: 'Bill status updated to pending',
    data: {
      id: bill._id,
      userId: bill.userId,
      status: bill.status,
      accountNumber: bill.accountNumber,
      consumerName: bill.consumerName
    }
  };
};