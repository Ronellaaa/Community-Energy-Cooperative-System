import {
  createFundingRecord,
  getprojectFundingSummary,
  updateFundingRecord,
  deleteFundingRecord
} from "../../controllers/finance-payments/fundingRecordController.js";
import express from "express";

const router = express.Router();

router.post("/", createFundingRecord);
router.get("/summary/:projectId", getprojectFundingSummary);
router.put("/:id", updateFundingRecord);
router.delete("/:id", deleteFundingRecord);

export default router;