import {
  createFundingSource,
  listFundingSources,
  updateFundingSource,
  deleteFundingSource,
} from "../../controllers/finance-payments/fundingSourceController.js";
import express from "express";

const router = express.Router();

router.post("/", createFundingSource);
router.get("/", listFundingSources);
router.put("/:id", updateFundingSource);
router.delete("/:id", deleteFundingSource);

export default router;    

