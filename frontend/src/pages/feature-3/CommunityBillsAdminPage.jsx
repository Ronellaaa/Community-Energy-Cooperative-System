import React from "react";
import AdminPaymentSlipDetailsDialog from "../../components/feature-3/AdminPaymentSlipDetailsDialog";
import BackButton from "../../components/feature-3/BackButton";
import CommunityBillsSummaryPanel from "../../components/feature-3/CommunityBillsSummaryPanel";
import CommunityBillsTable from "../../components/feature-3/CommunityBillsTable";
import PaymentSlipsTable from "../../components/feature-3/PaymentSlipsTable";
import PaymentSlipRejectionDialog from "../../components/feature-3/PaymentSlipRejectionDialog";
import { useCommunityBillsAdmin } from "../../hooks/feature-3/useCommunityBillsAdmin";
import "../../styles/feature-3/community-bills.css";

export default function CommunityBillsAdminPage() {
  const {
    activeView,
    setActiveView,
    bills,
    paymentSlips,
    expandedBillId,
    setExpandedBillId,
    loading,
    error,
    notice,
    activeBillId,
    activeSlipId,
    distributionFilter,
    paymentSlipFilter,
    visibleCount,
    billCollectionTotals,
    loadBills,
    loadPaymentSlips,
    handleBillFilterChange,
    handlePaymentSlipFilterChange,
    handleDistribute,
    handlePaymentSlipStatusUpdate,
    selectedPaymentSlip,
    isSlipDetailsOpen,
    detailsLoading,
    detailsError,
    openPaymentSlipDetails,
    closePaymentSlipDetails,
    rejectDialogState,
    openRejectDialog,
    closeRejectDialog,
    setRejectReason,
    submitRejectDialog,
  } = useCommunityBillsAdmin();

  return (
    <div className="f3cb-page">
      <div className="f3cb-orb f3cb-orb-a" />
      <div className="f3cb-orb f3cb-orb-b" />

      <div className="f3cb-shell">
        <section className="f3cb-hero">
          <div className="f3cb-panel f3cb-heroPanel">
            <div className="f3cb-heroHeader">
              <BackButton className="f3cb-backButton" />
              <div className="f3cb-heroContent">
                <span className="f3cb-kicker">Admin</span>
                <h1 className="f3cb-title">Community Bills And Payment Slips</h1>
                <p className="f3cb-subtitle">
                  Distribute community electricity bills, then use payment slips to
                  track how much has been collected and what is still due for each
                  community bill.
                </p>
              </div>
            </div>
          </div>

          <CommunityBillsSummaryPanel
            activeView={activeView}
            visibleCount={visibleCount}
            billCollectionTotals={billCollectionTotals}
          />
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
                {activeView === "community-bills"
                  ? "Bills Table"
                  : "Payment Slip Review"}
              </h2>
              <p className="f3cb-sectionText">
                {activeView === "community-bills"
                  ? "Use each distributed community bill to track collection progress, see which members have fully paid, which members still owe money, and how much remains to close the bill."
                  : "Review payment slips submitted by members, approve the exact member share when the slip is valid, or reject it so the member can upload a corrected slip."}
              </p>
            </div>

            <div className="f3cb-controls">
              {activeView === "community-bills" ? (
                <label className="f3cb-selectWrap">
                  <span>Status</span>
                  <select
                    value={distributionFilter}
                    onChange={(event) => handleBillFilterChange(event.target.value)}
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
                    onChange={(event) =>
                      handlePaymentSlipFilterChange(event.target.value)
                    }
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
            <CommunityBillsTable
              bills={bills}
              loading={loading}
              activeBillId={activeBillId}
              expandedBillId={expandedBillId}
              onDistribute={handleDistribute}
              onToggleExpanded={(billId) =>
                setExpandedBillId((currentValue) =>
                  currentValue === billId ? "" : billId,
                )
              }
            />
          ) : (
            <PaymentSlipsTable
              paymentSlips={paymentSlips}
              loading={loading}
              activeSlipId={activeSlipId}
              onViewDetails={openPaymentSlipDetails}
              onUpdateStatus={(paymentSlipId, status) => {
                if (status === "rejected") {
                  openRejectDialog(paymentSlipId);
                  return;
                }

                handlePaymentSlipStatusUpdate({ paymentSlipId, status });
              }}
            />
          )}
        </section>

        <PaymentSlipRejectionDialog
          isOpen={rejectDialogState.isOpen}
          rejectionReason={rejectDialogState.rejectionReason}
          submitting={Boolean(activeSlipId)}
          onReasonChange={setRejectReason}
          onCancel={closeRejectDialog}
          onSubmit={submitRejectDialog}
        />

        <AdminPaymentSlipDetailsDialog
          isOpen={isSlipDetailsOpen}
          paymentSlipData={selectedPaymentSlip}
          loading={detailsLoading}
          error={detailsError}
          onClose={closePaymentSlipDetails}
        />
      </div>
    </div>
  );
}
