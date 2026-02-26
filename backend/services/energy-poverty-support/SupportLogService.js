import SupportActionLog from "../model/SupportActionLogModel";

async function logSupportAction(memberId, notes, doneBy = "system") {
  return await SupportActionLog.create({
    memberId,
    actionType: "application_review",
    notes,
    doneBy,
    doneAt: new Date(),
  });
}

async function logRiskAssessment(memberId, notes, doneBy = "system") {
  return await SupportActionLog.create({
    memberId,
    actionType: "risk_assessment",
    notes,
    doneBy,
    doneAt: new Date(),
  });
}

async function logReliefDistribution(memberId, notes, doneBy = "system") {
  return await SupportActionLog.create({
    memberId,
    actionType: "relief_distribution",
    notes,
    doneBy,
    doneAt: new Date(),
  });
}
async function getLogsByMember(memberId, limit = 50) {
  return SupportActionLog.find({ memberId }).sort({ doneAt: -1 }).limit(limit);
}
export default {
  logSupportAction,
  logRiskAssessment,
  logReliefDistribution,
  getLogsByMember,
};
