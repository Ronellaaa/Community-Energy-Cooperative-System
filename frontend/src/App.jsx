import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProjectsListPage  from "./pages/feature-1/ProjectList.jsx";
import CreateProjectPage from "./pages/feature-1/CreateProject.jsx";
import ProjectDetailPage from "./pages/feature-1/ProjectDetails.jsx";
import EditProjectPage   from "./pages/feature-1/EditProject.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/projects" replace />} />

        {/* Project routes */}
        <Route path="/projects" element={<ProjectsListPage />} />
        <Route path="/projects/create" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/edit" element={<EditProjectPage />} />

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