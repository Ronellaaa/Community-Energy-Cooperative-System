import express from "express";

import path from "path";
import { requireAuth, requireOfficer } from "../../middleware/auth.js";
import { listJoinRequests, approveJoinRequest, rejectJoinRequest } from "../../controllers/feature-2/officerController.js";

const router = express.Router();

router.get("/join-requests", requireAuth, requireOfficer, listJoinRequests);
router.patch("/join-requests/:id/approve", requireAuth, requireOfficer, approveJoinRequest);
router.patch("/join-requests/:id/reject", requireAuth, requireOfficer, rejectJoinRequest);

export default router;