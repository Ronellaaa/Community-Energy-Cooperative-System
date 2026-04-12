import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";


const mockProject = jest.fn(); 

mockProject.findOne = jest.fn();
mockProject.findById = jest.fn();
mockProject.find = jest.fn();
mockProject.findByIdAndUpdate = jest.fn();
mockProject.findByIdAndDelete = jest.fn();

const mockFundingRecord = {
  aggregate: jest.fn(),
};

const mockCommunity = {
  findById: jest.fn(),
};

const mockCalculateMetrics = jest.fn();

/* ================= MODULE MOCKING ================= */

jest.unstable_mockModule("../../model/feature-1/Project.js", () => ({
  default: mockProject,
}));

jest.unstable_mockModule(
  "../../model/finance-payments/fundingRecordModel.js",
  () => ({
    default: mockFundingRecord,
  })
);

jest.unstable_mockModule("../../model/Community.js", () => ({
  default: mockCommunity,
}));

jest.unstable_mockModule(
  "../../utils/feature-1/projectCalculator.js",
  () => ({
    calculateProjectMetrics: mockCalculateMetrics,
  })
);

const ProjectService = await import(
  "../../services/feature-1/projectService.js"
);


describe("ProjectService.createProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should create project successfully", async () => {
    mockProject.findOne.mockResolvedValue(null);

    mockCommunity.findById.mockResolvedValue({
      isApproved: true,
    });

    mockCalculateMetrics.mockReturnValue({
      monthlyGeneration: 100,
      monthlySavings: 50,
    });

    const mockSave = jest.fn().mockResolvedValue({ name: "Test Project" });

    mockProject.mockReturnValue({
      save: mockSave,
    });

    const data = {
      projectType: "Community",
      communityId: "123",
      capacityKW: 10,
    };

    const result = await ProjectService.createProject(data);

    expect(result.name).toBe("Test Project");
  });

  test("should throw error if community not approved", async () => {
    mockProject.findOne.mockResolvedValue(null);

    mockCommunity.findById.mockResolvedValue({
      isApproved: false,
    });

    const data = {
      projectType: "Community",
      communityId: "123",
      capacityKW: 10,
    };

    await expect(ProjectService.createProject(data)).rejects.toThrow(
      "Community is not approved"
    );
  });
});


describe("ProjectService.approveProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should approve project", async () => {
    const mockSave = jest.fn().mockResolvedValue({ status: "Approved" });

    mockProject.findById.mockResolvedValue({
      cost: 1000,
      save: mockSave,
    });

    const result = await ProjectService.approveProject("123");

    expect(result.status).toBe("Approved");
  });

  test("should throw error if project not found", async () => {
    mockProject.findById.mockResolvedValue(null);

    await expect(
      ProjectService.approveProject("123")
    ).rejects.toThrow("Project not found");
  });
});


describe("ProjectService.rejectProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should reject project", async () => {
    const mockSave = jest.fn().mockResolvedValue({ status: "Rejected" });

    mockProject.findById.mockResolvedValue({
      save: mockSave,
    });

    const result = await ProjectService.rejectProject("123");

    expect(result.status).toBe("Rejected");
  });
});


describe("ProjectService.deleteProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should delete project", async () => {
    mockProject.findByIdAndDelete.mockResolvedValue({ _id: "123" });

    const result = await ProjectService.deleteProject("123");

    expect(result._id).toBe("123");
  });

  test("should throw error if project not found", async () => {
    mockProject.findByIdAndDelete.mockResolvedValue(null);

    await expect(
      ProjectService.deleteProject("123")
    ).rejects.toThrow("Project not found");
  });
});


describe("ProjectService.activateProject", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should activate project when funding is enough", async () => {
    const mockSave = jest.fn().mockResolvedValue({ status: "Active" });

    mockProject.findById.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      status: "Approved",
      cost: 1000,
      save: mockSave,
    });

    mockFundingRecord.aggregate.mockResolvedValue([
      { totalFunding: 1500 },
    ]);

    const result = await ProjectService.activateProject("123");

    expect(result.status).toBe("Active");
  });

  test("should throw error if funding is insufficient", async () => {
    mockProject.findById.mockResolvedValue({
      _id: new mongoose.Types.ObjectId(),
      status: "Approved",
      cost: 2000,
    });

    mockFundingRecord.aggregate.mockResolvedValue([
      { totalFunding: 1000 },
    ]);

    await expect(
      ProjectService.activateProject("123")
    ).rejects.toThrow("Project funding is not sufficient");
  });
});