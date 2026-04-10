// routes/adminBillRoutes.js
import { Router } from 'express';
import {
  allocateCommunityBillByConsumption,
  distributeCommunityBill,
  getCommunityBills,
  getAdminBillsByStatus,
  updateBillStatus
} from '../../controllers/feature-3/admin.bill.controller.js';
import {
  getAdminPaymentSlips,
  updatePaymentSlipStatus
} from '../../controllers/feature-3/payment.slip.controller.js';

const router = Router();

router.get('/community-bills', getCommunityBills);
router.post('/community-bills/allocate', allocateCommunityBillByConsumption);
router.post('/community-bills/:id/distribute', distributeCommunityBill);
router.get('/payment-slips', getAdminPaymentSlips);
router.patch('/payment-slips/:id/status', updatePaymentSlipStatus);

// Admin route to get bills by status (ALL users)
router.get('/bills/status/:status', getAdminBillsByStatus);

// Admin route to update bill status (approve/reject)
router.patch('/bills/:id/status', updateBillStatus);

export default router;
