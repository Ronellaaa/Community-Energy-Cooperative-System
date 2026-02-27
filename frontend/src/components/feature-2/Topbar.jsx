import React from "react";
import "./../../styles/feature-2/topbar.css";

export default function Topbar() {
  return (
    <div className="f2-topbar f2-glass">
      <div>
        <div className="f2-title">Feature 2 • Community Setup</div>
        <div className="f2-subtitle">Approve members • Validate meters • Eligibility</div>
      </div>

      <div className="f2-actions">
        <button className="f2-btnGhost">Export</button>
        <button className="f2-btnPrimary">+ New Community</button>
      </div>
    </div>
  );
}