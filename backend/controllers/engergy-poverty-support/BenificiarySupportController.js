import BeneficiaryApplication from "../../model/BeneficiaryApplicationModel";

export const createApplication = async (req, res) => {
  try {
    const { memberId, reason, documents } = req.body;

    if (!memberId)
      return res.status(400).json({ message: "memberId is required" });

    const application = await BeneficiaryApplication.create({
      memberId,
      reason,
      documents: documents || [],
      status: "pending",
    });

    return res.status(201).json(application);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};

export const getApplicationsByMember = async (req, res) => {
  try {
    const { memberId } = req.params;

    const application = (
      await BeneficiaryApplication.find({ memberId })
    ).toSorted({ reviewedAt: -1, _id: -1 });

    return res.status(201).json(application);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
export const getPendingApplications = async (req, res) => {
  try {
    const application = await BeneficiaryApplication.find({
      status: "pending",
    }).sort({ _id: -1 });
    return res.status(201).json(application);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
export const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewedBy } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "status must be 'approved' or 'rejected'" });
    }
    if (!reviewedBy) {
      return res.status(400).json({ message: "reviewedBy is required" });
    }

    const updated = await BeneficiaryApplication.findByIdAndUpdate(
      id,
      { status, reviewedBy, reviewedAt: new Date() },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
