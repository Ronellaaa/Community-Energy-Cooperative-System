import React from "react";
import { formatLKR } from "../../pages/finance-payments/utils/financeModuleUtils";

export default function ProgressCard({
  title,
  targetAmount,
  collectedAmount,
  percentage,
}) {
  return (
    <div className="fp-card fp-card--pad fp-metric">
      <label>{title}</label>
      <strong>{percentage}%</strong>
      <div className="fp-progress">
        <div style={{ width: `${Math.min(100, percentage)}%` }} />
      </div>
      <span>
        {formatLKR(collectedAmount)} raised of {formatLKR(targetAmount)}
      </span>
    </div>
  );
}
