import {
  createMemberPayment,
  getProjectMemberPayments,
  updateMemberPayment,
  deleteMemberPayment

} from "../../controllers/finance-payments/memberPaymentController.js";
import express from "express";

const router = express.Router();

router.post("/", createMemberPayment);
router.get("/:projectId", getProjectMemberPayments);
router.put("/:id", updateMemberPayment);
router.delete("/:id", deleteMemberPayment);

export default router;