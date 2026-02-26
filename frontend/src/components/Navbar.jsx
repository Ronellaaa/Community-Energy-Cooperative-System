import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span>Eco<em>Coop</em></span>
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link${pathname === "/" ? " active" : ""}`}>
            Projects
          </Link>
          <Link to="/create" className={`nav-link${pathname === "/create" ? " active" : ""}`}>
            + New Project
          </Link>
        </div>
      </div>
    </nav>
  );
}