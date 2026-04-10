import { apiRequest } from "../../../api";

const getToken = () => localStorage.getItem("token");

export const getCurrentAuthUser = () => {
  try {
    const stored = JSON.parse(localStorage.getItem("user") || "null");
    if (!stored) return null;
    return {
      id: stored.id || stored._id || stored.userId || "",
      name: stored.name || "User",
      role: stored.role || "USER",
      communityId: stored.communityId || null,
    };
  } catch {
    return null;
  }
};

export const financeRequest = (path, options) =>
  apiRequest(path, {
    ...options,
    token: getToken(),
  });

export const paginateItems = (items, page, pageSize) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(totalPages, Math.max(1, page));
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    totalItems: items.length,
  };
};

export const buildProjectBundle = async (projectId) => {
  const [project, summaryRes, recordsRes, paymentsRes, expensesRes, sourcesRes] = await Promise.all([
    financeRequest(`/api/projects/${projectId}`),
    financeRequest(`/api/funding-records/summary/${projectId}`),
    financeRequest(`/api/funding-records/project/${projectId}`),
    financeRequest(`/api/member-payments/project/${projectId}`),
    financeRequest(`/api/maintenance-expenses/project/${projectId}`),
    financeRequest("/api/funding-sources"),
  ]);

  return {
    project,
    summary: summaryRes.data,
    fundingRecords: recordsRes.data || [],
    memberPayments: paymentsRes.data || [],
    maintenanceExpenses: expensesRes.data || [],
    fundingSources: sourcesRes.data || [],
  };
};

export const loadFinanceProjects = async () => {
  const projects = await financeRequest("/api/projects");
  const bundles = await Promise.all(
    (projects || []).map(async (project) => {
      const summaryRes = await financeRequest(`/api/funding-records/summary/${project._id}`);
      return {
        project,
        summary: summaryRes.data,
      };
    }),
  );

  return bundles.map(({ project, summary }) => ({
    id: project._id,
    name: project.name,
    type: project.type,
    assignedMembers: project.assignedMembers || [],
    projectStatus: project.status,
    officerApprovalStatus:
      project.status === "Approved" || project.status === "Active"
        ? "Approved by Officer"
        : summary.availableForInstallation >= summary.projectCost
          ? "Ready for Approval"
          : "Pending Officer Review",
    targetAmount: summary.projectCost,
    minimumRequiredAmount: summary.projectCost,
    collectedAmount: summary.availableForInstallation,
    fundingPercentage: summary.projectCost
      ? Math.min(100, Math.round((summary.availableForInstallation / summary.projectCost) * 100))
      : 0,
    readyForApproval: summary.availableForInstallation >= summary.projectCost,
    status:
      project.status === "Active"
        ? "Active"
        : project.status === "Approved"
          ? "Approved"
          : summary.availableForInstallation >= summary.projectCost
            ? "Ready for Approval"
            : "Collecting Funds",
    summary,
  }));
};
