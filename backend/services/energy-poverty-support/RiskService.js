import Bill from "../../model/BillModel.js";
import RiskAssesment from "../../model/RiskAssessmentModel.js";
import supportLogService from "../SupportLogService.js";

async function calculateRiskLevel(memberId, monthYear) {
  const reasons = [];

  let score = 0;

  const bill = await Bill.findOne({ memberId, monthYear });

  if (!bill) {
    throw new Error(
      `No bill found for member ${memberId} for month ${monthYear}`,
    );
  }

  const amount = Number(bill.amountLKR);

  if (amount > 15000) {
    score += 35;
    reasons.push(`Very high bill amount (LKR ${amount})`);
  } else if (amount > 10000) {
    score += 25;
    reasons.push(`High bill amount (LKR ${amount})`);
  } else if (amount > 5000) {
    score += 15;
    reasons.push(`Moderate bill amount (LKR ${amount})`);
  } else {
    score += 5;
    reasons.push(`Low bill amount (LKR ${amount})`);
  }

  const kwhUsed = Number(bill.kwhUsed);

  if (kwhUsed > 0 && kwhUsed < 40) {
    score += 30;
    reasons.push(`Very LOW energy usage (${kwhUsed} kWh)`);
  } else if (kwhUsed >= 40 && kwhUsed <= 70) {
    score += 20;
    reasons.push(`Low energy usage (${kwhUsed} kWh)`);
  }

  const credit = Number(bill.creditAppliedLKR);

  if (credit > 3000) {
    score += 20;
    reasons.push(`High credit applied (LKR ${credit})`);
  } else if (credit > 1000) {
    score += 10;
    reasons.push(`Moderate credit applied (LKR ${credit})`);
  } else {
    score += 5;
    reasons.push(`Low credit applied (LKR ${credit})`);
  }

  if (score > 100) score = 100;

  let riskLevel = "Low";
  if (score >= 65) riskLevel = "High";
  else if (score >= 40) riskLevel = "Medium";
  else riskLevel = "Low";

  const riskAssessment = await RiskAssesment.findOneAndUpdate(
    {
      memberId,
      monthYear,
    },
    { memberId, monthYear, score, riskLevel, reasons },
    { upsert: true, new: true },
  );
  await supportLogService.logRiskAssessment(
    memberId,
    `Risk assessed for ${monthYear}: ${riskLevel} (score ${score})`,
    "system",
  );
  return riskAssessment;
}
export default { calculateRiskLevel };
