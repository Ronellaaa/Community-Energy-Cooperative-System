import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/feature-3/member-consumption.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const currencyFormatter = new Intl.NumberFormat("en-LK", {
  style: "currency",
  currency: "LKR",
  maximumFractionDigits: 2,
});

const formatBillingPeriod = (billingPeriod = {}) => {
  if (!billingPeriod.month || !billingPeriod.year) {
    return "-";
  }

  return new Date(
    billingPeriod.year,
    billingPeriod.month - 1,
    1,
  ).toLocaleString("en", {
    month: "long",
    year: "numeric",
  });
};

const getSlipActionLabel = (record) => {
  if (record.paymentStatus === "paid") {
    return "Paid";
  }

  if (record.latestPaymentSlip?.status === "pending") {
    return "Slip Submitted";
  }

  if (record.latestPaymentSlip?.status === "approved") {
    return "Paid";
  }

  if (record.latestPaymentSlip?.status === "rejected") {
    return "Upload Again";
  }

  return "Upload Payment Slip";
};

export default function MemberConsumptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [memberId, setMemberId] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [autoFillNotice, setAutoFillNotice] = useState("");
  const [uploadTarget, setUploadTarget] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadForm, setUploadForm] = useState({
    amountPaid: "",
    paymentDate: "",
    referenceNumber: "",
    payerName: "",
    notes: "",
    slipFile: null,
  });
  const hasAutoLoaded = useRef(false);

  const searchParams = new URLSearchParams(location.search);
  const isUploadMode = searchParams.get("mode") === "upload";
  const uploadConsumptionId = searchParams.get("consumptionId") || "";

  const totalAmountOwed = records.reduce(
    (sum, record) => sum + Number(record.amountOwed || 0),
    0,
  );

  const handleSearch = async (event) => {
    if (event) {
      event.preventDefault();
    }
    setError("");
    setSearched(true);

    if (!memberId.trim() || !communityId.trim()) {
      setError("Member ID and Community ID are required.");
      setRecords([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/readings/member/${encodeURIComponent(memberId.trim())}/community/${encodeURIComponent(communityId.trim())}`,
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || data.error || "Failed to fetch member consumption details",
        );
      }

      setRecords(data.data || []);
    } catch (requestError) {
      setError(
        requestError.message || "Failed to fetch member consumption details",
      );
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUploadTarget = async (consumptionId) => {
    setUploadLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/readings/${consumptionId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || data.error || "Failed to load payment record");
      }

      const record = data.data;
      setUploadTarget(record);
      setUploadForm({
        amountPaid: String(record.amountOwed || ""),
        paymentDate: new Date().toISOString().slice(0, 10),
        referenceNumber: "",
        payerName: JSON.parse(localStorage.getItem("user") || "{}").name || "",
        notes: "",
        slipFile: null,
      });
    } catch (requestError) {
      setError(requestError.message || "Failed to load payment record");
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      const nextMemberId = parsedUser.memberId || parsedUser.id || "";
      const nextCommunityId = parsedUser.communityId || "";

      if (nextMemberId) {
        setMemberId(String(nextMemberId));
      }

      if (nextCommunityId) {
        setCommunityId(String(nextCommunityId));
      }

      if (nextMemberId || nextCommunityId) {
        setAutoFillNotice(
          "We auto-filled your details from the current login session.",
        );
      }
    } catch (_) {
      setAutoFillNotice("");
    }
  }, []);

  useEffect(() => {
    if (hasAutoLoaded.current) {
      return;
    }

    if (!memberId.trim() || !communityId.trim() || isUploadMode) {
      return;
    }

    hasAutoLoaded.current = true;
    handleSearch();
  }, [memberId, communityId, isUploadMode]);

  useEffect(() => {
    if (!isUploadMode || !uploadConsumptionId) {
      setUploadTarget(null);
      setUploadMessage("");
      return;
    }

    loadUploadTarget(uploadConsumptionId);
  }, [isUploadMode, uploadConsumptionId]);

  const openUploadPage = (record) => {
    navigate(
      `/feature-3/member-consumption?mode=upload&consumptionId=${record._id}`,
    );
  };

  const returnToList = async () => {
    navigate("/feature-3/member-consumption");
  };

  const handleUploadFieldChange = (event) => {
    const { name, value } = event.target;
    setUploadForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUploadSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setUploadMessage("");

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    if (!storedUser.id) {
      setError("A logged-in user is required to upload a payment slip.");
      return;
    }

    if (!uploadTarget?._id) {
      setError("No payment record selected.");
      return;
    }

    if (!uploadForm.slipFile) {
      setError("Please choose a payment slip image or PDF.");
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append(
        "paymentSlipData",
        JSON.stringify({
          memberConsumptionId: uploadTarget._id,
          userId: storedUser.id,
          amountPaid: Number(uploadForm.amountPaid),
          paymentDate: uploadForm.paymentDate,
          referenceNumber: uploadForm.referenceNumber,
          payerName: uploadForm.payerName,
          notes: uploadForm.notes,
        }),
      );
      formData.append("slipImage", uploadForm.slipFile);

      const response = await fetch(`${API_BASE_URL}/api/bills/payment-slips`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to upload payment slip");
      }

      setUploadMessage("Payment slip uploaded successfully and sent for admin review.");
      setTimeout(() => {
        navigate("/feature-3/member-consumption");
      }, 1000);
    } catch (requestError) {
      setError(requestError.message || "Failed to upload payment slip");
    } finally {
      setUploadLoading(false);
    }
  };

  if (isUploadMode) {
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

              <button
                type="button"
                className="f3mc-backBtn"
                onClick={returnToList}
              >
                Back to Consumption List
              </button>
            </div>

            {error ? <div className="f3mc-message f3mc-error">{error}</div> : null}
            {uploadMessage ? (
              <div className="f3mc-message f3mc-info">{uploadMessage}</div>
            ) : null}

            {uploadLoading && !uploadTarget ? (
              <div className="f3mc-message f3mc-info">Loading payment record...</div>
            ) : null}

            {uploadTarget ? (
              <form className="f3mc-uploadForm" onSubmit={handleUploadSubmit}>
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
                    <strong>
                      {currencyFormatter.format(Number(uploadTarget.amountOwed || 0))}
                    </strong>
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
                      onChange={handleUploadFieldChange}
                      required
                    />
                  </label>

                  <label className="f3mc-field">
                    <span>Payment Date</span>
                    <input
                      type="date"
                      name="paymentDate"
                      value={uploadForm.paymentDate}
                      onChange={handleUploadFieldChange}
                      required
                    />
                  </label>

                  <label className="f3mc-field">
                    <span>Reference Number</span>
                    <input
                      type="text"
                      name="referenceNumber"
                      value={uploadForm.referenceNumber}
                      onChange={handleUploadFieldChange}
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
                      onChange={handleUploadFieldChange}
                      required
                    />
                  </label>

                  <label className="f3mc-field f3mc-fieldWide">
                    <span>Notes</span>
                    <textarea
                      name="notes"
                      value={uploadForm.notes}
                      onChange={handleUploadFieldChange}
                      placeholder="Optional notes for the admin reviewer"
                      rows="4"
                    />
                  </label>

                  <label className="f3mc-field f3mc-fieldWide">
                    <span>Payment Slip Image / PDF</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.pdf"
                      onChange={(event) =>
                        setUploadForm((current) => ({
                          ...current,
                          slipFile: event.target.files?.[0] || null,
                        }))
                      }
                      required
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="f3mc-searchBtn"
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Submit Payment Slip"}
                </button>
              </form>
            ) : null}
          </section>
        </div>
      </div>
    );
  }

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
            <span className="f3mc-statValue">
              {currencyFormatter.format(totalAmountOwed)}
            </span>
            <span className="f3mc-statHint">
              Based on all loaded billing periods for this member and community.
            </span>
          </div>
        </section>

        <section className="f3mc-panel">
          <form className="f3mc-form" onSubmit={handleSearch}>
            <label className="f3mc-field">
              <span>Member ID</span>
              <input
                type="text"
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
                placeholder="same as approved user ID"
              />
            </label>

            <label className="f3mc-field">
              <span>Community ID</span>
              <input
                type="text"
                value={communityId}
                onChange={(event) => setCommunityId(event.target.value)}
                placeholder="community MongoDB id"
              />
            </label>

            <button type="submit" className="f3mc-searchBtn" disabled={loading}>
              {loading ? "Loading..." : "View My Bill Details"}
            </button>
          </form>

          {autoFillNotice ? (
            <div className="f3mc-message f3mc-info">{autoFillNotice}</div>
          ) : null}
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
                      <td>{currencyFormatter.format(Number(record.amountOwed || 0))}</td>
                      <td>
                        <span className={`f3mc-pill f3mc-pill-${record.paymentStatus || "pending"}`}>
                          {record.paymentStatus || "pending"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`f3mc-pill f3mc-pill-${record.latestPaymentSlip?.status || "draft"}`}
                        >
                          {record.latestPaymentSlip?.status || "not submitted"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="f3mc-rowBtn"
                          onClick={() => openUploadPage(record)}
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
