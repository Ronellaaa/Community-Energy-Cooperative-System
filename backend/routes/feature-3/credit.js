import express from "express";
import distributeCredits from "../../service/feature-3/credit.service.js";
import distributeCreditsController from "../../controllers/feature-3/credit.controller.js";
import EnergySettlement from "../../model/feature-3/EnergySettlement.js";
import mongoose from "mongoose";


const router = express.Router();

/*router.post("/distribute/:projectId/:billingPeriod", async (req, res) => {
  console.log("Route called!"); 

  console.log(
  "Collections:",
  await mongoose.connection.db.listCollections().toArray()
);

  try {
    const { projectId, billingPeriod } = req.params;

        // 🔹 Quick test to check if Mongoose finds the settlement
    const settlementTest = await EnergySettlement.findOne({
     projectId: new mongoose.Types.ObjectId("642f10000000000000000002"),
     billingPeriod: "2026-02"
    });
    console.log("Settlement test result:", settlementTest);
    const credits = await distributeCredits(projectId, billingPeriod);
    res.json({ success: true, credits });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});*/

router.post("/distribute/:projectId/:billingPeriod", distributeCreditsController);

export default router;
