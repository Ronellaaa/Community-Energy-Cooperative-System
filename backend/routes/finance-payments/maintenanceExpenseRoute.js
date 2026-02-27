import express from "express";
import {
  createMaintenanceExpense,
  getProjectMaintenanceExpenses,
  updateMaintenanceExpense,
  deleteMaintenanceExpense,
} from "../../controllers/finance-payments/maintenanceExpenseController.js";
import { requireAuth, requireOfficer, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

// Create expense
router.post(
  "/",
  requireAuth,
  requireOfficer,
  createMaintenanceExpense,
);

// List expenses by project
router.get(
  "/project/:projectId",
  requireAuth,
  requireOfficer,
  getProjectMaintenanceExpenses,
);

// Update / delete expense by expense id
router.put(
  "/:id",
  requireAuth,
  requireOfficer,
  updateMaintenanceExpense,
);
router.delete(
  "/:id",
  requireAuth,
  requireOfficer,
  deleteMaintenanceExpense,
);

export default router;
