import express from "express";
import {
  createFundingSource,
  listFundingSources,
  updateFundingSource,
  deleteFundingSource,
} from "../../controllers/finance-payments/fundingSourceController.js";
import { requireAuth, requireOfficer } from "../../middleware/auth.js";

const router = express.Router();

router.post("/", requireAuth, requireOfficer, createFundingSource);
router.get("/", requireAuth, requireOfficer, listFundingSources);
router.put("/:id", requireAuth, requireOfficer, updateFundingSource);
router.delete(
  "/:id",
  requireAuth,
  requireOfficer,
  deleteFundingSource,
);

export default router;
