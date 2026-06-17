// controllers/adminBillController.js
import { getAdminBillsByStatus as getAdminBillsByStatusService,  updateBillStatus as updateBillStatusService  } from '../../service/feature-3/admin.bill.service.js';

export const getAdminBillsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { startDate, endDate } = req.query; // Optional date filters
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Get bills by status (no user filter)
    const result = await getAdminBillsByStatusService(status, { startDate, endDate });
    
    // Add summary for admin
    const summary = {
      status,
      totalBills: result.bills.length,
      totalAmount: result.bills.reduce((sum, bill) => sum + (bill.totalAmountDue || 0), 0),
      dateRange: result.dateRange
    };
    
    // If status is 'approved', add additional metrics
    if (status === 'approved') {
      summary.totalReduced = result.bills.reduce((sum, bill) => sum + (bill.reducedAmount || 0), 0);
      summary.totalCustomerPays = result.bills.reduce((sum, bill) => 
        sum + ((bill.totalAmountDue - (bill.reducedAmount || 0)) || 0), 0);
    }
    
    res.json({
      success: true,
      summary,
      count: result.bills.length,
      data: result.bills
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.status} bills:`, error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Validate status value directly
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be pending, approved, or rejected'
      });
    }
    
    // Call service
    const result = await updateBillStatusService(id, {
      status,
      rejectionReason,
      reviewedBy: reviewedBy || 'admin'
    });
    
    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error('Error updating bill status:', error);
    
    if (error.message === 'Bill not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('already')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('No credits available')) {
      return res.status(400).json({
        success: false,
        message: error.message,
        billAmount: error.billAmount,
        userId: error.userId
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};