import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProjectsListPage from "./pages/feature-1/ProjectList.jsx";
import CreateProjectPage from "./pages/feature-1/CreateProject.jsx";
import ProjectDetailPage from "./pages/feature-1/ProjectDetails.jsx";
import EditProjectPage from "./pages/feature-1/EditProject.jsx";
import MeterReadingPage from "./pages/feature-3/MeterReadingPage.jsx";
import MemberQrPage from "./pages/feature-3/MemberQrPage.jsx";
import CommunityBillsAdminPage from "./pages/feature-3/CommunityBillsAdminPage.jsx";
import MemberConsumptionPage from "./pages/feature-3/MemberConsumptionPage.jsx";

import Login from "./pages/feature-2/Login";
import Register from "./pages/feature-2/Register";
import OfficerDashboard from "./pages/feature-2/OfficerDashboard";
import "./styles/feature-2/auth.css";
import JoinCommunity from "./pages/feature-2/JoinCommunity";
import AdminOfficers from "./pages/feature-2/AdminOfficers";

import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/projects" element={<ProjectsListPage />} />
      <Route path="/projects/create" element={<CreateProjectPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/projects/:id/edit" element={<EditProjectPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/join-community" element={<JoinCommunity />} />
      <Route path="/officer/dashboard" element={<OfficerDashboard />} />
      <Route path="/admin/officers" element={<AdminOfficers />} />
      <Route path="/feature-3/meter-reading" element={<MeterReadingPage />} />
      <Route path="/feature-3/member-qr" element={<MemberQrPage />} />
      <Route
        path="/feature-3/member-consumption"
        element={<MemberConsumptionPage />}
      />
      <Route
        path="/feature-3/admin/community-bills"
        element={<CommunityBillsAdminPage />}
      />
      <Route
        path="*"
        element={
          <div style={{ padding: 60, textAlign: "center", color: "#6b7a99" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 48,
                fontWeight: 800,
                color: "#1f2d42",
              }}
            >
              404
            </div>
            <a href="/projects" style={{ color: "#00e5a0" }}>
              Go to Projects
            </a>
          </div>
        }
      />
    </Routes>
  );
}
