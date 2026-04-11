import React from "react";

export default function PaymentSlipRejectionDialog({
  isOpen,
  rejectionReason,
  submitting,
  onReasonChange,
  onCancel,
  onSubmit,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="f3cb-modalOverlay" role="presentation">
      <div
        className="f3cb-modalCard"
        role="dialog"
        aria-modal="true"
        aria-labelledby="f3cb-reject-title"
      >
        <div className="f3cb-modalHeader">
          <div>
            <span className="f3cb-kicker">Payment Slip Review</span>
            <h2 id="f3cb-reject-title" className="f3cb-modalTitle">
              Reject Payment Slip
            </h2>
            <p className="f3cb-modalText">
              Add a clear reason so the member knows what needs to be corrected before uploading again.
            </p>
          </div>
        </div>

        <label className="f3cb-modalField">
          <span>Rejection Reason</span>
          <textarea
            value={rejectionReason}
            onChange={(event) => onReasonChange(event.target.value)}
            placeholder="Example: The slip image is blurry and the reference number is not readable."
            rows="5"
            maxLength="300"
            autoFocus
          />
        </label>

        <div className="f3cb-modalFooter">
          <button
            type="button"
            className="f3cb-actionBtn f3cb-actionBtnSecondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="f3cb-actionBtn f3cb-actionBtnReject"
            onClick={onSubmit}
            disabled={submitting || !rejectionReason.trim()}
          >
            {submitting ? "Rejecting..." : "Reject Payment Slip"}
          </button>
        </div>
      </div>
    </div>
  );
}
