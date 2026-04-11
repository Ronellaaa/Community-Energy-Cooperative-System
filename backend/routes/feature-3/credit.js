import express from "express";
import distributeCreditsController from "../../controllers/feature-3/credit.controller.js";

const router = express.Router();

// DISTRIBUTE CREDITS - POST (BY THE ADMIN)
router.post("/distribute/:projectId/:billingPeriod", distributeCreditsController);

export default router;
