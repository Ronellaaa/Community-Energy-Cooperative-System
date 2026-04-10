import React from "react";
import { formatCurrency } from "../../utils/feature-3/formatters";

export default function CommunityBillsSummaryPanel({
  activeView,
  visibleCount,
  billCollectionTotals,
}) {
  return (
    <div className="f3cb-panel f3cb-summaryPanel">
      <span className="f3cb-summaryLabel">
        {activeView === "community-bills" ? "Outstanding Due" : "Visible Slips"}
      </span>
      <span className="f3cb-summaryValue">
        {activeView === "community-bills"
          ? formatCurrency(billCollectionTotals.totalRemainingAmount)
          : visibleCount}
      </span>
      <span className="f3cb-summaryHint">
        {activeView === "community-bills"
          ? `${billCollectionTotals.paidMembersCount} members have fully paid and ${billCollectionTotals.unpaidMembersCount} still need to pay.`
          : "Approving a slip marks the member's share as paid for that community bill."}
      </span>
    </div>
  );
}
