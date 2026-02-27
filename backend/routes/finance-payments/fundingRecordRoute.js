import express from "express";
import {
  createFundingRecord,
  updateFundingRecord,
  deleteFundingRecord,
  getprojectFundingSummary,
} from "../../controllers/finance-payments/fundingRecordController.js";

import { requireAuth, requireOfficer, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Create record
router.post("/", requireAuth, requireOfficer, createFundingRecord);

// Summary by project
router.get(
  "/summary/:projectId",
  requireAuth,
  getprojectFundingSummary,
);

// Update / Delete record by record id
router.put("/:id", requireAuth, requireOfficer, updateFundingRecord);
router.delete(
  "/:id",
  requireAuth,
  requireOfficer,
  deleteFundingRecord,
);

export default router;
