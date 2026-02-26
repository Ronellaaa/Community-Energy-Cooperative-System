import express from "express";
import {
  recommendRelief,
  approveRelief,
  rejectRelief,
  getReliefByMonth,
} from "../../controllers/engergy-poverty-support/ReliefDistributionController";

const router = express.Router();

router.post("/recommend", recommendRelief);
router.patch("/approve", approveRelief);
router.patch("/reject", rejectRelief);
router.get("/:memberId/:monthYear", getReliefByMonth);

export default router;
