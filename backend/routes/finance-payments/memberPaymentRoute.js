import express from "express";
import {
  createMemberPayment,
  getProjectMemberPayments,
  updateMemberPayment,
  deleteMemberPayment,
} from "../../controllers/finance-payments/memberPaymentController.js";
import { requireAuth, requireOfficer, requireAdmin } from "../../middleware/auth.js";
const router = express.Router();

// Create payment
router.post("/", requireAuth, requireOfficer, createMemberPayment);

// List payments by project
router.get(
  "/project/:projectId",
  requireAuth,
  requireOfficer,
  getProjectMemberPayments,
);

// Update / delete payment by payment id
router.put("/:id", requireAuth, requireOfficer, updateMemberPayment);
router.delete(
  "/:id",
  requireAuth,
  requireOfficer,
  deleteMemberPayment,
);

export default router;
