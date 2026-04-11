import { financePaymentsApi } from "../../../api";

export const getStoredFinanceUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user
      ? {
          id: user.id || user._id || "",
          name: user.name || "User",
          role: user.role || "USER",
          communityId: user.communityId || null,
        }
      : null;
  } catch {
    return null;
  }
};

export const isFinanceManager = (role) => role === "ADMIN" || role === "OFFICER";

export const paginateItems = (items, page, pageSize = 6) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (safePage - 1) * pageSize;

  return {
    page: safePage,
    totalPages,
    items: items.slice(startIndex, startIndex + pageSize),
  };
};

export const loadFinanceProjects = async () => {
  const projects = await financePaymentsApi.getProjects();
  const projectList = Array.isArray(projects) ? projects : [];

  const projectsWithSummary = await Promise.all(
    projectList.map(async (project) => {
      try {
        const summaryRes = await financePaymentsApi.getFundingSummary(project._id);
        return {
          ...project,
          financeSummary: summaryRes?.data || {},
        };
      } catch {
        return {
          ...project,
          financeSummary: {},
        };
      }
    }),
  );

  return projectsWithSummary;
};

export const loadProjectFinanceBundle = async (projectId) => {
  const [project, summaryRes, recordRes, contributionRes, maintenanceRes, sourceRes] = await Promise.all([
    financePaymentsApi.getProject(projectId),
    financePaymentsApi.getFundingSummary(projectId),
    financePaymentsApi.getFundRecords(projectId),
    financePaymentsApi.getMemberContributions(projectId),
    financePaymentsApi.getMaintenanceRecords(projectId),
    financePaymentsApi.getFundSources(),
  ]);

  return {
    project,
    summary: summaryRes?.data || {},
    fundRecords: recordRes?.data || [],
    contributions: contributionRes?.data || [],
    maintenanceRecords: maintenanceRes?.data || [],
    fundSources: sourceRes?.data || [],
  };
};

export const loadCommunityMembersForProject = async (project, role) => {
  if (!project?.communityId?._id && !project?.communityId) {
    return project?.assignedMembers || [];
  }

  if (role !== "ADMIN") {
    return project?.assignedMembers || [];
  }

  try {
    const users = await financePaymentsApi.getAdminUsers();
    const communityId = project.communityId?._id || project.communityId;
    return Array.isArray(users)
      ? users.filter((user) => (user.communityId?._id || user.communityId) === communityId)
      : project?.assignedMembers || [];
  } catch {
    return project?.assignedMembers || [];
  }
};

export { financePaymentsApi };
