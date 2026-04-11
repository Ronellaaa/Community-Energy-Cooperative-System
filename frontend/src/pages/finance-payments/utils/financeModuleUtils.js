export const formatCurrency = (value) =>
  `LKR ${Number(value || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 0,
  })}`;

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getBadgeType = (status) => {
  const value = String(status || "").toUpperCase();

  if (["RECEIVED", "ACTIVE", "COMPLETED", "APPROVED"].includes(value)) {
    return "success";
  }
  if (["PENDING", "COLLECTING FUNDS"].includes(value)) {
    return "warning";
  }
  if (["REJECTED", "INACTIVE", "OVERDUE"].includes(value)) {
    return "danger";
  }
  return "info";
};

export const getProjectStatusLabel = (project, summary) => {
  if (project?.status === "Active") return "Active";
  if (project?.status === "Approved") return "Approved";
  if ((summary?.availableForInstallation || 0) >= (summary?.projectCost || 0) && summary?.projectCost) {
    return "Ready for Approval";
  }
  return "Collecting Funds";
};

export const filterProjectsForUser = (projects, userId) =>
  projects.filter((project) =>
    Array.isArray(project.assignedMembers) &&
    project.assignedMembers.some((member) => (member?._id || member?.id || member) === userId),
  );
