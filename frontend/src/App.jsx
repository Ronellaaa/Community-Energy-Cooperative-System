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
import BillForm from "./components/BillFormFeature3";
import UserProjects from "./pages/feature-1/UserProjects.jsx";  
import UserProjectDetails from "./pages/feature-1/UserProjectDetails.jsx";
import FundRecordForm from "./pages/finance-payments/forms/FundingRecordForm.jsx";
import FinanceDashboard from "./pages/finance-payments/Finance-Dashboard.jsx";
import FinanceEditItemPage from "./pages/finance-payments/Finance-EditItem.jsx";
import FinanceSourcesPage from "./pages/finance-payments/Finance-Sources.jsx";
import CommunityProjectsPage from "./pages/finance-payments/CommunityProjectsPage.jsx";
import ProjectDetailsPage from "./pages/finance-payments/ProjectDetailsPage.jsx";
import MyPaymentsPage from "./pages/finance-payments/MyPaymentsPage.jsx";
import OfficerProjectReviewPage from "./pages/finance-payments/OfficerProjectReviewPage.jsx";

import Login from "./pages/feature-2/Login";
import Register from "./pages/feature-2/Register";
import OfficerDashboard from "./pages/feature-2/OfficerDashboard";
import "./styles/feature-2/auth.css";
import JoinCommunity from "./pages/feature-2/JoinCommunity";
import AdminOfficers from "./pages/feature-2/AdminOfficers";
//import FundingRecord from "./pages/feature-3/FundingRecord.jsx";

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
    
      <Routes>
        {/* Redirect root */}
        {/* Project routes */}
        <Route path="/projects" element={<ProjectsListPage />} />

        <Route path="/projects/create/:communityId" element={<CreateProjectPage />} />
        <Route path="/projects/:id/edit" element={<EditProjectPage />} />
        <Route path="/my-projects/:communityId" element={<UserProjects />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/user/project/:id"element={<UserProjectDetails />}/>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/finance-payments/dashboard"
          element={
            <ProtectedRoute allowRoles={["USER", "OFFICER", "ADMIN"]}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-payments/dashboard/:projectId"
          element={
            <ProtectedRoute allowRoles={["USER", "OFFICER", "ADMIN"]}>
              <FinanceDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-payments/community-projects"
          element={
            <ProtectedRoute allowRoles={["USER"]}>
              <CommunityProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-payments/project/:projectId"
          element={
            <ProtectedRoute allowRoles={["USER", "OFFICER", "ADMIN"]}>
              <ProjectDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-payments/my-payments"
          element={
            <ProtectedRoute allowRoles={["USER"]}>
              <MyPaymentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-payments/officer-review"
          element={
            <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
              <OfficerProjectReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-payments/sources/:projectId"
          element={
            <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
              <FinanceSourcesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance-payments/edit/:entity/:projectId/:id"
          element={
            <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
              <FinanceEditItemPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/join-community" element={<JoinCommunity />} />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/admin/officers" element={<AdminOfficers />} />
        {/* <Route path="/funding-record/:projectId" element={<FundingRecord />} /> */}333333333333333333
        
        <Route
            path="/fund-record/:id"
            element={
              <ProtectedRoute allowRoles={["USER", "OFFICER", "ADMIN"]}>
                <FundRecordForm />
              </ProtectedRoute>
            }
        />
        <Route
          path="/add-bill"
          element={
            <div>
              <h1 style={{ color: "red" }}>TEST: Route is working!</h1>
              <BillForm />
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
