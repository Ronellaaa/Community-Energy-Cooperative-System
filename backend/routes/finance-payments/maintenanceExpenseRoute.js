import {
  createMaintenanceExpense,
  getProjectMaintenanceExpenses,
  updateMaintenanceExpense,
  deleteMaintenanceExpense,
} from "../../controllers/finance-payments/maintenanceExpenseController.js";
import express from "express";

const router = express.Router();

router.post("/", createMaintenanceExpense);
router.get("/:projectId", getProjectMaintenanceExpenses);
router.put("/:id", updateMaintenanceExpense);
router.delete("/:id", deleteMaintenanceExpense);

export default router;
