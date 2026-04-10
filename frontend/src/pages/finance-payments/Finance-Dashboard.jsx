import React from "react";
import { useParams } from "react-router-dom";
import CommunityProjectsPage from "./CommunityProjectsPage.jsx";
import FinanceDashboard from "./FinanceDashboard.jsx";
import ProjectDetailsPage from "./ProjectDetailsPage.jsx";

const getCurrentRole = () => {
  const storedRole = localStorage.getItem("role");
  if (storedRole) return storedRole;

  try {
    return JSON.parse(localStorage.getItem("user") || "null")?.role || "";
  } catch {
    return "";
  }
};

export default function FinanceDashboardRoute() {
  const { projectId } = useParams();
  const role = getCurrentRole();
  const isManager = role === "ADMIN" || role === "OFFICER";

  if (projectId) {
    return <ProjectDetailsPage projectId={projectId} />;
  }

  if (!isManager) {
    return <CommunityProjectsPage />;
  }

  return <FinanceDashboard />;
}
