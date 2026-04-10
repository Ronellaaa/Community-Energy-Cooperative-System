import React from "react";
import {
  formatBillingPeriod,
  formatCurrency,
  formatDateTime,
} from "../../utils/feature-3/formatters";

function BillBreakdown({ bill, collectionSummary, memberCollections }) {
  return (
    <div className="f3cb-breakdown">
      <div className="f3cb-breakdownHeader">
        <div>
          <h3 className="f3cb-breakdownTitle">Collection Breakdown</h3>
          <p className="f3cb-breakdownText">
            {formatBillingPeriod(bill.billingPeriod)} for community <strong>{bill.communityId}</strong>. Distributed {formatDateTime(bill.distributedAt)}.
          </p>
        </div>

        {collectionSummary ? (
          <div className="f3cb-statGrid">
            <div className="f3cb-statCard">
              <span>Collected</span>
              <strong>{formatCurrency(collectionSummary.totalPaidAmount)}</strong>
            </div>
            <div className="f3cb-statCard">
              <span>Still Due</span>
              <strong>{formatCurrency(collectionSummary.totalRemainingAmount)}</strong>
            </div>
            <div className="f3cb-statCard">
              <span>Completion</span>
              <strong>{collectionSummary.completionPercentage}%</strong>
            </div>
          </div>
        ) : null}
      </div>

      {collectionSummary ? (
        <div className="f3cb-breakdownPills">
          <span className="f3cb-pill f3cb-pill-paid">Paid: {collectionSummary.paidMembersCount}</span>
          <span className="f3cb-pill f3cb-pill-unpaid">Unpaid: {collectionSummary.unpaidMembersCount}</span>
        </div>
      ) : null}

      {!collectionSummary ? (
        <div className="f3cb-inlineMessage">
          Distribute this community bill first to see member payment progress.
        </div>
      ) : memberCollections.length === 0 ? (
        <div className="f3cb-inlineMessage">
          No member allocation records were found for this bill yet.
        </div>
      ) : (
        <div className="f3cb-innerTableWrap">
          <table className="f3cb-innerTable">
            <thead>
              <tr>
                <th>Member</th>
                <th>Units</th>
                <th>Amount Owed</th>
                <th>Approved Paid</th>
                <th>Still Due</th>
                <th>Collection Status</th>
              </tr>
            </thead>
            <tbody>
              {memberCollections.map((member) => (
                <tr key={member.consumptionId}>
                  <td>
                    <div className="f3cb-memberCell">
                      <strong>{member.memberName}</strong>
                      <span>{member.memberId}</span>
                    </div>
                  </td>
                  <td>{member.unitsConsumed}</td>
                  <td>{formatCurrency(member.amountOwed)}</td>
                  <td>{formatCurrency(member.amountPaid)}</td>
                  <td>{formatCurrency(member.remainingAmount)}</td>
                  <td>
                    <span className={`f3cb-pill f3cb-pill-${member.collectionStatus}`}>
                      {member.collectionStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function CommunityBillsTable({
  bills,
  loading,
  activeBillId,
  expandedBillId,
  onDistribute,
  onToggleExpanded,
}) {
  return (
    <div className="f3cb-tableWrap">
      <table className="f3cb-table">
        <thead>
          <tr>
            <th>Bill Number</th>
            <th>Community ID</th>
            <th>Billing Period</th>
            <th>Total Amount</th>
            <th>Collected</th>
            <th>Remaining</th>
            <th>Members Paid</th>
            <th>Payment Status</th>
            <th>Distribution Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {!loading && bills.length === 0 ? (
            <tr>
              <td colSpan="10" className="f3cb-emptyState">
                No community bills found for the current filter.
              </td>
            </tr>
          ) : null}

          {bills.map((bill) => {
            const isDistributed = bill.distributionStatus === "distributed";
            const isProcessing = activeBillId === bill._id;
            const isExpanded = expandedBillId === bill._id;
            const collectionSummary = bill.collectionSummary;
            const memberCollections = bill.memberCollections || [];
            const paidLabel = collectionSummary
              ? `${collectionSummary.paidMembersCount}/${collectionSummary.membersCount}`
              : "-";

            return (
              <React.Fragment key={bill._id}>
                <tr>
                  <td>{bill.billNumber || "-"}</td>
                  <td>{bill.communityId}</td>
                  <td>{formatBillingPeriod(bill.billingPeriod)}</td>
                  <td>{formatCurrency(bill.totalAmount)}</td>
                  <td>{collectionSummary ? formatCurrency(collectionSummary.totalPaidAmount) : "-"}</td>
                  <td>{collectionSummary ? formatCurrency(collectionSummary.totalRemainingAmount) : "-"}</td>
                  <td>{paidLabel}</td>
                  <td>
                    <span className={`f3cb-pill f3cb-pill-${bill.paymentStatus || "pending"}`}>
                      {bill.paymentStatus || "pending"}
                    </span>
                  </td>
                  <td>
                    <span className={`f3cb-pill f3cb-pill-${bill.distributionStatus || "pending"}`}>
                      {bill.distributionStatus || "pending"}
                    </span>
                  </td>
                  <td>
                    <div className="f3cb-actionGroup">
                      <button
                        type="button"
                        className="f3cb-actionBtn"
                        onClick={() => onDistribute(bill._id)}
                        disabled={isDistributed || isProcessing}
                      >
                        {isDistributed ? "Distributed" : isProcessing ? "Distributing..." : "Distribute"}
                      </button>
                      <button
                        type="button"
                        className="f3cb-actionBtn f3cb-actionBtnSecondary"
                        onClick={() => onToggleExpanded(bill._id)}
                        disabled={!isDistributed}
                      >
                        {isExpanded ? "Hide Members" : "View Members"}
                      </button>
                    </div>
                  </td>
                </tr>

                {isExpanded ? (
                  <tr>
                    <td colSpan="10" className="f3cb-expandedCell">
                      <BillBreakdown
                        bill={bill}
                        collectionSummary={collectionSummary}
                        memberCollections={memberCollections}
                      />
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
