// src/components/projects/EditProject.jsx
import { useEffect, useState } from "react";
import { projectApi } from "../../api";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
import { useParams, useNavigate } from "react-router-dom";
import {
  pageWrapperStyle,
  glassPanelStyle,
  inputStyle,
  primaryBtnStyle,
  PageHeader,
  FormField,
  BackLink,
  focusInputStyle,
} from "../../components/feature-1/UI";

// Funding Progress Bar Component
function FundingProgressBar({ raised, target }) {
  const percentage = Math.min(Math.max((raised / target) * 100, 0), 100);
  
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
        <span style={{ fontSize: "11px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.06em" }}>
          FUNDING PROGRESS
        </span>
        <span style={{ fontSize: "12px", color: "#4ade80", fontWeight: "700" }}>
  {formatLKR(raised)} / {formatLKR(target)}
</span>
      </div>
      <div
        style={{
          height: "8px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            borderRadius: "4px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div style={{ fontSize: "11px", color: "#8aad92", marginTop: "6px", textAlign: "right" }}>
        {percentage.toFixed(0)}% funded
      </div>
    </div>
  );
}

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    capacityKW: "",
    cost: "",
    totalFunding: 0,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      const data = await projectApi.getOne(id);
      setForm({
        name: data.name,
        capacityKW: data.capacityKW,
        cost: data.cost,
        totalFunding: data.totalFunding || 0,
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await projectApi.update(id, form);
      alert("Updated successfully ✅");
      navigate("/projects");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const monthlyGeneration = form.capacityKW ? form.capacityKW * 120 : 0;
  const monthlySavings = monthlyGeneration * 25;
  const annualROI = form.cost && form.capacityKW
    ? Math.round((monthlySavings * 12) / form.cost * 100)
    : null;

  if (fetching) {
    return (
      <div style={{ ...pageWrapperStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{focusInputStyle}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.6 }}>◈</div>
          <p style={{ color: "#6abf7b", fontSize: "14px" }}>Loading project data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <style>{focusInputStyle}</style>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px" }}>
        <BackLink onClick={() => navigate("/projects")} />

        <PageHeader
          title="Edit Project"
          subtitle="Update the core details of this energy project"
        />

        <div style={{ ...glassPanelStyle, padding: "32px" }} className="fade-up fade-up-1">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Project Name */}
            <FormField label="Project Name">
              <input
                className="eco-input"
                style={inputStyle}
                placeholder="Project name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </FormField>

            {/* Capacity + Cost */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FormField label="Capacity (kW)">
                <input
                  type="number"
                  className="eco-input"
                  style={inputStyle}
                  placeholder="kW"
                  required
                  value={form.capacityKW}
                  onChange={(e) => setForm({ ...form, capacityKW: Number(e.target.value) })}
                />
              </FormField>
              <FormField label="Total Cost (LKR)">
                <input
                  type="number"
                  className="eco-input"
                  style={inputStyle}
                  placeholder="Cost"
                  required
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                />
              </FormField>
            </div>

            {/* Funding Progress Bar */}
            {form.cost > 0 && (
              <FundingProgressBar raised={form.totalFunding} target={form.cost} />
            )}

            {/* Metrics Cards */}
            {form.capacityKW > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  padding: "16px",
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: "12px",
                  marginTop: "8px",
                }}
              >
                <div>
                  <div style={{ fontSize: "10px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.06em", marginBottom: "6px" }}>
                    MONTHLY GENERATION
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#4ade80" }}>
                    {monthlyGeneration.toLocaleString()} <span style={{ fontSize: "11px", color: "#6abf7b" }}>kWh</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.06em", marginBottom: "6px" }}>
                    MONTHLY SAVINGS
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "700", color: "#4ade80" }}>
                    {formatLKR(monthlySavings)}
                  </div>
                </div>
              </div>
            )}

            {/* ROI hint */}
            {annualROI !== null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  background: annualROI > 15 
                    ? "rgba(34,197,94,0.12)" 
                    : annualROI > 8 
                    ? "rgba(251,191,36,0.1)" 
                    : "rgba(239,68,68,0.08)",
                  border: `1px solid ${
                    annualROI > 15 
                      ? "rgba(34,197,94,0.3)" 
                      : annualROI > 8 
                      ? "rgba(251,191,36,0.25)" 
                      : "rgba(239,68,68,0.2)"
                  }`,
                  borderRadius: "12px",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.06em" }}>
                    ESTIMATED ANNUAL ROI
                  </span>
                  <div style={{ fontSize: "11px", color: "#8aad92", marginTop: "2px" }}>
                    Based on {monthlySavings.toLocaleString()} monthly savings
                  </div>
                </div>
                <span style={{ 
                  fontSize: "24px", 
                  fontWeight: "800", 
                  color: annualROI > 15 ? "#4ade80" : annualROI > 8 ? "#fbbf24" : "#f87171"
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
                onClick={() => navigate("/projects")}
                style={{
                  flex: 1,
                  padding: "13px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "10px",
                  color: "#8aad92",
                  fontWeight: "600",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="eco-btn-primary"
                style={{ ...primaryBtnStyle, flex: 2, opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? "Saving Changes..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* Info note */}
        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textAlign: "center", marginTop: "16px" }}>
          Only name, capacity, and cost can be updated after creation.
        </p>
      </div>
    </div>
  );
}