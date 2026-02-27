import express from "express";
import {
  createMaintenanceExpense,
  getProjectMaintenanceExpenses,
  updateMaintenanceExpense,
  deleteMaintenanceExpense,
} from "../../controllers/finance-payments/maintenanceExpenseController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/roleMiddleware.js";

const router = express.Router();

// Create expense
router.post(
  "/",
  protect,
  authorize("admin", "officer"),
  createMaintenanceExpense,
);

// List expenses by project
router.get(
  "/project/:projectId",
  protect,
  authorize("admin", "officer"),
  getProjectMaintenanceExpenses,
);

// Update / delete expense by expense id
router.put(
  "/:id",
  protect,
  authorize("admin", "officer"),
  updateMaintenanceExpense,
);
router.delete(
  "/:id",
  protect,
  authorize("admin", "officer"),
  deleteMaintenanceExpense,
);

export default router;
