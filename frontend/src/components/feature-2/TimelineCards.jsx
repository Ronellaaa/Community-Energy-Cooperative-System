import React from "react";
import "./../../styles/feature-2/timeline.css";

export default function TimelineCards({ mode = "officer", status = "pending" }) {
  // ✅ Pending view shows only ONE card (for the logged-in user)
  if (mode === "pending") {
    const badge = status.toUpperCase();

    const steps =
      status === "approved"
        ? ["Application submitted", "Verified", "Approved & Eligible"]
        : status === "verified"
        ? ["Application submitted", "Meter validated", "Waiting approval"]
        : status === "rejected"
        ? ["Application submitted", "Rejected by committee", "Fix details & reapply"]
        : ["Application submitted", "Meter validation pending", "Officer review pending"];

    return (
      <div className="f2-stack">
        <div className="f2-stackHead">Your Application</div>

        <div className="f2-trackCard f2-glass highlight">
          <div className="f2-trackTop">
            <div className="f2-trackId">#YOUR-APPLICATION</div>
            <span className={`f2-pill ${badge.toLowerCase()}`}>{badge}</span>
          </div>

          <div className="f2-trackTitle">Member Application</div>

          <ul className="f2-steps">
            {steps.map((s, idx) => (
              <li key={idx} className="f2-step">
                <span className={`f2-dot ${idx === 0 ? "on" : ""}`} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // ✅ Officer view (your existing multiple cards)
  const cards = [
    {
      id: "#MOR-10H-001",
      badge: "PENDING",
      title: "Member Application",
      steps: [
        "Application submitted",
        "Meter validation pending",
        "Officer review pending",
      ],
      highlight: true,
    },
    {
      id: "#MOR-10H-002",
      badge: "VERIFIED",
      title: "Member Application",
      steps: ["Application submitted", "Meter validated", "Waiting approval"],
    },
    {
      id: "#MOR-10H-003",
      badge: "APPROVED",
      title: "Member Application",
      steps: ["Application submitted", "Verified", "Approved & Eligible"],
    },
  ];

  return (
    <div className="f2-stack">
      <div className="f2-stackHead">Timeline</div>

      {cards.map((c) => (
        <div
          key={c.id}
          className={`f2-trackCard f2-glass ${c.highlight ? "highlight" : ""}`}
        >
          <div className="f2-trackTop">
            <div className="f2-trackId">{c.id}</div>
            <span className={`f2-pill ${c.badge.toLowerCase()}`}>{c.badge}</span>
          </div>

          <div className="f2-trackTitle">{c.title}</div>

          <ul className="f2-steps">
            {c.steps.map((s, idx) => (
              <li key={idx} className="f2-step">
                <span className={`f2-dot ${idx === 0 ? "on" : ""}`} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}