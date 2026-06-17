import React from "react";
import "./../../styles/feature-2/sidebar.css";
import {
  LayoutDashboard,
  Users,
  MapPin,
  ShieldCheck,
  Settings,
  Lock,
} from "lucide-react";

const items = [
  { key: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { key: "communities", label: "Communities", Icon: Users },
  { key: "applications", label: "Applications", Icon: ShieldCheck },
  { key: "map", label: "Map", Icon: MapPin },
  { key: "settings", label: "Settings", Icon: Settings },
];

export default function Sidebar({ active, setActive, locked = false }) {
  const onNav = (key) => {
    if (locked) return;          // ✅ stop switching when pending
    setActive(key);
  };

  return (
    <aside className="f2-side">
      <div className="f2-sideInner">
        <div className="f2-logo" title="Community Energy">
          CE
        </div>

        <nav className="f2-nav">
          {items.map(({ key, label, Icon }) => {
            const isActive = active === key;

            return (
              <button
                key={key}
                className={`f2-navBtn ${isActive ? "active" : ""} ${
                  locked ? "locked" : ""
                }`}
                onClick={() => onNav(key)}
                title={locked ? `${label} (Locked until approval)` : label}
                type="button"
              >
                <Icon size={20} />
                {locked && key !== "dashboard" && <Lock size={14} className="f2-lock" />}
                {isActive && <span className="f2-activeDot" />}
              </button>
            );
          })}
        </nav>

        <div className="f2-profile" title="Profile" />
      </div>
    </aside>
  );
}