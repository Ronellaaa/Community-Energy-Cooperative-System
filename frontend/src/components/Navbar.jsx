import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  const role = user?.role || null;
  const links = [
    { to: "/join-community", label: "Communities" },
    { to: "/projects", label: "Projects" },
    { to: "/add-bill", label: "Billing" },
    ...(role === "OFFICER" || role === "ADMIN"
      ? [{ to: "/officer/dashboard", label: "Officer Panel" }]
      : []),
    ...(role === "ADMIN"
      ? [{ to: "/admin/officers", label: "Admin Panel" }]
      : []),
  ];
  const homeRoute =
    role === "ADMIN"
      ? "/admin/officers"
      : role === "OFFICER"
        ? "/officer/dashboard"
        : role === "USER"
          ? "/join-community"
          : "/login";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to={homeRoute} className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span>Eco<em>Coop</em></span>
        </Link>
        <div className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link${pathname.startsWith(link.to) ? " active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <div className="navbar-profile" title={user.email || "Guest"}>
                <span className="navbar-profile-label">Profile</span>
                <span className="navbar-profile-name">
                  {user.name || user.email}
                </span>
              </div>
              <button className="navbar-logout" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="navbar-auth-link" to="/login">
                Login
              </Link>
              <Link className="navbar-auth-link navbar-auth-primary" to="/register">
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
