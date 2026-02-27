import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, PageHeader, Card, FormField, Input, Select, ErrorMsg } from "../../components/feature-1/UI";

const API = "/api/projects";
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Formula matches backend: capacityKW * 120 * 25
const calcGeneration = (kw) => parseFloat(kw) * 120 || 0;
const calcSavings    = (kw) => calcGeneration(kw) * 25;

const formatLKR = (amount) => {
  const n = parseFloat(amount) || 0;
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `LKR ${(n / 1_000).toFixed(0)}k`;
  return `LKR ${n}`;
};

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [form, setForm]               = useState({ name: "", type: "Solar", capacityKW: "", cost: "" });
  const [errors, setErrors]           = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading]         = useState(false);

  const kw           = parseFloat(form.capacityKW) || 0;
  const cost         = parseFloat(form.cost) || 0;
  const generation   = calcGeneration(kw);
  const savings      = calcSavings(kw);
  const hasCapacity  = kw > 0;

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name       = "Project name is required";
    if (kw <= 0)            e.capacityKW = "Capacity must be > 0";
    if (cost <= 0)          e.cost       = "Cost must be > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setSubmitError("");
      const res = await fetch(API, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name:       form.name.trim(),
          type:       form.type,
          capacityKW: kw,
          cost:       cost,
          // backend auto-calculates expectedMonthlyGeneration & expectedMonthlySavings
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      const created = await res.json();
      navigate(`/projects/${created._id}`, { state: { justCreated: true } });
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "32px 36px", maxWidth: 820, margin: "0 auto" }}>
      <PageHeader
        breadcrumb="NEW PROJECT"
        title={<>Create <span style={{ color: "var(--accent)" }}>Project</span></>}
        subtitle="Define the energy project. Backend auto-calculates expected output."
        action={<Btn variant="ghost" onClick={() => navigate("/projects")}>← Back</Btn>}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* Form */}
        <Card>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)", display: "inline-block", boxShadow: "0 0 8px var(--accent)" }} />
            Project Details
          </div>
          <p style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 22 }}>
            Status starts as <span style={{ color: "#4f8ef7", fontFamily: "var(--font-mono)" }}>Draft</span> → Approve → Activate
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <FormField label="Project Name *" error={errors.name}>
              <Input placeholder="e.g. Moratuwa 10 Houses" value={form.name} onChange={handleChange("name")} />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <FormField label="Project Type *">
                <Select value={form.type} onChange={handleChange("type")}>
                  <option value="Solar">☀️ Solar</option>
                  <option value="Wind">🌬️ Wind</option>
                  <option value="Hydro">💧 Hydro</option>
                </Select>
              </FormField>
              <FormField label="Capacity (kW) *" error={errors.capacityKW}>
                <Input type="number" min="0" step="0.5" placeholder="e.g. 15" value={form.capacityKW} onChange={handleChange("capacityKW")} />
              </FormField>
            </div>

            <FormField label="Total Cost (LKR) *" error={errors.cost}>
              <Input type="number" min="0" placeholder="e.g. 1000000" value={form.cost} onChange={handleChange("cost")} />
              {cost > 0 && <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>= {formatLKR(cost)}</span>}
            </FormField>

            <div style={{ background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 8, padding: "12px 14px", fontSize: 12.5, color: "#7aa8f7", lineHeight: 1.6 }}>
              ℹ️ After creating, assign members (team's member module), then <strong>Approve</strong> → <strong>Activate</strong>.
            </div>

            {submitError && <ErrorMsg message={submitError} />}

            <div style={{ display: "flex", gap: 12 }}>
              <Btn onClick={handleSubmit} disabled={loading}>
                {loading ? "⏳ Creating..." : "✔ Create Project"}
              </Btn>
              <Btn variant="ghost" onClick={() => setForm({ name: "", type: "Solar", capacityKW: "", cost: "" })}>Reset</Btn>
            </div>
          </div>
        </Card>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Live calculation */}
          <Card style={{ background: "var(--surface)" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>⚡ Live Calculation</div>
            <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
              Formula (matches backend):<br />
              generation = kW × 120<br />
              savings = generation × 25 LKR
            </div>
            {[
              { label: "Monthly Generation", value: hasCapacity ? `${generation.toLocaleString()} kWh` : "—", color: "var(--accent3)" },
              { label: "Monthly Savings",    value: hasCapacity ? formatLKR(savings) : "—",                   color: "var(--accent)", big: true },
              { label: "Yearly Savings",     value: hasCapacity ? formatLKR(savings * 12) : "—",              color: "var(--accent2)" },
              ...(hasCapacity && cost > 0 ? [{ label: "Payback Period", value: `~${(cost / savings / 12).toFixed(1)} yrs`, color: "var(--muted)" }] : []),
            ].map((r, i) => (
              <div key={i}>
                {i > 0 && <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.label}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: r.big ? 18 : 14, fontWeight: 700, color: hasCapacity ? r.color : "var(--border)", transition: "color 0.3s" }}>
                    {r.value}
                  </span>
                </div>
              </div>
            ))}
          </Card>

          {/* Status flow */}
          <Card style={{ background: "var(--surface)" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Status Flow</div>
            {[
              { label: "Draft",    desc: "Just created",           active: true },
              { label: "Approved", desc: "Cost + min 2 members",   active: false },
              { label: "Active",   desc: "Funding ≥ project cost", active: false },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 2 ? 12 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: s.active ? "rgba(0,229,160,0.15)" : "var(--card)", border: `1.5px solid ${s.active ? "var(--accent)" : "var(--border)"}`, color: s.active ? "var(--accent)" : "var(--muted)" }}>
                    {i + 1}
                  </div>
                  {i < 2 && <div style={{ width: 1, height: 12, background: "var(--border)", margin: "2px 0", opacity: 0.5 }} />}
                </div>
                <div style={{ paddingTop: 3 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: s.active ? "var(--accent)" : "var(--muted)", fontFamily: "var(--font-display)" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
