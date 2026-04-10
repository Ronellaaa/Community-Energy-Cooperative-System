import mongoose from "mongoose";
import * as projectService from "../../services/feature-1/projectService.js";
import Project from "../../model/feature-1/Project.js";

export const create = async (req, res) => {
  try {
    const project = await projectService.createProject({...req.body,createdBy: req.user._id,communityId: req.body.communityId, 
});
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const getAll = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getOne = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    
    console.log("PROJECT:", project);
    console.log("USER:", req.user);

    const creatorId = project.createdBy?._id
      ? project.createdBy._id.toString()
      : project.createdBy?.toString();
    if (
      req.user.role !== "admin" &&
      creatorId !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    console.error("GET ONE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      createdBy: req.user._id
    }).populate("communityId");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getProjectsByCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const projects = await Project.find({
  communityId: new mongoose.Types.ObjectId(communityId),
}).populate("communityId");

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const update = async (req, res) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.body
    );
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await projectService.deleteProject(req.params.id);
    res.json({ message: "Deleted successfully" });
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

export const reject = async (req, res) => {
  try {
    const project = await projectService.rejectProject(req.params.id);
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