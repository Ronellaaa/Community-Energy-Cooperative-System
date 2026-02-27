import * as projectService from "../../services/feature-1/projectService.js";

export const create = async (req, res) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAll = async (req, res) => {
  const projects = await projectService.getAllProjects();
  res.json(projects);
};

export const getOne = async (req, res) => {
  const project = await projectService.getProjectById(req.params.id);
  res.json(project);
};

export const update = async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.json(project);
};

export const deleteProject = async (req, res) => {
  try {
    const project = await projectService.deleteProject(req.params.id);
    res.json({ message: "Deleted successfully", project });
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
};

export const approve = async (req, res) => {
  try {
    const project = await projectService.approveProject(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
};

export const activate = async (req, res) => {
  try {
    const project = await projectService.activateProject(req.params.id);
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message }); 
  }
};