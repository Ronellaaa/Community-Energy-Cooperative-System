import React from "react";

export default function MaintenanceExpenseForm({ value, onChange, onSubmit, submitLabel = "Save Maintenance Expense" }) {
  return (
    <form className="fp-form" onSubmit={onSubmit}>
      <div className="fp-form-grid">
        <div className="fp-form-field">
          <label>Amount</label>
          <input type="number" min="0" value={value.amount} onChange={(e) => onChange("amount", e.target.value)} required />
        </div>
        <div className="fp-form-field">
          <label>Category</label>
          <select value={value.category} onChange={(e) => onChange("category", e.target.value)}>
            {["REPAIR", "SERVICE", "REPLACEMENT", "OTHER"].map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="fp-form-field">
          <label>Date</label>
          <input type="date" value={value.date} onChange={(e) => onChange("date", e.target.value)} required />
        </div>
        <div className="fp-form-field fp-form-field--full">
          <label>Description</label>
          <textarea rows={4} value={value.description} onChange={(e) => onChange("description", e.target.value)} />
        </div>
      </div>
      <div className="fp-actions">
        <button type="submit" className="fp-button">{submitLabel}</button>
      </div>
    </form>
  );
}
