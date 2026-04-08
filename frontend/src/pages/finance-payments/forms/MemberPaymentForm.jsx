import React from "react";

export default function MemberPaymentForm({
  role,
  value,
  onChange,
  onSubmit,
  members,
  currentUserName,
  submitLabel = "Save Member Payment",
}) {
  const canChooseMember = role === "ADMIN" || role === "OFFICER";

  return (
    <form className="fp-form" onSubmit={onSubmit}>
      <div className="fp-form-grid">
        {canChooseMember ? (
          <div className="fp-form-field">
            <label>Member</label>
            <select value={value.memberId} onChange={(e) => onChange("memberId", e.target.value)}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="fp-form-field">
            <label>Member</label>
            <input value={currentUserName} disabled />
          </div>
        )}
        <div className="fp-form-field">
          <label>Payment Type</label>
          <select value={value.paymentType} onChange={(e) => onChange("paymentType", e.target.value)}>
            {["JOINING", "MONTHLY_MAINTENANCE", "OTHER"].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="fp-form-field">
          <label>Payment Method</label>
          <select value={value.method} onChange={(e) => onChange("method", e.target.value)}>
            {["CASH", "BANK", "TRANSFER"].map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
        <div className="fp-form-field">
          <label>Amount</label>
          <input type="number" min="0" value={value.amount} onChange={(e) => onChange("amount", e.target.value)} required />
        </div>
        <div className="fp-form-field">
          <label>Month</label>
          <input type="month" value={value.month} onChange={(e) => onChange("month", e.target.value)} />
        </div>
        <div className="fp-form-field">
          <label>Date</label>
          <input type="date" value={value.date} onChange={(e) => onChange("date", e.target.value)} required />
        </div>
        <div className="fp-form-field fp-form-field--full">
          <label>Note</label>
          <textarea rows={4} value={value.note} onChange={(e) => onChange("note", e.target.value)} />
        </div>
      </div>
      <div className="fp-actions">
        <button type="submit" className="fp-button">{submitLabel}</button>
      </div>
    </form>
  );
}
