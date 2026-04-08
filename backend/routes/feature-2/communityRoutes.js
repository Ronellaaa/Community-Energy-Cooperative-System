import express from "express";
import { listCommunities, getCommunity, createCommunity,deleteCommunity,updateCommunity,getApprovedCommunities } from "../../controllers/feature-2/communityController.js";
import { requireAuth, requireOfficer } from "../../middleware/auth.js";

const router = express.Router();
router.get("/", listCommunities);
router.get("/approved", getApprovedCommunities);
router.get("/:id", getCommunity);
router.post("/", requireAuth, requireOfficer, createCommunity);
router.patch("/:id", requireAuth, requireOfficer, updateCommunity);
router.delete("/:id", requireAuth, requireOfficer, deleteCommunity);

export default router;