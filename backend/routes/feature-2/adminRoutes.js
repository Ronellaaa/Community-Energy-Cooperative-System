import express from "express";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import {
  createOfficer,
  listOfficers,
  promoteToOfficer,
  archiveCommunity,
  updateOfficer,
  deleteOfficer,
  listCommunitiesAdmin,
  archiveOfficer,
  unarchiveOfficer,
} from "../../controllers/feature-2/adminController.js";

const router = express.Router();

router.post("/officers", requireAuth, requireAdmin, createOfficer);
router.get("/officers", requireAuth, requireAdmin, listOfficers);
router.patch(
  "/users/:id/promote-officer",
  requireAuth,
  requireAdmin,
  promoteToOfficer,
);

router.patch(
  "/communities/:id/archive",
  requireAuth,
  requireAdmin,
  archiveCommunity,
);

router.patch("/officers/:id", requireAuth, requireAdmin, updateOfficer);
router.delete("/officers/:id", requireAuth, requireAdmin, deleteOfficer);
router.get("/communities", requireAuth, requireAdmin, listCommunitiesAdmin);
router.patch(
  "/officers/:id/archive",
  requireAuth,
  requireAdmin,
  archiveOfficer,
);

router.patch(
  "/officers/:id/unarchive",
  requireAuth,
  requireAdmin,
  unarchiveOfficer,
);
export default router;
