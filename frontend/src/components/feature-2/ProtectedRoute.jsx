import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowRoles }) {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");
  let role = storedRole;

  if (!role) {
    try {
      role = JSON.parse(localStorage.getItem("user") || "null")?.role || "";
    } catch {
      role = "";
    }
  }

  if (!token) return <Navigate to="/login" replace />;

  if (allowRoles && !allowRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
