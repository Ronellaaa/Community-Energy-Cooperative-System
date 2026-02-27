import reliefService from "../../services/energy-poverty-support/ReliefService";
import reiefDistribution from "../../model/ReliefDistributionModel";

export const recommendRelief = async (req, res) => {
  try {
    const { memberId, monthYear } = req.body;

    if (!memberId || !monthYear) {
      return res
        .status(400)
        .json({ message: "memberId and monthYear are required" });
    }

    const result = await reliefService.recommendRelief({ memberId, monthYear });

    if (!result)
      return res
        .status(200)
        .json({ message: "No relief recommended (low risk)" });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const approveRelief = async (req, res) => {
  try {
    const { memberId, monthYear, approverName } = req.body;

    if (!memberId || !monthYear || !approverName) {
      return res
        .status(400)
        .json({ message: "memberId, monthYear, approverName are required" });
    }

    const result = await reliefService.approveRelief({
      memberId,
      monthYear,
      approverName,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const rejectRelief = async (req, res) => {
  try {
    const { memberId, monthYear, approverName } = req.body;

    if (!memberId || !monthYear || !approverName) {
      return res
        .status(400)
        .json({ message: "memberId, monthYear, approverName are required" });
    }

    const result = await reliefService.rejectRelief({
      memberId,
      monthYear,
      approverName,
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const getReliefByMonth = async (req, res) => {
  try {
    const { memberId, monthYear } = req.params;

    const relief = await reiefDistribution.findOne({ memberId, monthYear });

    if (!relief) {
      return res.status(400).json({ message: "Relief not found" });
    }

    return res.status(200).json(relief);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
