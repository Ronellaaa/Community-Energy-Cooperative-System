import React from "react";
import {
  formatBillingPeriod,
  formatCurrency,
  formatDateTime,
} from "../../utils/feature-3/formatters";

export default function PaymentSlipsTable({
  paymentSlips,
  loading,
  activeSlipId,
  onUpdateStatus,
}) {
  return (
    <div className="f3cb-tableWrap">
      <table className="f3cb-table">
        <thead>
          <tr>
            <th>Payer</th>
            <th>Member ID</th>
            <th>Community ID</th>
            <th>Billing Period</th>
            <th>Amount Paid</th>
            <th>Reference</th>
            <th>Payment Date</th>
            <th>Slip Status</th>
            <th>Slip File</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {!loading && paymentSlips.length === 0 ? (
            <tr>
              <td colSpan="10" className="f3cb-emptyState">
                No payment slips found for the current filter.
              </td>
            </tr>
          ) : null}

          {paymentSlips.map((paymentSlip) => {
            const isPending = paymentSlip.status === "pending";
            const isProcessing = activeSlipId === paymentSlip._id;

            return (
              <tr key={paymentSlip._id}>
                <td>{paymentSlip.payerName}</td>
                <td>{paymentSlip.memberId}</td>
                <td>{paymentSlip.communityId}</td>
                <td>{formatBillingPeriod(paymentSlip.billingPeriod)}</td>
                <td>{formatCurrency(paymentSlip.amountPaid)}</td>
                <td>{paymentSlip.referenceNumber}</td>
                <td>{formatDateTime(paymentSlip.paymentDate)}</td>
                <td>
                  <span className={`f3cb-pill f3cb-pill-${paymentSlip.status}`}>
                    {paymentSlip.status}
                  </span>
                </td>
                <td>
                  {paymentSlip.slipImage?.url ? (
                    <a
                      href={paymentSlip.slipImage.url}
                      target="_blank"
                      rel="noreferrer"
                      className="f3cb-linkBtn"
                    >
                      View Slip
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  <div className="f3cb-actionGroup">
                    <button
                      type="button"
                      className="f3cb-actionBtn f3cb-actionBtnApprove"
                      onClick={() => onUpdateStatus(paymentSlip._id, "approved")}
                      disabled={!isPending || isProcessing}
                    >
                      {isProcessing ? "Updating..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      className="f3cb-actionBtn f3cb-actionBtnReject"
                      onClick={() => onUpdateStatus(paymentSlip._id, "rejected")}
                      disabled={!isPending || isProcessing}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
