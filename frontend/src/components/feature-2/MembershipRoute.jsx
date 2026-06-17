import { Navigate } from "react-router-dom";

export default function MembershipRoute({
  children,
  requireStatus = "approved",
}) {
  const status = localStorage.getItem("membershipStatus") || "pending";

  if (status !== requireStatus) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
}
