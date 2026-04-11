// src/components/projects/EditProject.jsx
import { useEffect, useState } from "react";
import { projectApi } from "../../api";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
import { useParams, useNavigate } from "react-router-dom";
import { focusInputStyle } from "../../components/feature-1/UI";
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

function FundingProgressBar({ raised, target }) {
  const percentage = target > 0 ? Math.min(Math.max((raised / target) * 100, 0), 100) : 0;
  return (
    <div style={{ marginTop: "4px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: "rgba(213,229,220,0.55)", fontWeight: "800", letterSpacing: "0.06em" }}>
          FUNDING PROGRESS
        </span>
        <span style={{ fontSize: "13px", color: "#d5ff77", fontWeight: "800" }}>
          {formatLKR(raised)} / {formatLKR(target)}
        </span>
      </div>
      <div style={{ height: "8px", background: "rgba(255,255,255,0.07)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{
          width: `${percentage}%`, height: "100%",
          background: "linear-gradient(90deg, #d5ff77, #95e56d)",
          borderRadius: "4px", transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ fontSize: "12px", color: "rgba(213,229,220,0.5)", marginTop: "6px", textAlign: "right" }}>
        {percentage.toFixed(0)}% funded
      </div>
    </div>
  );
}

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", capacityKW: "", cost: "", totalFunding: 0 });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => { loadProject(); }, []);

  const loadProject = async () => {
    setFetching(true);
    setFeedback(null);
    try {
      const data = await projectApi.getOne(id);
      setForm({ name: data.name, capacityKW: data.capacityKW, cost: data.cost, totalFunding: data.totalFunding || 0 });
    } catch (err) {
      console.error("Load error:", err);
      setFeedback({
        type: "error",
        message: `❌ ${err.message || "Failed to load project data"}`,
      });
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      await projectApi.update(id, form);
      setFeedback({
        type: "success",
        message: "✅ Project updated successfully! Redirecting...",
      });
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      setFeedback({
        type: "error",
        message: `❌ ${err.message || "Failed to update project"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const monthlyGeneration = form.capacityKW ? form.capacityKW * 120 : 0;
  const monthlySavings = monthlyGeneration * 25;
  const annualROI = form.cost && form.capacityKW
    ? Math.round((monthlySavings * 12) / form.cost * 100)
    : null;

  if (fetching) {
    return (
      <div style={{ ...odPageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{focusInputStyle}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.6 }}>◈</div>
          <p style={{ color: "rgba(231,243,237,0.6)", fontSize: "15px", fontWeight: "700" }}>Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={odPageStyle}>
      <style>{focusInputStyle}</style>
      <style>{`
        .ep-back:hover { color: #d5ff77 !important; }
        .eco-input:focus {
          border-color: rgba(213,255,119,0.5) !important;
          background: rgba(255,255,255,0.09) !important;
          box-shadow: 0 0 0 3px rgba(213,255,119,0.08);
        }
        .eco-input::placeholder { color: rgba(255,255,255,0.2); }
        .ep-submit:hover { opacity: 0.88; transform: translateY(-1px); }
        .ep-cancel:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-1px); }
        .ep-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Hero banner */}
      <div style={{ padding: "26px 16px 10px" }}>
        <div style={{
          maxWidth: "740px", margin: "0 auto",
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
            Edit Project
          </h1>
          <p style={{ margin: 0, color: "rgba(231,243,237,0.75)", fontSize: "15px", lineHeight: 1.6 }}>
            Update the core details of this energy project.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "740px", margin: "0 auto", padding: "16px 16px 48px" }}>

        {/* Back */}
        <button
          className="ep-back"
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
        {!feedback || feedback.type !== "error" ? (
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
                  style={inputStyle}
                  placeholder="Project name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              {/* Capacity + Cost */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Capacity (kW)</label>
                  <input
                    type="number"
                    className="eco-input"
                    style={inputStyle}
                    placeholder="kW"
                    required
                    value={form.capacityKW}
                    onChange={(e) => setForm({ ...form, capacityKW: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Total Cost (LKR)</label>
                  <input
                    type="number"
                    className="eco-input"
                    style={inputStyle}
                    placeholder="Cost"
                    required
                    value={form.cost}
                    onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  />
                </div>
              </div>

              {/* Funding Progress */}
              {form.cost > 0 && (
                <div style={{
                  borderRadius: "12px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)", padding: "16px",
                }}>
                  <FundingProgressBar raised={form.totalFunding} target={form.cost} />
                </div>
              )}

              {/* Live metrics */}
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
                      MONTHLY GENERATION
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#c6f06a" }}>
                      {monthlyGeneration.toLocaleString()} <span style={{ fontSize: "13px", fontWeight: "700", color: "rgba(213,229,220,0.5)" }}>kWh</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(213,229,220,0.55)", fontWeight: "800", letterSpacing: "0.06em", marginBottom: "6px" }}>
                      MONTHLY SAVINGS
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "900", color: "#c6f06a" }}>{formatLKR(monthlySavings)}</div>
                  </div>
                </div>
              )}

              {/* ROI */}
              {annualROI !== null && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 20px", borderRadius: "12px",
                  background: annualROI > 15 ? "rgba(213,255,119,0.08)" : annualROI > 8 ? "rgba(253,230,138,0.1)" : "rgba(255,126,126,0.08)",
                  border: `1px solid ${annualROI > 15 ? "rgba(213,255,119,0.22)" : annualROI > 8 ? "rgba(253,230,138,0.25)" : "rgba(255,126,126,0.2)"}`,
                }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "rgba(213,229,220,0.55)", fontWeight: "800", letterSpacing: "0.06em" }}>
                      ESTIMATED ANNUAL ROI
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(213,229,220,0.5)", marginTop: "3px" }}>
                      Based on {monthlySavings.toLocaleString()} monthly savings
                    </div>
                  </div>
                  <span style={{
                    fontSize: "26px", fontWeight: "900",
                    color: annualROI > 15 ? "#c6f06a" : annualROI > 8 ? "#fde68a" : "#fca5a5",
                  }}>
                    {annualROI}%
                  </span>
                </div>
              )}

              {/* Divider */}
              <div style={{ height: "1px", background: "rgba(255,255,255,0.07)" }} />

              {/* Actions */}
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  type="button"
                  className="ep-cancel"
                  onClick={() => navigate("/projects")}
                  style={{
                    flex: 1, padding: "14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px", color: "rgba(213,229,220,0.7)",
                    fontWeight: "800", fontSize: "15px", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ep-submit"
                  style={{
                    flex: 2, padding: "14px",
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
                    Save Changes
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
                      Saving...
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "16px" }}>
          Only name, capacity, and cost can be updated after creation.
        </p>
      </div>
    </div>
  );
}