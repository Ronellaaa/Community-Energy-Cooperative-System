import React from "react";
import PaymentSlipDetailsPanel from "./PaymentSlipDetailsPanel";

export default function AdminPaymentSlipDetailsDialog({
  isOpen,
  paymentSlipData,
  loading,
  error,
  onClose,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="f3cb-modalOverlay" role="presentation">
      <div className="f3cb-modalCard f3cb-modalCardWide" role="dialog" aria-modal="true">
        {loading && !paymentSlipData ? (
          <div className="f3cb-inlineMessage">Loading payment slip details...</div>
        ) : null}
        {error ? <div className="f3cb-message f3cb-error">{error}</div> : null}

        {paymentSlipData ? (
          <PaymentSlipDetailsPanel
            paymentSlipData={paymentSlipData}
            viewerLabel="Admin Review"
            title="Payment Slip Details"
            subtitle="Review the member-submitted payment fields, current status, and uploaded receipt in one place."
            backLabel="Close Details"
            onBack={onClose}
          />
        ) : null}
      </div>
    </div>
  );
}
