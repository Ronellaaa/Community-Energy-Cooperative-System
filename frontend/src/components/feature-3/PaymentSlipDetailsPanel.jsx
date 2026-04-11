import React from "react";
import {
  formatBillingPeriod,
  formatCurrency,
  formatDateTime,
} from "../../utils/feature-3/formatters";
import "../../styles/feature-3/payment-slip-details.css";

const isPdfFile = (url = "") => url.toLowerCase().includes(".pdf");

export default function PaymentSlipDetailsPanel({
  paymentSlipData,
  viewerLabel,
  title,
  subtitle,
  backLabel,
  onBack,
}) {
  const isPdf = isPdfFile(paymentSlipData?.slipImage?.url);

  return (
    <section className="f3psd-panel">
      <div className="f3psd-header">
        <div>
          <span className="f3psd-kicker">{viewerLabel}</span>
          <h1 className="f3psd-title">{title}</h1>
          <p className="f3psd-subtitle">{subtitle}</p>
        </div>

        {onBack ? (
          <button type="button" className="f3psd-backBtn" onClick={onBack}>
            {backLabel}
          </button>
        ) : null}
      </div>

      <div className="f3psd-layout">
        <div className="f3psd-hero">
          <div className="f3psd-heroTop">
            <div>
              <span className="f3psd-eyebrow">Submitted Payment</span>
              <h2 className="f3psd-amount">{formatCurrency(paymentSlipData.amountPaid)}</h2>
              <p className="f3psd-meta">
                For {formatBillingPeriod(paymentSlipData.billingPeriod)}
              </p>
            </div>
            <span className={`f3psd-pill f3psd-pill-${paymentSlipData.status}`}>
              {paymentSlipData.status}
            </span>
          </div>

          <div className="f3psd-keyFacts">
            <div className="f3psd-fact">
              <span>Payment Date</span>
              <strong>{formatDateTime(paymentSlipData.paymentDate)}</strong>
            </div>
            <div className="f3psd-fact">
              <span>Reference Number</span>
              <strong>{paymentSlipData.referenceNumber || "-"}</strong>
            </div>
            <div className="f3psd-fact">
              <span>Payer Name</span>
              <strong>{paymentSlipData.payerName}</strong>
            </div>
          </div>
        </div>

        <div className="f3psd-cardGrid">
          <div className="f3psd-card">
            <div className="f3psd-item">
              <span>Billing Period</span>
              <strong>{formatBillingPeriod(paymentSlipData.billingPeriod)}</strong>
            </div>
            <div className="f3psd-item">
              <span>Amount Paid</span>
              <strong>{formatCurrency(paymentSlipData.amountPaid)}</strong>
            </div>
            <div className="f3psd-item">
              <span>Payment Date</span>
              <strong>{formatDateTime(paymentSlipData.paymentDate)}</strong>
            </div>
            <div className="f3psd-item">
              <span>Payer Name</span>
              <strong>{paymentSlipData.payerName}</strong>
            </div>
            <div className="f3psd-item">
              <span>Reference Number</span>
              <strong>{paymentSlipData.referenceNumber || "-"}</strong>
            </div>
            <div className="f3psd-item">
              <span>Status</span>
              <span className={`f3psd-pill f3psd-pill-${paymentSlipData.status}`}>
                {paymentSlipData.status}
              </span>
            </div>
            <div className="f3psd-item">
              <span>Member ID</span>
              <strong>{paymentSlipData.memberId || "-"}</strong>
            </div>
            <div className="f3psd-item">
              <span>Community ID</span>
              <strong>{paymentSlipData.communityId || "-"}</strong>
            </div>
            <div className="f3psd-item f3psd-itemWide">
              <span>Notes</span>
              <strong>{paymentSlipData.notes || "No extra notes were added for this payment slip."}</strong>
            </div>
          </div>

          {(paymentSlipData.reviewedAt || paymentSlipData.rejectionReason) ? (
            <div className="f3psd-card">
              <div className="f3psd-item">
                <span>Reviewed By</span>
                <strong>{paymentSlipData.reviewedBy || "-"}</strong>
              </div>
              <div className="f3psd-item">
                <span>Reviewed At</span>
                <strong>{paymentSlipData.reviewedAt ? formatDateTime(paymentSlipData.reviewedAt) : "-"}</strong>
              </div>
              <div className="f3psd-item f3psd-itemWide">
                <span>Rejection Reason</span>
                <strong>{paymentSlipData.rejectionReason || "No rejection reason recorded."}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {paymentSlipData?.slipImage ? (
        <div className="f3psd-previewCard">
          <div className="f3psd-previewHeader">
            <div>
              <span className="f3psd-previewEyebrow">Slip Preview</span>
              <h2 className="f3psd-previewTitle">Uploaded Receipt</h2>
            </div>
            <a
              href={paymentSlipData.slipImage.url}
              target="_blank"
              rel="noopener noreferrer"
              className="f3psd-linkBtn"
            >
              Open Original File
            </a>
          </div>

          {isPdf ? (
            <div className="f3psd-documentCard">
              <span className="f3psd-documentIcon">PDF</span>
              <p className="f3psd-documentText">
                This payment slip was uploaded as a PDF document. Use the button above to open the full file.
              </p>
            </div>
          ) : (
            <div className="f3psd-previewFrame">
              <img
                src={paymentSlipData.slipImage.url}
                alt="Payment slip"
                className="f3psd-image"
              />
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
