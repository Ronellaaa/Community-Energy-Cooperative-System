import Bill from "../../model/BillModel.js";
import ReliefDistribution from "../../model/ReliefDistributionModel.js";
import RiskAssesment from "../../model/RiskAssessmentModel.js";
import supportLogService from "../SupportLogService.js";

async function recommendRelief(memberId, monthYear) {
  const bill = await Bill.findOne({ memberId, monthYear });

  if (!bill) {
    throw new Error(
      `No bill found for member ${memberId} for month ${monthYear}`,
    );
  }

  const riskAssessment = await RiskAssesment.findOne({ memberId, monthYear });
  if (!riskAssessment) {
    throw new Error(
      `No risk assessment found for member ${memberId} for month ${monthYear}`,
    );
  }
  const riskLevel = (riskAssessment.riskLevel || "").toLowerCase();

  let decision = null;

  if (riskLevel === "high") {
    decision = {
      reliefType: "cashAid",
      reliefAmountLKR: 5000,
    };
  }
  if (riskLevel === "medium") {
    decision = {
      reliefType: "extraCredit",
      reliefAmountLKR: 1500,
    };
  } else {
    return null;
  }

  const relief = await ReliefDistribution.findOneAndUpdate(
    { memberId, monthYear },
    {
      memberId,
      monthYear,
      reliefType: decision.reliefType,
      reliefAmountLKR: decision.reliefAmountLKR,
      status: "pending",
      approvedBy: null,
      approvedAt: null,
    },
    { new: true, upsert: true },
  );
  await supportLogService.logReliefDistribution(
    memberId,
    `Relief recommended for ${monthYear}: ${decision.reliefType} LKR ${decision.reliefAmountLKR}`,
    "system",
  );

  return relief;
}

async function approveRelief(memberId, monthYear, approverName) {
  const relief = await ReliefDistribution.findOne({ memberId, monthYear });

  if (!relief) {
    throw new Error(
      `No relief distribution found for member ${memberId} for month ${monthYear}`,
    );
  }
  relief.status = "approved";
  relief.approvedBy = approverName;

  await relief.save();

  await supportLogService.logReliefDistribution(
    memberId,
    `Relief approved for ${monthYear}`,
    approverName,
  );

  return relief;
}

async function rejectRelief(memberId, monthYear, approverName) {
  const relief = await ReliefDistribution.findOne({ memberId, monthYear });

  if (!relief) {
    throw new Error(
      `No relief distribution found for member ${memberId} for month ${monthYear}`,
    );
  }
  relief.status = "rejected";
  relief.approvedBy = approverName;
  await relief.save();

  await supportLogService.logReliefDistribution(
    memberId,
    `Relief rejected for ${monthYear}`,
    approverName,
  );

  return relief;
}

export default { recommendRelief, approveRelief, rejectRelief };
