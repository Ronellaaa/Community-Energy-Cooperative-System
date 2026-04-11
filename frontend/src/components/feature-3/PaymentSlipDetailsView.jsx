import React, { useEffect, useState } from "react";
import { getPaymentSlip } from "../../services/feature-3/memberConsumptionApi";
import PaymentSlipDetailsPanel from "./PaymentSlipDetailsPanel";

export default function PaymentSlipDetailsView({
  paymentSlip,
  onBack,
}) {
  const [paymentSlipData, setPaymentSlipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPaymentSlipData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getPaymentSlip(paymentSlip._id);
        setPaymentSlipData(data.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to load payment slip details";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (paymentSlip?._id) {
      fetchPaymentSlipData();
    }
  }, [paymentSlip?._id]);

  return (
    <div className="f3mc-page">
      <div className="f3mc-aura f3mc-aura-a" />
      <div className="f3mc-aura f3mc-aura-b" />

      <div className="f3mc-shell">
        <div className="f3mc-panel">
          {loading && !paymentSlipData ? (
            <div className="f3mc-message f3mc-info">Loading payment slip details...</div>
          ) : null}
          {error ? <div className="f3mc-message f3mc-error">{error}</div> : null}

          {paymentSlipData ? (
            <PaymentSlipDetailsPanel
              paymentSlipData={paymentSlipData}
              viewerLabel="Member View"
              title="Payment Slip Details"
              subtitle="Review your submitted payment slip details and status."
              backLabel="Back to Consumption List"
              onBack={onBack}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
