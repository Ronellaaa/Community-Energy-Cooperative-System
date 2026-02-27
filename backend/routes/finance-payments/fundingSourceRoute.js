import express from "express";
import {
  createFundingSource,
  listFundingSources,
  updateFundingSource,
  deleteFundingSource,
} from "../../controllers/finance-payments/fundingSourceController.js";

import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("admin", "officer"), createFundingSource);
router.get("/", protect, authorize("admin", "officer"), listFundingSources);
router.put("/:id", authorize("admin", "officer"), protect, updateFundingSource);
router.delete(
  "/:id",
  authorize("admin", "officer"),
  protect,
  deleteFundingSource,
);

export default router;
