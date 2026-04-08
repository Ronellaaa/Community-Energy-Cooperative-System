// src/components/projects/CreateProject.jsx
import { useState, useEffect } from "react";
import { projectApi, communityApi } from "../../api";
import { useNavigate } from "react-router-dom";
import {
  pageWrapperStyle,
  glassPanelStyle,
  inputStyle,
  primaryBtnStyle,
  labelStyle,
  PageHeader,
  FormField,
  BackLink,
  focusInputStyle,
  TYPE_ICONS,
} from "../../components/feature-1/UI";


const PROJECT_TYPES = ["Company", "Community"];
const ENERGY_TYPES = ["Solar", "Wind", "Hydro"];

export default function CreateProject() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    projectType: "Company", // Make sure this is set
    type: "Solar",
    capacityKW: "",
    cost: "",
    communityId: "",
  });

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
  try {
    const res = await communityApi.getApproved(); // 👈 NEW API

    setCommunities(res); // already approved from backend
  } catch (err) {
    console.error(err.message);
  }
};

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Project name is required";
    if (!form.capacityKW || form.capacityKW <= 0) newErrors.capacityKW = "Valid capacity is required";
    if (!form.cost || form.cost <= 0) newErrors.cost = "Valid cost is required";
    if (form.projectType === "Community" && !form.communityId) {
      newErrors.communityId = "Please select a community";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        projectType: form.projectType,
        type: form.type,
        capacityKW: Number(form.capacityKW),
        cost: Number(form.cost),
      };
      
      // Only add communityId if projectType is Community
      if (form.projectType === "Community" && form.communityId) {
        payload.communityId = form.communityId;
      }
      
      console.log("Sending payload:", payload); // Debug log
      
      await projectApi.create(payload);
      alert("Project Created Successfully! ✅");
      navigate("/projects");
    } catch (err) {
      console.error("Creation error:", err);
      alert(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  // Estimated values for preview
  const estimatedGeneration = form.capacityKW ? (form.capacityKW * 120).toLocaleString() : "—";
  const estimatedSavings = form.capacityKW
  ? formatLKR(Number(form.capacityKW) * 18)
  : "—";
  return (
    <div style={pageWrapperStyle}>
      <style>{focusInputStyle}</style>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "40px 24px" }}>
        <BackLink onClick={() => navigate("/projects")} />

        <PageHeader
          title="New Energy Project"
          subtitle="Configure and submit a new renewable energy initiative"
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Main Form Card */}
          <div style={{ ...glassPanelStyle, padding: "32px" }} className="fade-up fade-up-1">
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

              {/* Project Name */}
              <FormField label="Project Name">
                <input
                  className="eco-input"
                  style={inputStyle}
                  placeholder="e.g. North Valley Solar Farm"
                  required
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                />
                {errors.name && <span style={{ color: "#f87171", fontSize: "11px", marginTop: "4px" }}>{errors.name}</span>}
              </FormField>

              {/* Project Type Toggle */}
              <FormField label="Project Type">
                <div style={{ display: "flex", gap: "10px" }}>
                  {PROJECT_TYPES.map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, projectType: pt, communityId: "" });
                        if (errors.communityId) setErrors({ ...errors, communityId: null });
                      }}
                      style={{
                        flex: 1,
                        padding: "11px",
                        borderRadius: "10px",
                        border: form.projectType === pt
                          ? "1px solid rgba(34,197,94,0.6)"
                          : "1px solid rgba(255,255,255,0.1)",
                        background: form.projectType === pt
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(255,255,255,0.04)",
                        color: form.projectType === pt ? "#4ade80" : "#8aad92",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {pt === "Company" ? "◈ Company" : "◉ Community"}
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Community selector — only for Community type */}
              {form.projectType === "Community" && (
                <FormField label="Linked Community">
                  <select
                    className="eco-input"
                    style={inputStyle}
                    required
                    value={form.communityId}
                    onChange={(e) => {
                      setForm({ ...form, communityId: e.target.value });
                      if (errors.communityId) setErrors({ ...errors, communityId: null });
                    }}
                  >
                    <option value="">Select an approved community</option>
                    {communities.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.communityId && <span style={{ color: "#f87171", fontSize: "11px", marginTop: "4px" }}>{errors.communityId}</span>}
                  {communities.length === 0 && (
                    <p style={{ color: "#fbbf24", fontSize: "11px", marginTop: "4px" }}>
                      No approved communities available. Please contact admin.
                    </p>
                  )}
                </FormField>
              )}

              {/* Energy Type */}
              <FormField label="Energy Source">
                <div style={{ display: "flex", gap: "10px" }}>
                  {ENERGY_TYPES.map((et) => (
                    <button
                      key={et}
                      type="button"
                      onClick={() => setForm({ ...form, type: et })}
                      style={{
                        flex: 1,
                        padding: "11px 8px",
                        borderRadius: "10px",
                        border: form.type === et
                          ? "1px solid rgba(34,197,94,0.6)"
                          : "1px solid rgba(255,255,255,0.1)",
                        background: form.type === et
                          ? "rgba(34,197,94,0.15)"
                          : "rgba(255,255,255,0.04)",
                        color: form.type === et ? "#4ade80" : "#8aad92",
                        fontWeight: "600",
                        fontSize: "13px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>{TYPE_ICONS[et]}</span>
                      <span>{et}</span>
                    </button>
                  ))}
                </div>
              </FormField>

              {/* Capacity + Cost row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Capacity (kW)">
                  <input
                    type="number"
                    className="eco-input"
                    style={inputStyle}
                    placeholder="e.g. 500"
                    required
                    value={form.capacityKW}
                    onChange={(e) => {
                      setForm({ ...form, capacityKW: e.target.value === "" ? "" : Number(e.target.value) });
                      if (errors.capacityKW) setErrors({ ...errors, capacityKW: null });
                    }}
                  />
                  {errors.capacityKW && <span style={{ color: "#f87171", fontSize: "11px", marginTop: "4px" }}>{errors.capacityKW}</span>}
                </FormField>
                <FormField label="Total Cost (LKR)">
                  <input
                    type="number"
                    className="eco-input"
                    style={inputStyle}
                    placeholder="e.g. 120000"
                    required
                    value={form.cost}
                    onChange={(e) => {
                      setForm({ ...form, cost: e.target.value === "" ? "" : Number(e.target.value) });
                      if (errors.cost) setErrors({ ...errors, cost: null });
                    }}
                  />
                  {errors.cost && <span style={{ color: "#f87171", fontSize: "11px", marginTop: "4px" }}>{errors.cost}</span>}
                </FormField>
              </div>

              {/* Live Estimates Banner */}
              {form.capacityKW > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    padding: "16px",
                    background: "rgba(34,197,94,0.07)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    borderRadius: "10px",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.06em", marginBottom: "4px" }}>EST. MONTHLY GENERATION</div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#4ade80" }}>{estimatedGeneration} <span style={{ fontSize: "12px", fontWeight: "400", color: "#6abf7b" }}>kWh</span></div>
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.06em", marginBottom: "4px" }}>EST. MONTHLY SAVINGS</div>
                    <div style={{ fontSize: "18px", fontWeight: "700", color: "#4ade80" }}>{estimatedSavings}</div>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="eco-btn-primary"
                style={{ ...primaryBtnStyle, marginTop: "4px", opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? "Creating Project..." : "Create Project"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}