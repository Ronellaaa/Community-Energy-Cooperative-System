import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProjectsListPage from "./pages/feature-1/ProjectList.jsx";
import CreateProjectPage from "./pages/feature-1/CreateProject.jsx";
import ProjectDetailPage from "./pages/feature-1/ProjectDetails.jsx";
import EditProjectPage from "./pages/feature-1/EditProject.jsx";
import BillForm from "./components/BillFormFeature3";

import Login from "./pages/feature-2/Login";
import Register from "./pages/feature-2/Register";
import PendingApproval from "./pages/feature-2/PendingApproval";
import OfficerDashboard from "./pages/feature-2/OfficerDashboard";
import "./styles/feature-2/auth.css";
import ProtectedRoute from "./components/feature-2/ProtectedRoute";
import JoinCommunity from "./pages/feature-2/JoinCommunity";
import AdminOfficers from "./pages/feature-2/AdminOfficers";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        // <Route path="/" element={<Navigate to="/projects" replace />} />
        {/* Project routes */}
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
        <Route
          path="/add-bill"
          element={
            <div>
              <h1 style={{ color: "red" }}>TEST: Route is working!</h1>
              <BillForm />
            </div>
          }
        />
        {/* 404 */}
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
                ← Go to Projects
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
