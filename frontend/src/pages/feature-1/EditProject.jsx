import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Btn, PageHeader, Card, FormField, Input, Select, ErrorMsg, LoadingSpinner } from "../../components/feature-1/UI";

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

export default function EditProjectPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [form, setForm]               = useState({ name: "", type: "Solar", capacityKW: "", cost: "" });
  const [originalStatus, setOriginalStatus] = useState("");
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState("");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors]           = useState({});

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`${API}/${id}`, { headers: getHeaders() });
        if (!res.ok) throw new Error("Failed to fetch project");
        const p = await res.json();
        setForm({ name: p.name || "", type: p.type || "Solar", capacityKW: p.capacityKW || "", cost: p.cost || "" });
        setOriginalStatus(p.status);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const kw          = parseFloat(form.capacityKW) || 0;
  const cost        = parseFloat(form.cost) || 0;
  const generation  = calcGeneration(kw);
  const savings     = calcSavings(kw);
  const hasCapacity = kw > 0;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name       = "Name is required";
    if (kw <= 0)           e.capacityKW = "Capacity must be > 0";
    if (cost <= 0)         e.cost       = "Cost must be > 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      setSubmitError("");
      const res = await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name:       form.name.trim(),
          type:       form.type,
          capacityKW: kw,
          cost:       cost,
          // backend recalculates expectedMonthlyGeneration & expectedMonthlySavings if capacityKW changes
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      navigate(`/projects/${id}`);
    } catch (e) {
      setSubmitError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40 }}><LoadingSpinner text="Loading project..." /></div>;
  if (error)   return <div style={{ padding: 40 }}><ErrorMsg message={error} /></div>;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 820, margin: "0 auto" }}>
      <PageHeader
        breadcrumb="EDIT PROJECT"
        title={<>Edit <span style={{ color: "var(--accent)" }}>Project</span></>}
        subtitle={`Modifying: ${form.name} · Status: ${originalStatus}`}
        action={<Btn variant="ghost" onClick={() => navigate(`/projects/${id}`)}>← Cancel</Btn>}
      />

      {originalStatus === "Active" && (
        <div style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "var(--accent2)" }}>
          ⚠️ This project is <strong>Active</strong>. Editing capacity will recalculate metrics on the backend.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        <Card>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Update Project Details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            <FormField label="Project Name *" error={errors.name}>
              <Input placeholder="Project name" value={form.name} onChange={handleChange("name")} />
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

            {submitError && <ErrorMsg message={submitError} />}

            <div style={{ display: "flex", gap: 12 }}>
              <Btn onClick={handleSave} disabled={saving}>
                {saving ? "⏳ Saving..." : "💾 Save Changes"}
              </Btn>
              <Btn variant="ghost" onClick={() => navigate(`/projects/${id}`)}>Cancel</Btn>
            </div>
          </div>
        </Card>

        {/* Updated calc preview */}
        <Card style={{ background: "var(--surface)" }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Updated Calculations</div>
          <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "var(--font-mono)", marginBottom: 14, lineHeight: 1.5 }}>
            Backend recalculates automatically<br />when capacityKW changes
          </div>
          {[
            { label: "Monthly Generation", value: hasCapacity ? `${generation.toLocaleString()} kWh` : "—", color: "var(--accent3)" },
            { label: "Monthly Savings",    value: hasCapacity ? formatLKR(savings) : "—",                   color: "var(--accent)" },
            { label: "Yearly Savings",     value: hasCapacity ? formatLKR(savings * 12) : "—",              color: "var(--accent2)" },
          ].map((r, i) => (
            <div key={i}>
              {i > 0 && <div style={{ height: 1, background: "var(--border)", margin: "10px 0" }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{r.label}</span>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: hasCapacity ? r.color : "var(--border)", transition: "color 0.3s" }}>
                  {r.value}
                </span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
