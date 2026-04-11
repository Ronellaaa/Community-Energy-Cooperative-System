import express from 'express';
import upload from '../../middleware/feature-3/upload.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  createMemberPaymentSlip,
  updateMemberPaymentSlip,
  deleteMemberPaymentSlip,
  getMemberPaymentSlipsController,
  getMemberPaymentSlipById
} from '../../controllers/feature-3/member.payment.slip.controller.js';

const router = express.Router();

// CREATE PAYMENT SLIP - POST (BY THE MEMBER)
router.post('/', upload.fields([
  { name: 'slipImage', maxCount: 1 },
  { name: 'paymentSlip', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), requireAuth, createMemberPaymentSlip);

// GET MEMBER'S PAYMENT SLIPS - GET (BY THE MEMBER)
router.get('/', requireAuth, getMemberPaymentSlipsController);

// GET SINGLE PAYMENT SLIP BY ID - GET (BY THE MEMBER)
router.get('/:id', requireAuth, getMemberPaymentSlipById);

// UPDATE PAYMENT SLIP - PUT (BY THE MEMBER)
router.put('/:id', upload.fields([
  { name: 'slipImage', maxCount: 1 },
  { name: 'paymentSlip', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), requireAuth, updateMemberPaymentSlip);

// DELETE PAYMENT SLIP - DELETE (BY THE MEMBER)
router.delete('/:id', requireAuth, deleteMemberPaymentSlip);

export default router;
