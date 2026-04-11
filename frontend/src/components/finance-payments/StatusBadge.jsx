import React from "react";
import { getBadgeType } from "../../pages/finance-payments/utils/financeModuleUtils";

export default function StatusBadge({ text }) {
  return <span className={`fp-badge fp-badge--${getBadgeType(text)}`}>{text || "N/A"}</span>;
}
