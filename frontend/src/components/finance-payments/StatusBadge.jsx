import React from "react";

const badgeClassByStatus = {
  "Collecting Funds": "fp-badge fp-badge--collecting",
  "Ready for Approval": "fp-badge fp-badge--ready",
  Approved: "fp-badge fp-badge--approved",
  Active: "fp-badge fp-badge--active",
};

export default function StatusBadge({ status }) {
  return (
    <span className={badgeClassByStatus[status] || "fp-badge fp-badge--collecting"}>
      {status}
    </span>
  );
}
