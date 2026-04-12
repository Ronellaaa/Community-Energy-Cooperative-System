import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";

const mockFundingRecord = {
  aggregate: jest.fn(),
};

const mockMemberPayment = {
  aggregate: jest.fn(),
};

const mockMaintenanceExpense = {
  aggregate: jest.fn(),
};

const mockProject = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

jest.unstable_mockModule(
  "../../model/finance-payments/fundingRecordModel.js",
  () => ({
    default: mockFundingRecord,
  })
);

jest.unstable_mockModule(
  "../../model/finance-payments/memberPaymentModel.js",
  () => ({
    default: mockMemberPayment,
  })
);

jest.unstable_mockModule(
  "../../model/finance-payments/maintenanceExpenseModel.js",
  () => ({
    default: mockMaintenanceExpense,
  })
);

jest.unstable_mockModule("../../model/feature-1/Project.js", () => ({
  default: mockProject,
}));

const { default: FinanceService } = await import(
  "../../services/finance-payments/financeService.js"
);

describe("FinanceService.getProjectFundingSummary", () => {
  const validProjectId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return correct funding summary", async () => {
    mockProject.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          name: "Solar Project A",
          cost: 100000,
          totalFunding: 40000,
          status: "ACTIVE",
        }),
      }),
    });

    mockFundingRecord.aggregate.mockResolvedValue([
      { _id: "PENDING", total: 20000 },
      { _id: "RECEIVED", total: 30000 },
    ]);

    mockMemberPayment.aggregate.mockResolvedValue([
      { _id: "JOINING", total: 5000 },
      { _id: "OTHER", total: 2000 },
      { _id: "MONTHLY_MAINTENANCE", total: 3000 },
    ]);

    mockMaintenanceExpense.aggregate.mockResolvedValue([
      { _id: null, total: 1000 },
    ]);

    const result = await FinanceService.getProjectFundingSummary(validProjectId);

    expect(result).toEqual({
      projectId: validProjectId,
      projectName: "Solar Project A",
      projectStatus: "ACTIVE",
      projectCost: 100000,
      totalPromised: 20000,
      totalReceived: 30000,
      totalJoining: 7000,
      totalMaintenanceCollected: 3000,
      totalMaintenanceSpent: 1000,
      maintenanceFundBalance: 2000,
      availableForInstallation: 37000,
      remainingGap: 63000,
      totalFunding: 40000,
    });
  });

  test("should throw error for invalid project ID", async () => {
    await expect(
      FinanceService.getProjectFundingSummary("invalid-id")
    ).rejects.toThrow("Failed to get project funding summary: Invalid project ID");
  });

  test("should throw error if project is not found", async () => {
    mockProject.findById.mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    });

    await expect(
      FinanceService.getProjectFundingSummary(validProjectId)
    ).rejects.toThrow("Failed to get project funding summary: Project not found");
  });
});

describe("FinanceService.syncProjectFunding", () => {
  const validProjectId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should calculate total funding and update project", async () => {
    mockFundingRecord.aggregate.mockResolvedValue([{ _id: null, total: 15000 }]);
    mockMemberPayment.aggregate.mockResolvedValue([{ _id: null, total: 5000 }]);
    mockProject.findByIdAndUpdate.mockResolvedValue({});

    const result = await FinanceService.syncProjectFunding(validProjectId);

    expect(result).toBe(20000);
    expect(mockProject.findByIdAndUpdate).toHaveBeenCalledWith(validProjectId, {
      totalFunding: 20000,
    });
  });

  test("should throw error for invalid project ID", async () => {
    await expect(
      FinanceService.syncProjectFunding("wrong-id")
    ).rejects.toThrow("Invalid project ID");
  });
});