import FundingRecord from "../../model/finance-payments/fundingRecordModel.js";
import MemberPayment from "../../model/finance-payments/memberPaymentModel.js";
import MaintenanceExpense from "../../model/finance-payments/maintenanceExpenseModel.js";
import Project from "../../model/feature-1/Project.js";
import mongoose from "mongoose";

const FinanceService = {
  syncProjectFunding: async (projectId) => {
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      throw new Error("Invalid project ID");
    }

    const objectId = new mongoose.Types.ObjectId(projectId);

    const [receivedFunding, memberCollections] = await Promise.all([
      FundingRecord.aggregate([
        { $match: { projectId: objectId, status: "RECEIVED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      MemberPayment.aggregate([
        {
          $match: {
            projectId: objectId,
            paymentType: { $in: ["JOINING", "OTHER"] },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalFunding =
      Number(receivedFunding[0]?.total || 0) + Number(memberCollections[0]?.total || 0);

    await Project.findByIdAndUpdate(projectId, { totalFunding });
    return totalFunding;
  },

  getProjectFundingSummary: async (projectId) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid project ID");
      }

      const objectId = new mongoose.Types.ObjectId(projectId);
      const project = await Project.findById(projectId)
        .select("name cost totalFunding status")
        .lean();

      if (!project) throw new Error("Project not found");

      const projectCost = Number(project.cost || 0);

      const fundingAggregation = await FundingRecord.aggregate([
        { $match: { projectId: objectId } },
        { $group: { _id: "$status", total: { $sum: "$amount" } } },
      ]);

      const totalPromised = Number(
        fundingAggregation.find((item) => item._id === "PENDING")?.total || 0,
      );

      const totalReceived = Number(
        fundingAggregation.find((item) => item._id === "RECEIVED")?.total || 0,
      );

      const memberPaymentAggregation = await MemberPayment.aggregate([
        { $match: { projectId: objectId } },
        { $group: { _id: "$paymentType", total: { $sum: "$amount" } } },
      ]);

      const totalJoining = Number(
        memberPaymentAggregation
          .filter((item) => item._id === "JOINING" || item._id === "OTHER")
          .reduce((sum, item) => sum + (item.total || 0), 0),
      );

      const totalMaintenanceCollected = Number(
        memberPaymentAggregation.find(
          (item) => item._id === "MONTHLY_MAINTENANCE",
        )?.total || 0,
      );

      const maintenanceExpenseAggregation = await MaintenanceExpense.aggregate([
        { $match: { projectId: objectId } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const totalMaintenanceSpent = Number(
        maintenanceExpenseAggregation[0]?.total || 0,
      );

      const maintenanceFundBalance =
        totalMaintenanceCollected - totalMaintenanceSpent;
      const availableForInstallation = totalReceived + totalJoining;
      const remainingGap = Math.max(0, projectCost - availableForInstallation);

      return {
        projectId,
        projectName: project.name,
        projectStatus: project.status,
        projectCost,
        totalPromised,
        totalReceived,
        totalJoining,
        totalMaintenanceCollected,
        totalMaintenanceSpent,
        maintenanceFundBalance,
        availableForInstallation,
        remainingGap,
        totalFunding: Number(project.totalFunding || 0),
      };
    } catch (error) {
      throw new Error(
        `Failed to get project funding summary: ${error.message}`,
      );
    }
  },
};

export default FinanceService;
