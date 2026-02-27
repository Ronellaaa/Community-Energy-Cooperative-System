import express from "express";
import {
  assesRisk,
  getRiskByMonth,
  getRiskHistoryByMember,
} from "../../controllers/engergy-poverty-support/RiskAssesmentController";

const router = express.Router();

router.post("/asses", assesRisk);
router.get("/member/:memberId", getRiskHistoryByMember);
router.get("/:memberId/:monthYear", getRiskByMonth);

export default router;
