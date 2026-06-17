import React from "react";
import StatusBadge from "./StatusBadge";
import { formatLKR } from "../../pages/finance-payments/utils/financeModuleUtils";

export default function DummyProjectCard({ project, onView }) {
  return (
    <div className="fp-card fp-card--pad fp-stack">
      <div className="fp-inline-item-head">
        <div>
          <strong>{project.name}</strong>
          <p>{project.type}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="fp-grid fp-grid--2">
        <div className="fp-metric">
          <label>Target Amount</label>
          <span>{formatLKR(project.targetAmount)}</span>
        </div>
        <div className="fp-metric">
          <label>Collected Amount</label>
          <span>{formatLKR(project.collectedAmount)}</span>
        </div>
      </div>

      <div className="fp-progress">
        <div style={{ width: `${project.fundingPercentage}%` }} />
      </div>
      <span>{project.fundingPercentage}% funded</span>

      <button type="button" className="fp-button-secondary" onClick={() => onView(project)}>
        View Project
      </button>
    </div>
  );
}
