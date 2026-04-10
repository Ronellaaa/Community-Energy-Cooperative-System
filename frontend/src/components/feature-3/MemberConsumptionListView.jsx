import React from "react";
import { Link } from "react-router-dom";
import {
  formatBillingPeriod,
  formatCurrency,
} from "../../utils/feature-3/formatters";
import { getSlipActionLabel } from "../../hooks/feature-3/useMemberConsumption";

export default function MemberConsumptionListView({
  memberId,
  communityId,
  loading,
  searched,
  records,
  autoFillNotice,
  error,
  totalAmountOwed,
  onMemberIdChange,
  onCommunityIdChange,
  onSearch,
  onOpenUploadPage,
}) {
  return (
    <div className="f3mc-page">
      <div className="f3mc-aura f3mc-aura-a" />
      <div className="f3mc-aura f3mc-aura-b" />

      <div className="f3mc-shell">
        <section className="f3mc-hero">
          <div className="f3mc-panel">
            <span className="f3mc-kicker">Feature 3 Member View</span>
            <h1 className="f3mc-title">Electricity Bill Share</h1>
            <p className="f3mc-subtitle">
              Check how much you need to pay for your community electricity bill, including units consumed, billing period, payment status, and slip submission progress.
            </p>
          </div>

          <div className="f3mc-panel f3mc-statPanel">
            <span className="f3mc-statLabel">Total Amount Owed</span>
            <span className="f3mc-statValue">{formatCurrency(totalAmountOwed)}</span>
            <span className="f3mc-statHint">
              Based on all loaded billing periods for this member and community.
            </span>
          </div>
        </section>

        <section className="f3mc-panel">
          <form
            className="f3mc-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSearch();
            }}
          >
            <label className="f3mc-field">
              <span>Member ID</span>
              <input
                type="text"
                value={memberId}
                onChange={(event) => onMemberIdChange(event.target.value)}
                placeholder="same as approved user ID"
              />
            </label>

            <label className="f3mc-field">
              <span>Community ID</span>
              <input
                type="text"
                value={communityId}
                onChange={(event) => onCommunityIdChange(event.target.value)}
                placeholder="community MongoDB id"
              />
            </label>

            <button type="submit" className="f3mc-searchBtn" disabled={loading}>
              {loading ? "Loading..." : "View My Bill Details"}
            </button>

            <Link
              className={`f3mc-searchBtn${!memberId || !communityId ? " f3mc-searchBtnDisabled" : ""}`}
              to={
                memberId && communityId
                  ? `/feature-3/member-qr?memberId=${encodeURIComponent(memberId)}&communityId=${encodeURIComponent(communityId)}`
                  : "#"
              }
              onClick={(event) => {
                if (!memberId || !communityId) {
                  event.preventDefault();
                }
              }}
            >
              View My QR Code
            </Link>
          </form>

          {autoFillNotice ? <div className="f3mc-message f3mc-info">{autoFillNotice}</div> : null}
          {error ? <div className="f3mc-message f3mc-error">{error}</div> : null}

          <div className="f3mc-tableWrap">
            <table className="f3mc-table">
              <thead>
                <tr>
                  <th>Billing Period</th>
                  <th>Previous Reading</th>
                  <th>Current Reading</th>
                  <th>Units Consumed</th>
                  <th>Amount Owed</th>
                  <th>Payment Status</th>
                  <th>Slip Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {!loading && searched && records.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="f3mc-emptyState">
                      No member consumption records were found for this member and community.
                    </td>
                  </tr>
                ) : null}

                {records.map((record) => {
                  const canUploadSlip =
                    record.paymentStatus === "pending" &&
                    record.latestPaymentSlip?.status !== "pending" &&
                    record.latestPaymentSlip?.status !== "approved";

                  return (
                    <tr key={record._id}>
                      <td>{formatBillingPeriod(record.billingPeriod)}</td>
                      <td>{record.previousReading ?? "-"}</td>
                      <td>{record.currentReading ?? "-"}</td>
                      <td>{record.unitsConsumed ?? "-"}</td>
                      <td>{formatCurrency(record.amountOwed)}</td>
                      <td>
                        <span className={`f3mc-pill f3mc-pill-${record.paymentStatus || "pending"}`}>
                          {record.paymentStatus || "pending"}
                        </span>
                      </td>
                      <td>
                        <span className={`f3mc-pill f3mc-pill-${record.latestPaymentSlip?.status || "draft"}`}>
                          {record.latestPaymentSlip?.status || "not submitted"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="f3mc-rowBtn"
                          onClick={() => onOpenUploadPage(record)}
                          disabled={!canUploadSlip}
                        >
                          {getSlipActionLabel(record)}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
