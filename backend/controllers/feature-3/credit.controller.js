import distributeCredits  from "../../service/feature-3/credits.service.js";

export default async function distributeCreditsController(req, res) {
  try {
    const { projectId, billingPeriod } = req.params;
    const credits = await distributeCredits(projectId, billingPeriod);
    res.status(200).json({ status: "success", totalDistributed: credits.length, breakdown: credits });
  } catch (err) {
    res.status(400).json({ status: "error", message: err.message });
  }
}


