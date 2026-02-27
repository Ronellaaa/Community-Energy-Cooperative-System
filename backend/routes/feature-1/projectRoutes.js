// projectRoutes.js
import express from "express";
import * as controller from "../../controllers/feature-1/projectController.js";
import { protect } from "../../middleware/authMiddleware.js";
// import { authorize } from "../../middleware/roleMiddleware.js";
// import { validateProject } from "../../middleware/validationMiddleware.js";
import {
  requireAuth,
  requireOfficer,
  requireAdmin,
} from "../../middleware/auth.js";

const router = express.Router();

// ADMIN ONLY ROUTES
// Make sure role is "ADMIN" (all caps, as in User model)

// Create project
router.post("/", requireAuth, requireOfficer, controller.create);

// Get all projects
router.get("/", requireAuth, requireOfficer, controller.getAll);

// Get single project by ID
router.get("/:id", requireAuth, requireOfficer, controller.getOne);

// Update project
router.put("/:id", requireAuth, requireOfficer, controller.update);

// Delete project
router.delete("/:id", requireAuth, requireOfficer, controller.deleteProject);

// Approve project
router.patch("/:id/approve", requireAuth, requireOfficer, controller.approve);

// Activate project
router.patch("/:id/activate", requireAuth, requireOfficer, controller.activate);

export default router;
