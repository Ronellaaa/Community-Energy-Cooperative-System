import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/feature-2/ProtectedRoute";

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
import FinanceDashboard from "./pages/finance-payments/FinanceDashboard.jsx";
import FundSourcePage from "./pages/finance-payments/FundSourcePage.jsx";
import FundRecordPage from "./pages/finance-payments/FundRecordPage.jsx";
import MaintenancePage from "./pages/finance-payments/MaintenancePage.jsx";
import MemberContributionPage from "./pages/finance-payments/MemberContributionPage.jsx";
import ProjectPaymentsPage from "./pages/finance-payments/ProjectPaymentsPage.jsx";

import Login from "./pages/feature-2/Login";
import Register from "./pages/feature-2/Register";
import OfficerDashboard from "./pages/feature-2/OfficerDashboard";
import "./styles/feature-2/auth.css";
import JoinCommunity from "./pages/feature-2/JoinCommunity";
import AdminOfficers from "./pages/feature-2/AdminOfficers";
import MyCommunity from "./pages/feature-2/MyCommunity";
//import FundingRecord from "./pages/feature-3/FundingRecord.jsx";
import EnergyHero from "./pages/EnergyHero.jsx";
import AboutUs from "./pages/AboutUs.jsx";

import "./App.css";

export default function App() {
  return (
    <Routes>
      {/* <Route path="/projects" element={<ProjectsListPage />} />
      <Route path="/projects/create" element={<CreateProjectPage />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/projects/:id/edit" element={<EditProjectPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/join-community" element={<JoinCommunity />} />
      <Route path="/my-community" element={<MyCommunity />} />
      <Route path="/officer/dashboard" element={<OfficerDashboard />} />
      <Route path="/admin/officers" element={<AdminOfficers />} /> */}

      <Route path="/home" element={<EnergyHero />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/join-community" element={<JoinCommunity />} />
      <Route
        path="/my-community"
        element={
          <ProtectedRoute allowRoles={["USER"]}>
            <MyCommunity />
          </ProtectedRoute>
        }
      />
      <Route path="/officer/dashboard" element={<OfficerDashboard />} />
      <Route path="/admin/officers" element={<AdminOfficers />} />

{/* visala */}

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
      {/* <Route
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
     */}

      <Route path="/projects" element={<ProjectsListPage />} />
      <Route
        path="/projects/create/:communityId"
        element={<CreateProjectPage />}
      />
      <Route path="/projects/:id/edit" element={<EditProjectPage />} />
      <Route path="/my-projects/:communityId" element={<UserProjects />} />
      <Route path="/projects/:id" element={<ProjectDetailPage />} />
      <Route path="/user/project/:id" element={<UserProjectDetails />} />
    
      <Route
        path="/finance-payments/dashboard"
        element={
          <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
            <FinanceDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-payments/project/:projectId"
        element={
          <ProtectedRoute allowRoles={["USER", "OFFICER", "ADMIN"]}>
            <ProjectPaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-payments/fund-sources"
        element={
          <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
            <FundSourcePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-payments/fund-records"
        element={
          <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
            <FundRecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-payments/maintenance"
        element={
          <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
            <MaintenancePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-payments/member-contributions"
        element={
          <ProtectedRoute allowRoles={["OFFICER", "ADMIN"]}>
            <MemberContributionPage />
          </ProtectedRoute>
        }
      />

      {/* <Route path="/funding-record/:projectId" element={<FundingRecord />} /> */}

      {/* <Route
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
      /> */}
    </Routes>
  );
}
