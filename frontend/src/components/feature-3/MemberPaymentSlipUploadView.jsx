import React from "react";
import {
  formatBillingPeriod,
  formatCurrency,
} from "../../utils/feature-3/formatters";

export default function MemberPaymentSlipUploadView({
  uploadTarget,
  uploadLoading,
  uploadMessage,
  uploadForm,
  error,
  onBack,
  onFieldChange,
  onFileChange,
  onSubmit,
}) {
  return (
    <div className="f3mc-page">
      <div className="f3mc-aura f3mc-aura-a" />
      <div className="f3mc-aura f3mc-aura-b" />

      <div className="f3mc-shell">
        <section className="f3mc-panel">
          <div className="f3mc-formHeader">
            <div>
              <span className="f3mc-kicker">Feature 3 Member View</span>
              <h1 className="f3mc-title f3mc-uploadTitle">Upload Payment Slip</h1>
              <p className="f3mc-subtitle">
                Submit your proof of payment for admin review. Once approved, this record will move from pending to paid.
              </p>
            </div>

            <button type="button" className="f3mc-backBtn" onClick={onBack}>
              Back to Consumption List
            </button>
          </div>

          {error ? <div className="f3mc-message f3mc-error">{error}</div> : null}
          {uploadMessage ? <div className="f3mc-message f3mc-info">{uploadMessage}</div> : null}

          {uploadLoading && !uploadTarget ? (
            <div className="f3mc-message f3mc-info">Loading payment record...</div>
          ) : null}

          {uploadTarget ? (
            <form
              className="f3mc-uploadForm"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
              }}
            >
              <div className="f3mc-summaryCard">
                <div className="f3mc-summaryItem">
                  <span>Billing Period</span>
                  <strong>{formatBillingPeriod(uploadTarget.billingPeriod)}</strong>
                </div>
                <div className="f3mc-summaryItem">
                  <span>Units Consumed</span>
                  <strong>{uploadTarget.unitsConsumed ?? "-"}</strong>
                </div>
                <div className="f3mc-summaryItem">
                  <span>Amount Owed</span>
                  <strong>{formatCurrency(uploadTarget.amountOwed)}</strong>
                </div>
                <div className="f3mc-summaryItem">
                  <span>Current Payment Status</span>
                  <strong>{uploadTarget.paymentStatus || "pending"}</strong>
                </div>
              </div>

              <div className="f3mc-uploadGrid">
                <label className="f3mc-field">
                  <span>Amount Paid</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="amountPaid"
                    value={uploadForm.amountPaid}
                    onChange={(event) =>
                      onFieldChange({
                        name: event.target.name,
                        value: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label className="f3mc-field">
                  <span>Payment Date</span>
                  <input
                    type="date"
                    name="paymentDate"
                    value={uploadForm.paymentDate}
                    onChange={(event) =>
                      onFieldChange({
                        name: event.target.name,
                        value: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label className="f3mc-field">
                  <span>Reference Number</span>
                  <input
                    type="text"
                    name="referenceNumber"
                    value={uploadForm.referenceNumber}
                    onChange={(event) =>
                      onFieldChange({
                        name: event.target.name,
                        value: event.target.value,
                      })
                    }
                    placeholder="Bank transfer or receipt reference"
                    required
                  />
                </label>

                <label className="f3mc-field">
                  <span>Payer Name</span>
                  <input
                    type="text"
                    name="payerName"
                    value={uploadForm.payerName}
                    onChange={(event) =>
                      onFieldChange({
                        name: event.target.name,
                        value: event.target.value,
                      })
                    }
                    required
                  />
                </label>

                <label className="f3mc-field f3mc-fieldWide">
                  <span>Notes</span>
                  <textarea
                    name="notes"
                    value={uploadForm.notes}
                    onChange={(event) =>
                      onFieldChange({
                        name: event.target.name,
                        value: event.target.value,
                      })
                    }
                    placeholder="Optional notes for the admin reviewer"
                    rows="4"
                  />
                </label>

                <label className="f3mc-field f3mc-fieldWide">
                  <span>Payment Slip Image / PDF</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.pdf"
                    onChange={(event) => onFileChange(event.target.files?.[0] || null)}
                    required
                  />
                </label>
              </div>

              <button type="submit" className="f3mc-searchBtn" disabled={uploadLoading}>
                {uploadLoading ? "Uploading..." : "Submit Payment Slip"}
              </button>
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}
