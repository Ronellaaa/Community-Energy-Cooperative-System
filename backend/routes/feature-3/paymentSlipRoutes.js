import express from 'express';
import upload from '../../middleware/feature-3/upload.js';
import { 
  createPaymentSlip,
  getAdminPaymentSlips,
  getAdminPaymentSlipById,
  updatePaymentSlipStatus
} from '../../controllers/feature-3/payment.slip.controller.js';

const router = express.Router();

// CREATE PAYMENT SLIP - POST (BY THE CLIENT)
router.post('/', upload.fields([
  { name: 'slipImage', maxCount: 1 },
  { name: 'paymentSlip', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), createPaymentSlip);

// GET ALL PAYMENT SLIPS - GET (BY THE ADMIN)
router.get('/', getAdminPaymentSlips);

// GET SINGLE PAYMENT SLIP - GET (BY THE ADMIN)
router.get('/:id', getAdminPaymentSlipById);

// UPDATE PAYMENT SLIP STATUS - PATCH (BY THE ADMIN)
router.patch('/:id/status', updatePaymentSlipStatus);

export default router;
