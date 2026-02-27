import express from "express";
import {
  createFundingRecord,
  updateFundingRecord,
  deleteFundingRecord,
  getprojectFundingSummary,
} from "../../controllers/finance-payments/fundingRecordController.js";

import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/roleMiddleware.js";


const router = express.Router();

// Create record
router.post("/", protect, authorize("admin", "officer"), createFundingRecord);

// Summary by project
router.get(
  "/summary/:projectId",
  protect,
  authorize("admin", "officer", "member"),
  getprojectFundingSummary,
);

// Update / Delete record by record id
router.put("/:id", protect, authorize("admin", "officer"), updateFundingRecord);
router.delete(
  "/:id",
  protect,
  authorize("admin", "officer"),
  deleteFundingRecord,
);

export default router;
