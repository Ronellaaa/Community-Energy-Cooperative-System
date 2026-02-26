import Project from "../../model/feature-1/Project.js";
import { calculateProjectMetrics } from "../../utils/feature-1/projectCalculator.js";

export const createProject = async (data) => {
  const { monthlyGeneration, monthlySavings } =
    calculateProjectMetrics(data.capacityKW);

  const project = new Project({
    ...data,
    expectedMonthlyGeneration: monthlyGeneration,
    expectedMonthlySavings: monthlySavings
  });

  return await project.save();
};

export const getAllProjects = async () => {
  return await Project.find();
};

export const getProjectById = async (id) => {
  return await Project.findById(id);
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

  const members = Array.isArray(project.assignedMembers) ? project.assignedMembers : [];
  if (members.length < 5) throw new Error("Minimum 5 members must be assigned"); 

  project.status = "Approved";
  return await project.save();
};

export const activateProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new Error("Project not found");
  if (project.status !== "Approved") throw new Error("Project must be approved first");

  const totalFunding = project.totalFunding || 0;
  if (totalFunding < project.cost) throw new Error("Project funding is not sufficient");

  project.status = "Active";
  return await project.save();
};