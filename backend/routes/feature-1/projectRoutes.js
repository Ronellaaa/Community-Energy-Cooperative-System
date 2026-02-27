// projectRoutes.js
import express from "express";
import * as controller from "../../controllers/feature-1/projectController.js";
import { protect } from "../../middleware/authMiddleware.js";
import { authorize } from "../../middleware/roleMiddleware.js";
import { validateProject } from "../../middleware/validationMiddleware.js";

const router = express.Router();

// ADMIN ONLY ROUTES
// Make sure role is "ADMIN" (all caps, as in User model)

// Create project
router.post("/", protect, authorize("ADMIN"), validateProject, controller.create);

// Get all projects
router.get("/", protect, authorize("ADMIN"), controller.getAll);

// Get single project by ID
router.get("/:id", protect, authorize("ADMIN"), controller.getOne);

// Update project
router.put("/:id", protect, authorize("ADMIN"), controller.update);

// Delete project
router.delete("/:id", protect, authorize("ADMIN"), controller.deleteProject);

// Approve project
router.patch("/:id/approve", protect, authorize("ADMIN"), controller.approve);

// Activate project
router.patch("/:id/activate", protect, authorize("ADMIN"), controller.activate);

export default router;