// src/components/projects/CreateProject.jsx
import { useState } from "react";
import { projectApi } from "../../api";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
import { useNavigate, useParams } from "react-router-dom";
import {
  focusInputStyle,
  TYPE_ICONS,
} from "../../components/feature-1/UI";
import FeedbackMessage from "../../components/feature-1/FeedbackMessage";

const odPageStyle = {
  minHeight: "100vh",
  background: `radial-gradient(circle at top left, rgba(191,255,116,0.18), transparent 26%),
               radial-gradient(circle at 85% 12%, rgba(42,122,113,0.18), transparent 24%),
               linear-gradient(180deg, #081713 0%, #102720 42%, #122017 100%)`,
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "13px 16px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#e8f5e9",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "rgba(213,229,220,0.6)",
  marginBottom: "8px",
};

const ENERGY_TYPES = ["Solar", "Wind", "Hydro"];

export default function CreateProject() {
  const navigate = useNavigate();
  const { communityId } = useParams();

  const [form, setForm] = useState({
    name: "",
    projectType: "Community",
    type: "Solar",
    capacityKW: "",
    cost: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Project name is required";
    if (!form.capacityKW || form.capacityKW <= 0) newErrors.capacityKW = "Valid capacity is required";
    if (!form.cost || form.cost <= 0) newErrors.cost = "Valid cost is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setFeedback({
        type: "warning",
        message: "⚠️ Please fill all required fields correctly",
      });
      return;
    }
    setLoading(true);
    setFeedback(null);
    
    try {
      const payload = {
        name: form.name,
        projectType: "Community",
        type: form.type,
        capacityKW: Number(form.capacityKW),
        cost: Number(form.cost),
        communityId: communityId,
      };
      console.log("Sending payload:", payload);
      await projectApi.create(payload);
      
      setFeedback({
        type: "success",
        message: "✅ Project created successfully! Redirecting...",
      });
      
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err) {
      console.error("Creation error:", err);
      setFeedback({
        type: "error",
        message: `❌ ${err.message || "Failed to create project"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const estimatedGeneration = form.capacityKW ? (form.capacityKW * 120).toLocaleString() : "—";
  const estimatedSavings = form.capacityKW ? formatLKR(Number(form.capacityKW) * 18) : "—";

  return (
    <div style={odPageStyle}>
      <style>{focusInputStyle}</style>
      <style>{`
        .cp-back:hover { color: #d5ff77 !important; }
        .eco-input:focus {
          border-color: rgba(213,255,119,0.5) !important;
          background: rgba(255,255,255,0.09) !important;
          box-shadow: 0 0 0 3px rgba(213,255,119,0.08);
        }
        .eco-input::placeholder { color: rgba(255,255,255,0.2); }
        .cp-submit:hover { opacity: 0.88; transform: translateY(-1px); }
        .cp-submit:active { transform: translateY(0); }
        .cp-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Hero banner */}
      <div style={{ padding: "26px 16px 10px" }}>
        <div style={{
          maxWidth: "720px", margin: "0 auto",
          borderRadius: "32px",
          background: "linear-gradient(135deg,rgba(14,37,31,0.97),rgba(19,56,44,0.92))",
          border: "1px solid rgba(191,255,116,0.14)",
          padding: "28px",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center",
            padding: "6px 14px", borderRadius: "999px",
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)",
            fontWeight: "900", letterSpacing: "1.6px", fontSize: "12px",
            color: "rgba(238,246,240,0.88)", marginBottom: "14px",
          }}>
            Project Management
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem,3vw,2.4rem)", fontWeight: "900", color: "#fff", lineHeight: 1.05, margin: "0 0 8px" }}>
            New Energy Project
          </h1>
          <p style={{ margin: 0, color: "rgba(231,243,237,0.75)", fontSize: "15px", lineHeight: 1.6 }}>
            Configure and submit a new renewable energy initiative for your community.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "16px 16px 48px" }}>

        {/* Back */}
        <button
          className="cp-back"
          onClick={() => navigate("/projects")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", color: "#a7e87a",
            fontSize: "14px", fontWeight: "800", cursor: "pointer",
            padding: 0, marginBottom: "20px", transition: "color 0.2s ease",
          }}
        >
          ← Back to Projects
        </button>

        {/* Feedback Message */}
        {feedback && (
          <FeedbackMessage
            {...feedback}
            onDismiss={() => setFeedback(null)}
          />
        )}

        {/* Form card */}
        <div style={{
          borderRadius: "20px", background: "rgba(8,27,21,0.74)",
          border: "1px solid rgba(191,255,116,0.1)", padding: "32px",
        }} className="fade-up fade-up-1">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

            {/* Project Name */}
            <div>
              <label style={labelStyle}>Project Name</label>
              <input
                className="eco-input"
                style={{
                  ...inputStyle,
                  ...(errors.name && { borderColor: "rgba(255,126,126,0.5)" })
                }}
                placeholder="e.g. North Valley Solar Farm"
                required
                value={form.name}
                onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: null }); }}
              />
              {errors.name && <span style={{ color: "#fca5a5", fontSize: "12px", marginTop: "5px", display: "block" }}>{errors.name}</span>}
            </div>

            {/* Energy Type */}
            <div>
              <label style={labelStyle}>Energy Source</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {ENERGY_TYPES.map((et) => (
                  <button
                    key={et}
                    type="button"
                    onClick={() => setForm({ ...form, type: et })}
                    style={{
                      flex: 1, padding: "14px 8px", borderRadius: "12px",
                      border: form.type === et ? "1px solid rgba(213,255,119,0.5)" : "1px solid rgba(255,255,255,0.1)",
                      background: form.type === et ? "rgba(213,255,119,0.12)" : "rgba(255,255,255,0.04)",
                      color: form.type === et ? "#c6f06a" : "rgba(213,229,220,0.6)",
                      fontWeight: "800", fontSize: "14px", cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "6px",
                    }}
                  >
                    <span style={{ fontSize: "20px" }}>{TYPE_ICONS[et]}</span>
                    <span>{et}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Capacity + Cost */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Capacity (kW)</label>
                <input
                  type="number"
                  className="eco-input"
                  style={{
                    ...inputStyle,
                    ...(errors.capacityKW && { borderColor: "rgba(255,126,126,0.5)" })
                  }}
                  placeholder="e.g. 500"
                  required
                  value={form.capacityKW}
                  onChange={(e) => { setForm({ ...form, capacityKW: e.target.value === "" ? "" : Number(e.target.value) }); if (errors.capacityKW) setErrors({ ...errors, capacityKW: null }); }}
                />
                {errors.capacityKW && <span style={{ color: "#fca5a5", fontSize: "12px", marginTop: "5px", display: "block" }}>{errors.capacityKW}</span>}
              </div>
              <div>
                <label style={labelStyle}>Total Cost (LKR)</label>
                <input
                  type="number"
                  className="eco-input"
                  style={{
                    ...inputStyle,
                    ...(errors.cost && { borderColor: "rgba(255,126,126,0.5)" })
                  }}
                  placeholder="e.g. 120000"
                  required
                  value={form.cost}
                  onChange={(e) => { setForm({ ...form, cost: e.target.value === "" ? "" : Number(e.target.value) }); if (errors.cost) setErrors({ ...errors, cost: null }); }}
                />
                {errors.cost && <span style={{ color: "#fca5a5", fontSize: "12px", marginTop: "5px", display: "block" }}>{errors.cost}</span>}
              </div>
            </div>

            {/* Live Estimates */}
            {form.capacityKW > 0 && (
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
                padding: "18px",
                background: "rgba(213,255,119,0.07)",
                border: "1px solid rgba(213,255,119,0.18)",
                borderRadius: "12px",
              }}>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(213,229,220,0.55)", fontWeight: "800", letterSpacing: "0.06em", marginBottom: "6px" }}>
                    EST. MONTHLY GENERATION
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: "#c6f06a" }}>
                    {estimatedGeneration} <span style={{ fontSize: "13px", fontWeight: "700", color: "rgba(213,229,220,0.5)" }}>kWh</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "11px", color: "rgba(213,229,220,0.55)", fontWeight: "800", letterSpacing: "0.06em", marginBottom: "6px" }}>
                    EST. MONTHLY SAVINGS
                  </div>
                  <div style={{ fontSize: "20px", fontWeight: "900", color: "#c6f06a" }}>{estimatedSavings}</div>
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

            {/* Submit */}
            <button
              type="submit"
              className="cp-submit"
              style={{
                width: "100%", padding: "15px",
                background: "linear-gradient(135deg, #d5ff77, #95e56d)",
                border: "none", borderRadius: "12px",
                color: "#102018", fontWeight: "900", fontSize: "16px",
                letterSpacing: "0.03em", cursor: "pointer",
                transition: "opacity 0.2s, transform 0.1s",
                opacity: loading ? 0.7 : 1,
                position: "relative",
              }}
              disabled={loading}
            >
              <span style={{ opacity: loading ? 0 : 1 }}>
                Create Project
              </span>
              {loading && (
                <span style={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex", alignItems: "center", gap: "8px",
                }}>
                  <span style={{
                    width: "16px", height: "16px", border: "2px solid rgba(0,0,0,0.2)",
                    borderTopColor: "#102018", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.8s linear infinite",
                  }} />
                  Creating...
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}