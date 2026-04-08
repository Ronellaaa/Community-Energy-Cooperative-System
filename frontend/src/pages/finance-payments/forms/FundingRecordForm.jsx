import React from "react";

export default function FundingRecordForm({
  value,
  onChange,
  onSubmit,
  sources,
  submitLabel = "Save Funding Record",
}) {
  return (
    <form className="fp-form fp-form--record" onSubmit={onSubmit}>
      <div className="fp-form-grid fp-form-grid--record">
        <div className="fp-form-field">
          <label>Funding Source</label>
          <select value={value.sourceId} onChange={(e) => onChange("sourceId", e.target.value)}>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>{source.fundName}</option>
            ))}
          </select>
        </div>
        <div className="fp-form-field">
          <label>Amount</label>
          <input type="number" min="0" value={value.amount} onChange={(e) => onChange("amount", e.target.value)} required />
        </div>
        <div className="fp-form-field">
          <label>Status</label>
          <select value={value.status} onChange={(e) => onChange("status", e.target.value)}>
            {["PENDING", "RECEIVED", "REJECTED"].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div className="fp-form-field">
          <label>Date</label>
          <input type="date" value={value.date} onChange={(e) => onChange("date", e.target.value)} required />
        </div>
        <div className="fp-form-field fp-form-field--full">
          <label>Note</label>
          <textarea rows={3} value={value.note} onChange={(e) => onChange("note", e.target.value)} />
        </div>
      </div>
      <div className="fp-actions fp-actions--record">
        <button type="submit" className="fp-button">{submitLabel}</button>
      </div>
    </form>
  );
}
