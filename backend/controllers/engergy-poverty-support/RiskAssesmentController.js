import RiskService from "../../services/energy-poverty-support/RiskService";
import RiskAssesment from "../../model/RiskAssessmentModel";

export const assessRisk = async (req, res) => {
  try {
    const { memberId, monthYear } = req.body;

    if (!memberId || monthYear) {
      return res
        .status(400)
        .json({ message: "memberId and monthYear are required" });
    }
    const result = await RiskService.calculateRiskLevel(memberId, monthYear);
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getRiskByMonth = async (req, res) => {
  try {
    const { memberId, monthYear } = req.params;

    const risk = await RiskAssesment.findOne({ memberId, monthYear });

    if (!risk) {
      return res.status(400).json({ message: "Risk assessment not found" });
    }

    return res.status(200).json(risk);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const getRiskHistoryByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    if (!memberId) {
      return res.status(400).json("Risk history not found for this user ");
    }

    const history = await RiskAssesment.findOne({ memberId }).sort({
      monthYear: -1,
    });

    return res.status(200).json(history);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
