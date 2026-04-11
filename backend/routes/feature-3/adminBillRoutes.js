// routes/adminBillRoutes.js
import { Router } from 'express';
import {
  allocateCommunityBillByConsumption,
  distributeCommunityBill,
  getCommunityBills,
  getAdminBillsByStatus,
  updateBillStatus
} from '../../controllers/feature-3/admin.bill.controller.js';

const router = Router();

// COMMUNITY BILLS ROUTES
router.get('/community-bills', getCommunityBills);
router.post('/community-bills/allocate', allocateCommunityBillByConsumption);
router.post('/community-bills/:id/distribute', distributeCommunityBill);

// ADMIN BILLS ROUTES
router.get('/bills/status/:status', getAdminBillsByStatus);
router.patch('/bills/:id/status', updateBillStatus);

export default router;
