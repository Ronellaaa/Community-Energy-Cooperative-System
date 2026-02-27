import express from "express";
import {
  createApplication,
  getApplicationsByMember,
  getPendingApplications,
  reviewApplication,
} from "../controllers/beneficiaryApplicationController.js";

const router = express.Router();

router.post("/", createApplication);
router.get("/member/:memberId", getApplicationsByMember);
router.get("/pending", getPendingApplications);
router.patch("/:id/review", reviewApplication);

export default router;
