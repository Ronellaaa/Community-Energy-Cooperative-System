import React from "react";
import "./../../styles/feature-2/communityCards.css";

export default function CommunityCards() {
  const stats = [
    { value: "10", label: "Houses" },
    { value: "6", label: "Approved" },
    { value: "3", label: "Pending" },
    { value: "1", label: "Rejected" },
  ];

  return (
    <div className="f2-metrics">
      {stats.map((s, i) => (
        <div key={i} className="f2-metricCard f2-glass">
          <div className="f2-metricValue">{s.value}</div>
          <div className="f2-metricLabel">{s.label}</div>
        </div>
      ))}
    </div>
  );
}