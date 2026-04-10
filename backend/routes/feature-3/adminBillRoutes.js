// routes/adminBillRoutes.js
import { Router } from 'express';
import { getAdminBillsByStatus, updateBillStatus   } from '../../controllers/feature-3/admin.bill.controller.js';

const router = Router();

// Admin route to get bills by status (ALL users)
router.get('/bills/status/:status', getAdminBillsByStatus);

// Admin route to update bill status (approve/reject)
router.patch('/bills/:id/status', updateBillStatus);

export default router;