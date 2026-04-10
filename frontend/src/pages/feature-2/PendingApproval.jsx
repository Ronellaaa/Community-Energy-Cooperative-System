import React, { useState } from "react";
import "../../styles/feature-2/dashboard.css";
import Sidebar from "../../components/feature-2/Sidebar";
import Topbar from "../../components/feature-2/Topbar";
import TimelineCards from "../../components/feature-2/TimelineCards";
import MapPanel from "../../components/feature-2/MapPanel";

export default function PendingApproval() {
  const [active, setActive] = useState("timeline");

  return (
    
    <div className="f2-root">
      <div className="f2-bgGlow f2-glow1" />
      <div className="f2-bgGlow f2-glow2" />


      <div className="f2-shell">
        {/* Sidebar but locked */}
        <Sidebar active={active} setActive={() => {}} locked />

        <main className="f2-main">
          <Topbar />

          {/* ✅ Pending banner */}
          <div className="f2-banner pending">
            <div>
              <div className="f2-banner-title">Membership Pending Approval</div>
              <div className="f2-banner-sub">
                Your application is submitted. Committee will verify your meter and approve you.
              </div>
            </div>
            <span className="f2-pill">PENDING</span>
          </div>

          <section className="f2-grid">
            <div className="f2-left">
              {/* Timeline should show pending steps */}
              <TimelineCards mode="pending" />
            </div>

            <div className="f2-right">
              {/* Big panel but show “locked” state */}
              <MapPanel mode="pending" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}