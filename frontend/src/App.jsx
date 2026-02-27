import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/feature-2/Login";
import Register from "./pages/feature-2/Register";
import PendingApproval from "./pages/feature-2/PendingApproval";
import OfficerDashboard from "./pages/feature-2/OfficerDashboard";
import "./styles/feature-2/auth.css";
import ProtectedRoute from "./components/feature-2/ProtectedRoute";
import JoinCommunity from "./pages/feature-2/JoinCommunity";
import AdminOfficers from "./pages/feature-2/AdminOfficers";

// function MemberDashboard() {
//   return (
//     <div style={{ padding: 20, color: "white" }}>
//       Member Dashboard (Approved)
//     </div>
//   );
// }

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/join-community" element={<JoinCommunity />} />
      <Route path="/officer/dashboard" element={<OfficerDashboard />} />
      <Route path="/admin/officers" element={<AdminOfficers />} />
    </Routes>
  );
}
