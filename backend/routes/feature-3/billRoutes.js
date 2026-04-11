import express from 'express';
import mongoose from 'mongoose';
import Bill from '../../model/feature-3/Bill.js';
import Credit from '../../model/feature-3/Credit.js';
import upload from '../../middleware/feature-3/upload.js';
import cloudinary from '../../config/feature-3/cloudinary.js';
import fs from 'fs';
import { createBill,getBills, getBillById, updateBill, deleteBill, getUserBillSummary     } from '../../controllers/feature-3/bill.controller.js';

const router = express.Router();

// CREATE BILL - POST(BY THE CLIENT)
router.post('/', upload.fields([
  { name: 'billImage', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), createBill);

// GET ALL BILLS WITH FILTERING SUPPORT (BY THE CLIENT)
router.get('/', getBills);

// GET SINGLE BILL BY ID - GET (BY THE CLIENT)
router.get('/:id', getBillById);

// UPDATE BILL FULLY - PUT (BY THE CLIENT)
router.put('/:id', upload.fields([
  { name: 'billImage', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'file', maxCount: 1 }
]), updateBill);

// DELETE BILL - DELETE (BY THE CLIENT)
router.delete('/:id', deleteBill);

// Get user bill summary
router.get('/summary/user', getUserBillSummary);

export default router;
