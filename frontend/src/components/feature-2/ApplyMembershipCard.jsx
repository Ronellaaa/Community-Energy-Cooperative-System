import React, { useState } from "react";

export default function ApplyMembershipCard({ onApplied }) {
  const [form, setForm] = useState({
    community: "Moratuwa 10 Houses",
    meterNumber: "",
    billRange: "5000-10000",
    householdType: "Residential",
    isLowIncome: false,
  });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (e) => {
    e.preventDefault();

    // ✅ For now just simulate "applied"
    // Later you will call backend: POST /api/memberships/apply
    onApplied?.("pending");
  };

  return (
    <div className="f2-glass" style={{ padding: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 14 }}>Apply for Membership</div>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6 }}>
        Complete your application to become eligible for cooperative benefits.
      </div>

      <form onSubmit={submit} style={{ marginTop: 14, display: "grid", gap: 10 }}>
        <label style={{ fontSize: 12, opacity: 0.8 }}>
          Community
          <select
            name="community"
            value={form.community}
            onChange={onChange}
            className="f2-input"
          >
            <option>Moratuwa 10 Houses</option>
            <option>Negombo 20 Houses</option>
            <option>School Rooftop Project</option>
          </select>
        </label>

        <label style={{ fontSize: 12, opacity: 0.8 }}>
          Meter Number
          <input
            name="meterNumber"
            value={form.meterNumber}
            onChange={onChange}
            placeholder="Enter meter number"
            className="f2-input"
            required
          />
        </label>

        <label style={{ fontSize: 12, opacity: 0.8 }}>
          Monthly Bill Range
          <select
            name="billRange"
            value={form.billRange}
            onChange={onChange}
            className="f2-input"
          >
            <option value="<2000">&lt; 2,000</option>
            <option value="2000-5000">2,000 – 5,000</option>
            <option value="5000-10000">5,000 – 10,000</option>
            <option value=">10000">&gt; 10,000</option>
          </select>
        </label>

        <label style={{ fontSize: 12, opacity: 0.8 }}>
          Household Type
          <select
            name="householdType"
            value={form.householdType}
            onChange={onChange}
            className="f2-input"
          >
            <option>Residential</option>
            <option>Small shop</option>
            <option>School</option>
            <option>Temple</option>
          </select>
        </label>

        <label style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12 }}>
          <input
            type="checkbox"
            name="isLowIncome"
            checked={form.isLowIncome}
            onChange={onChange}
          />
          Low-income household (extra relief priority)
        </label>

        <button className="f2-applyBtn" type="submit">
          Submit Application
        </button>

        <div style={{ fontSize: 11, opacity: 0.6 }}>
          After submission, your application will appear as <b>Pending Approval</b>.
        </div>
      </form>
    </div>
  );
}