import express from "express";
import {
  createMemberPayment,
  getProjectMemberPayments,
  updateMemberPayment,
  deleteMemberPayment,
} from "../../controllers/finance-payments/memberPaymentController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Create payment
router.post("/", protect, authorize("admin", "officer"), createMemberPayment);

// List payments by project
router.get(
  "/project/:projectId",
  protect,
  authorize("admin", "officer"),
  getProjectMemberPayments,
);

// Update / delete payment by payment id
router.put("/:id", protect, authorize("admin", "officer"), updateMemberPayment);
router.delete(
  "/:id",
  protect,
  authorize("admin", "officer"),
  deleteMemberPayment,
);

export default router;
