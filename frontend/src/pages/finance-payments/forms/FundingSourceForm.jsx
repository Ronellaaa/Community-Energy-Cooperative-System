import React from "react";

export default function FundingSourceForm({ value, onChange, onSubmit, submitLabel = "Save Funding Source" }) {
  return (
    <form className="fp-form fp-form--source" onSubmit={onSubmit}>
      <div className="fp-form-grid fp-form-grid--source">
        <div className="fp-form-field">
          <label>Fund Name</label>
          <input value={value.fundName} onChange={(e) => onChange("fundName", e.target.value)} required />
        </div>
        <div className="fp-form-field">
          <label>Fund Type</label>
          <select value={value.fundType} onChange={(e) => onChange("fundType", e.target.value)}>
            {["GRANT", "LOAN", "COMMUNITY FUND", "DONATION", "OTHER"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="fp-form-field">
          <label>Contact Phone</label>
          <input value={value.contactPhone} onChange={(e) => onChange("contactPhone", e.target.value)} />
        </div>
        <div className="fp-form-field">
          <label>Active Status</label>
          <select value={value.isActive ? "true" : "false"} onChange={(e) => onChange("isActive", e.target.value === "true")}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="fp-form-field fp-form-field--full">
          <label>Description</label>
          <textarea rows={3} value={value.description} onChange={(e) => onChange("description", e.target.value)} />
        </div>
      </div>
      <div className="fp-actions fp-actions--source">
        <button type="submit" className="fp-button">{submitLabel}</button>
      </div>
    </form>
  );
}
