import Project from "../../model/feature-1/Project.js";
import FundingRecord from "../../model/finance-payments/fundingRecordModel.js";
import Community from "../../model/Community.js";
import mongoose from "mongoose";

import { calculateProjectMetrics } from "../../utils/feature-1/projectCalculator.js";

export const createProject = async (data) => {
  const existingProject = await Project.findOne({
      communityId: data.communityId,
    });

    if (existingProject) {
      throw new Error("A project already exists for this community");
    }
  const { projectType, communityId } = data;

  if (projectType === "Community") {
    if (!communityId) throw new Error("Community ID is required");

    const community = await Community.findById(communityId);

    if (!community) throw new Error("Community not found");

    if (!community.isApproved) {
      throw new Error("Community is not approved");
    }
  }

  const { monthlyGeneration, monthlySavings } =
    calculateProjectMetrics(data.capacityKW);

  const project = new Project({
    ...data,
    expectedMonthlyGeneration: monthlyGeneration,
    expectedMonthlySavings: monthlySavings,
  });

  return await project.save();
};

export const getAllProjects = async () => {
  return await Project.find().populate("communityId");
};

export const getProjectFunding = async (projectId) => {
  const result = await FundingRecord.aggregate([
    {
      $match: {
        projectId: new mongoose.Types.ObjectId(projectId), 
        status: "RECEIVED",
      },
    },
    {
      $group: {
        _id: "$projectId",
        totalFunding: { $sum: "$amount" },
      },
    },
  ]);

  return result[0]?.totalFunding || 0;
};

export const getProjectById = async (id) => {
  const project = await Project.findById(id)
  .populate("communityId")
  .populate("createdBy");
  if (!project) return null;

  const totalFunding = await getProjectFunding(project._id);

  return {
    ...project.toObject(),
    totalFunding,
  };
};

export const updateProject = async (id, data) => {
  if (data.capacityKW) {
    const { monthlyGeneration, monthlySavings } =
      calculateProjectMetrics(data.capacityKW);

    data.expectedMonthlyGeneration = monthlyGeneration;
    data.expectedMonthlySavings = monthlySavings;
  }

  return await Project.findByIdAndUpdate(id, data, { new: true });
};

export const deleteProject = async (id) => {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw new Error("Project not found"); 
  return project;
};

export const approveProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");
  if (!project.cost || project.cost <= 0) throw new Error("Project cost is invalid");

  project.status = "Approved";
  return await project.save();
};


export const rejectProject = async (id) => {
  const project = await Project.findById(id);

  if (!project) {
    throw new Error("Project not found");
  }
  project.status = "Rejected";
  return await project.save();
};

export const activateProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");

  if (project.status !== "Approved")
    throw new Error("Project must be approved first");

  // Calculate funding from FundingRecord table
  const result = await FundingRecord.aggregate([
   { $match: { projectId: new mongoose.Types.ObjectId(project._id), status: "RECEIVED" } },   
    {
      $group: {
        _id: "$projectId",
        totalFunding: { $sum: "$amount" },
      },
    },
  ]);

  const totalFunding = result[0]?.totalFunding || 0;

  if (totalFunding < project.cost) {
    throw new Error("Project funding is not sufficient");
  }

  project.status = "Active";
  return await project.save();
};