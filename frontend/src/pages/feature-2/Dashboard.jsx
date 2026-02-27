import React, { useEffect, useState } from "react";
import "../../styles/feature-2/dashboard.css";
import Sidebar from "../../components/feature-2/Sidebar";
import Topbar from "../../components/feature-2/Topbar";
import CommunityCards from "../../components/feature-2/CommunityCards";
import TimelineCards from "../../components/feature-2/TimelineCards";
import MapPanel from "../../components/feature-2/MapPanel";
import ApplyMembershipCard from "../../components/feature-2/ApplyMembershipCard";

// membershipStatus values we will use:
// "none" (first timer), "pending", "verified", "approved", "rejected"
export default function Dashboard() {
  const [active, setActive] = useState("dashboard");

  // ✅ temporary logic: read from localStorage (later you can fetch /me)
  const [membershipStatus, setMembershipStatus] = useState("none");

  useEffect(() => {
    const s = localStorage.getItem("membershipStatus") || "none";
    setMembershipStatus(s);
  }, []);

  const isFirstTimer = membershipStatus === "none";
  const isWaiting =
    membershipStatus === "pending" || membershipStatus === "verified";
  const isApproved = membershipStatus === "approved";

  return (
    <div className="f2-root">
      <div className="f2-bgGlow f2-glow1" />
      <div className="f2-bgGlow f2-glow2" />

      <div className="f2-shell">
        {/* ✅ Lock sidebar when waiting (optional) */}
        <Sidebar
          active={active}
          setActive={setActive}
          locked={isWaiting} // you already added locked prop
        />

        <main className="f2-main">
          <Topbar />

          {/* ✅ 1) FIRST TIMER → Apply CTA banner */}
          {isFirstTimer ? (
            <div className="f2-banner">
              <div>
                <div className="f2-banner-title">Welcome to the Cooperative Portal</div>
                <div className="f2-banner-sub">
                  You’re logged in. Apply for membership to join a community project and receive benefits.
                </div>
              </div>
              <span className="f2-pill">NOT A MEMBER</span>
            </div>
          ) : null}

          {/* ✅ 2) WAITING → Pending banner */}
          {isWaiting ? (
            <div className="f2-banner pending">
              <div>
                <div className="f2-banner-title">Membership Pending Approval</div>
                <div className="f2-banner-sub">
                  Your application is under review. You will get access once approved.
                </div>
              </div>
              <span className="f2-pill">{membershipStatus.toUpperCase()}</span>
            </div>
          ) : null}

          <section className="f2-grid">
            <div className="f2-left">
              {/* ✅ FIRST TIMER: show Apply card instead of timeline */}
              {isFirstTimer ? (
                <ApplyMembershipCard
                  onApplied={(newStatus = "pending") => {
                    localStorage.setItem("membershipStatus", newStatus);
                    setMembershipStatus(newStatus);
                  }}
                />
              ) : (
                <TimelineCards
                  mode={isWaiting ? "pending" : "member"} // keep your component behavior
                  status={membershipStatus}
                />
              )}

              {/* ✅ Show communities only when approved (or show preview if you want) */}
              {isApproved ? <CommunityCards /> : null}
            </div>

            <div className="f2-right">
              <MapPanel mode={isWaiting ? "pending" : "member"} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}