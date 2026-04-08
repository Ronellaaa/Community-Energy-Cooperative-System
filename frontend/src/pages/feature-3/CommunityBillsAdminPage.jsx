import React, { useEffect, useMemo, useState } from "react";
import "../../styles/feature-3/community-bills.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const monthFormatter = new Intl.DateTimeFormat("en", { month: "long" });

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatBillingPeriod = (billingPeriod = {}) => {
  const { month, year } = billingPeriod;

  if (!month || !year) {
    return "Not set";
  }

  return `${monthFormatter.format(new Date(year, month - 1, 1))} ${year}`;
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
};

export default function CommunityBillsAdminPage() {
  const [activeView, setActiveView] = useState("community-bills");
  const [bills, setBills] = useState([]);
  const [paymentSlips, setPaymentSlips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeBillId, setActiveBillId] = useState("");
  const [activeSlipId, setActiveSlipId] = useState("");
  const [distributionFilter, setDistributionFilter] = useState("all");
  const [paymentSlipFilter, setPaymentSlipFilter] = useState("pending");

  const visibleCount = useMemo(
    () =>
      activeView === "community-bills" ? bills.length : paymentSlips.length,
    [activeView, bills.length, paymentSlips.length],
  );

  const loadBills = async (statusFilter = distributionFilter) => {
    setLoading(true);
    setError("");

    try {
      const query =
        statusFilter && statusFilter !== "all"
          ? `?distributionStatus=${encodeURIComponent(statusFilter)}`
          : "";

      const response = await fetch(
        `${API_BASE_URL}/api/admin/community-bills${query}`,
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load community bills");
      }

      setBills(data.data || []);
    } catch (requestError) {
      setError(requestError.message || "Failed to load community bills");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentSlips = async (statusFilter = paymentSlipFilter) => {
    setLoading(true);
    setError("");

    try {
      const query =
        statusFilter && statusFilter !== "all"
          ? `?status=${encodeURIComponent(statusFilter)}`
          : "";

      const response = await fetch(`${API_BASE_URL}/api/admin/payment-slips${query}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load payment slips");
      }

      setPaymentSlips(data.data || []);
    } catch (requestError) {
      setError(requestError.message || "Failed to load payment slips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "community-bills") {
      loadBills();
      return;
    }

    loadPaymentSlips();
  }, [activeView]);

  const handleBillFilterChange = async (event) => {
    const nextFilter = event.target.value;
    setDistributionFilter(nextFilter);
    await loadBills(nextFilter);
  };

  const handlePaymentSlipFilterChange = async (event) => {
    const nextFilter = event.target.value;
    setPaymentSlipFilter(nextFilter);
    await loadPaymentSlips(nextFilter);
  };

  const handleDistribute = async (billId) => {
    setActiveBillId(billId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/community-bills/${billId}/distribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ distributedBy: "admin" }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to distribute community bill");
      }

      setNotice(data.message || "Community bill distributed successfully.");
      await loadBills();
    } catch (requestError) {
      setError(requestError.message || "Failed to distribute community bill");
    } finally {
      setActiveBillId("");
    }
  };

  const handlePaymentSlipStatusUpdate = async (paymentSlipId, status) => {
    setActiveSlipId(paymentSlipId);
    setError("");
    setNotice("");

    const rejectionReason =
      status === "rejected"
        ? window.prompt("Enter a rejection reason for this payment slip:")
        : "";

    if (status === "rejected" && !rejectionReason?.trim()) {
      setActiveSlipId("");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/payment-slips/${paymentSlipId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            rejectionReason,
            reviewedBy: "admin",
          }),
        },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment slip status");
      }

      setNotice(data.message || "Payment slip updated successfully.");
      await loadPaymentSlips();
      if (activeView === "community-bills") {
        await loadBills();
      }
    } catch (requestError) {
      setError(requestError.message || "Failed to update payment slip status");
    } finally {
      setActiveSlipId("");
    }
  };

  return (
    <div className="f3cb-page">
      <div className="f3cb-orb f3cb-orb-a" />
      <div className="f3cb-orb f3cb-orb-b" />

      <div className="f3cb-shell">
        <section className="f3cb-hero">
          <div className="f3cb-panel f3cb-heroPanel">
            <span className="f3cb-kicker">Feature 3 Admin</span>
            <h1 className="f3cb-title">Community Bills And Payment Slips</h1>
            <p className="f3cb-subtitle">
              Distribute community electricity bills, then review member payment slips and mark them approved or rejected.
            </p>
          </div>

          <div className="f3cb-panel f3cb-summaryPanel">
            <span className="f3cb-summaryLabel">
              {activeView === "community-bills" ? "Visible Bills" : "Visible Slips"}
            </span>
            <span className="f3cb-summaryValue">{visibleCount}</span>
            <span className="f3cb-summaryHint">
              {activeView === "community-bills"
                ? "Distributed bills are locked and cannot be distributed twice."
                : "Approving a slip marks the related member payment as paid."}
            </span>
          </div>
        </section>

        <section className="f3cb-panel">
          <div className="f3cb-viewSwitch">
            <button
              type="button"
              className={`f3cb-viewBtn ${activeView === "community-bills" ? "f3cb-viewBtnActive" : ""}`}
              onClick={() => setActiveView("community-bills")}
            >
              Community Bills
            </button>
            <button
              type="button"
              className={`f3cb-viewBtn ${activeView === "payment-slips" ? "f3cb-viewBtnActive" : ""}`}
              onClick={() => setActiveView("payment-slips")}
            >
              Payment Slips
            </button>
          </div>

          <div className="f3cb-toolbar">
            <div>
              <h2 className="f3cb-sectionTitle">
                {activeView === "community-bills" ? "Bills Table" : "Payment Slip Review"}
              </h2>
              <p className="f3cb-sectionText">
                {activeView === "community-bills"
                  ? "The status filter helps you quickly show only pending bills that still need to be distributed, instead of mixing them with already distributed records."
                  : "Review payment slips submitted by members, then approve them to mark the payment as paid or reject them so the member can upload a new slip."}
              </p>
            </div>

            <div className="f3cb-controls">
              {activeView === "community-bills" ? (
                <label className="f3cb-selectWrap">
                  <span>Status</span>
                  <select
                    value={distributionFilter}
                    onChange={handleBillFilterChange}
                    className="f3cb-select"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="distributed">Distributed</option>
                  </select>
                </label>
              ) : (
                <label className="f3cb-selectWrap">
                  <span>Slip Status</span>
                  <select
                    value={paymentSlipFilter}
                    onChange={handlePaymentSlipFilterChange}
                    className="f3cb-select"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>
              )}

              <button
                type="button"
                className="f3cb-refreshBtn"
                onClick={() =>
                  activeView === "community-bills" ? loadBills() : loadPaymentSlips()
                }
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {notice ? <div className="f3cb-message f3cb-success">{notice}</div> : null}
          {error ? <div className="f3cb-message f3cb-error">{error}</div> : null}

          {activeView === "community-bills" ? (
            <div className="f3cb-tableWrap">
              <table className="f3cb-table">
                <thead>
                  <tr>
                    <th>Bill Number</th>
                    <th>Community ID</th>
                    <th>Billing Period</th>
                    <th>Total Amount</th>
                    <th>Total Import</th>
                    <th>Payment Status</th>
                    <th>Distribution Status</th>
                    <th>Distributed At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && bills.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="f3cb-emptyState">
                        No community bills found for the current filter.
                      </td>
                    </tr>
                  ) : null}

                  {bills.map((bill) => {
                    const isDistributed =
                      bill.distributionStatus === "distributed";
                    const isProcessing = activeBillId === bill._id;

                    return (
                      <tr key={bill._id}>
                        <td>{bill.billNumber || "-"}</td>
                        <td>{bill.communityId}</td>
                        <td>{formatBillingPeriod(bill.billingPeriod)}</td>
                        <td>{formatCurrency(bill.totalAmount)}</td>
                        <td>{bill.totalImport ?? "-"}</td>
                        <td>
                          <span
                            className={`f3cb-pill f3cb-pill-${bill.paymentStatus || "pending"}`}
                          >
                            {bill.paymentStatus || "pending"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`f3cb-pill f3cb-pill-${bill.distributionStatus || "pending"}`}
                          >
                            {bill.distributionStatus || "pending"}
                          </span>
                        </td>
                        <td>{formatDateTime(bill.distributedAt)}</td>
                        <td>
                          <button
                            type="button"
                            className="f3cb-actionBtn"
                            onClick={() => handleDistribute(bill._id)}
                            disabled={isDistributed || isProcessing}
                          >
                            {isDistributed
                              ? "Distributed"
                              : isProcessing
                                ? "Distributing..."
                                : "Distribute"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
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
                              onClick={() =>
                                handlePaymentSlipStatusUpdate(
                                  paymentSlip._id,
                                  "approved",
                                )
                              }
                              disabled={!isPending || isProcessing}
                            >
                              {isProcessing ? "Updating..." : "Approve"}
                            </button>
                            <button
                              type="button"
                              className="f3cb-actionBtn f3cb-actionBtnReject"
                              onClick={() =>
                                handlePaymentSlipStatusUpdate(
                                  paymentSlip._id,
                                  "rejected",
                                )
                              }
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
          )}
        </section>
      </div>
    </div>
  );
}
