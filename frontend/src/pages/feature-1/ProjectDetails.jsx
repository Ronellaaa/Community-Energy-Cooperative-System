// src/components/projects/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { projectApi } from "../../api";
import { useParams, useNavigate } from "react-router-dom";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
import {
  pageWrapperStyle,
  glassPanelStyle,
  PageHeader,
  BackLink,
  StatusBadge,
  TypeBadge,
  focusInputStyle,
  TYPE_ICONS,
} from "../../components/feature-1/UI";

function StatCard({ label, value, unit, accent = false }) {
  return (
    <div
      style={{
        padding: "18px",
        background: accent ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
        border: accent ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(255,255,255,0.07)",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span style={{ fontSize: "11px", fontWeight: "600", letterSpacing: "0.07em", color: "#6abf7b", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ fontSize: "22px", fontWeight: "800", color: accent ? "#4ade80" : "#e8f5e9" }}>
          {value ?? "—"}
        </span>
        {unit && (
          <span style={{ fontSize: "12px", color: "#6abf7b", fontWeight: "500" }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: "13px", color: "#6abf7b", fontWeight: "500" }}>{label}</span>
      <span style={{ fontSize: "13px", color: "#d1fae5", fontWeight: "600" }}>{value ?? "—"}</span>
    </div>
  );
}

function ActionButton({ label, onClick, variant = "default", disabled = false }) {
  const variants = {
    approve: {
      background: "rgba(34,197,94,0.12)",
      border: "1px solid rgba(34,197,94,0.3)",
      color: "#4ade80",
      hoverBg: "rgba(34,197,94,0.2)",
    },
    reject: {
      background: "rgba(239,68,68,0.1)",
      border: "1px solid rgba(239,68,68,0.3)",
      color: "#f87171",
      hoverBg: "rgba(239,68,68,0.18)",
    },
    activate: {
      background: "rgba(14,165,233,0.1)",
      border: "1px solid rgba(14,165,233,0.3)",
      color: "#38bdf8",
      hoverBg: "rgba(14,165,233,0.18)",
    },
    delete: {
      background: "rgba(239,68,68,0.08)",
      border: "1px solid rgba(239,68,68,0.2)",
      color: "#f87171",
      hoverBg: "rgba(239,68,68,0.15)",
    },
  };

  const style = variants[variant] || variants.approve;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 20px",
        borderRadius: "10px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = style.hoverBg;
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = style.background;
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {label}
    </button>
  );
}

function FundingProgressBar({ raised, target }) {
  const percentage = Math.min(Math.max((raised / target) * 100, 0), 100);
  
  return (
    <div style={{ marginTop: "8px", marginBottom: "16px" }}>
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
      <div style={{ fontSize: "11px", color: "#8aad92", marginTop: "6px" }}>
        {percentage.toFixed(0)}% funded
      </div>
    </div>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (id) fetchProject();
}, [id]);

  const fetchProject = async () => {
    try {
      console.log("ID:", id);
      const data = await projectApi.getOne(id);
      setProject(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAction = async (apiCall, actionName) => {
    if (!window.confirm(`Are you sure you want to ${actionName} this project?`)) return;
    setLoading(true);
    try {
      await apiCall(id);
      alert(`Project ${actionName}d successfully! ✅`);
      fetchProject();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    setLoading(true);
    try {
      await projectApi.delete(id);
      alert("Project deleted successfully ✅");
      navigate("/projects");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const canActivate = project && project.status === "Approved" && (project.totalFunding || 0) >= (project.cost || 0);

  if (!project) {
    return (
      <div style={{ ...pageWrapperStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{focusInputStyle}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.5 }}>{TYPE_ICONS.Solar}</div>
          <p style={{ color: "#6abf7b", fontSize: "14px" }}>Loading project details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageWrapperStyle}>
      <style>{focusInputStyle}</style>

      <div style={{ maxWidth: "700px", margin: "0 auto", padding: "40px 24px" }}>
        <BackLink onClick={() => navigate("/projects")} />

        {/* Header */}
        <div style={{ marginBottom: "28px" }} className="fade-up fade-up-1">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "28px" }}>{TYPE_ICONS[project.type] || "◆"}</span>
                <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#e8f5e9", letterSpacing: "-0.02em", margin: 0 }}>
                  {project.name}
                </h1>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <StatusBadge status={project.status} />
                <TypeBadge type={project.type} />
                {project.communityId && (
                  <span
                    style={{
                      padding: "3px 10px",
                      background: "rgba(14,165,233,0.1)",
                      border: "1px solid rgba(14,165,233,0.25)",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#7dd3fc",
                      fontWeight: "500",
                    }}
                  >
                    {project.communityId.name}
                  </span>
                )}
              </div>
            </div>

            {/* Edit button */}
            <button
              onClick={() => navigate(`/projects/${project._id}/edit`)}
              style={{
                padding: "10px 20px",
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "10px",
                color: "#fcd34d",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(251,191,36,0.18)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(251,191,36,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              ✏️ Edit Project
            </button>
          </div>
        </div>

        {/* Stats Grid */}
                    <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
              className="fade-up fade-up-2"
            >
              <StatCard label="Capacity" value={project.capacityKW} unit="kW" />

              <StatCard
                label="Total Cost (LKR)"
                value={project.cost ? formatLKR(project.cost) : null}
              />

              <StatCard
                label="Monthly Generation"
                value={project.expectedMonthlyGeneration}
                unit="kWh"
                accent
              />

              <StatCard
                label="Monthly Savings (LKR)"
                value={
                  project.expectedMonthlySavings
                    ? formatLKR(project.expectedMonthlySavings)
                    : null
                }
                accent
              />
            </div>

        {/* Funding Progress Bar */}
        {project.cost > 0 && (
          <div className="fade-up fade-up-3" style={{ marginBottom: "20px" }}>
            <FundingProgressBar raised={project.totalFunding || 0} target={project.cost} />
          </div>
        )}

        {/* Details Card */}
        <div style={{ ...glassPanelStyle, padding: "24px" }} className="fade-up fade-up-3">
          <h3 style={{ fontSize: "12px", fontWeight: "700", color: "#6abf7b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px 0" }}>
            Project Details
          </h3>
          <InfoRow label="Status" value={project.status} />
          <InfoRow label="Energy Type" value={project.type} />
          <InfoRow label="Project Category" value={project.projectType} />
          {project.communityId && (
            <InfoRow label="Community" value={project.communityId.name} />
          )}
          <InfoRow
            label="Total Funding Raised (LKR)"
            value={
              project.totalFunding
                ? formatLKR(project.totalFunding)
                : formatLKR(0)
            }
          />      
        <div style={{ paddingTop: "12px" }} />
        </div>

        {/* Action Buttons Section - Approve/Reject/Activate/Delete */}
        <div className="fade-up fade-up-4" style={{ marginTop: "24px" }}>
          <div style={{ 
            ...glassPanelStyle, 
            padding: "20px 24px",
            background: "rgba(255,255,255,0.03)",
          }}>
            <h3 style={{ fontSize: "11px", fontWeight: "700", color: "#6abf7b", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px 0" }}>
              Project Actions
            </h3>
            
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {/* Approve button - only for Pending projects */}
              {project.status === "Pending" && (
                <ActionButton
                  label="✓ Approve Project"
                  variant="approve"
                  onClick={() => handleAction(projectApi.approve, "approve")}
                  disabled={loading}
                />
                
              )}

              {/*Add payment button*/}
              <ActionButton
                  label="Add Payment"
                  variant="activate"
                  onClick={() => navigate(`/fund-record/${project._id}`)}
                />

              {/* Activate button - only for Approved projects with sufficient funding */}
              {project.status === "Approved" && (
                <ActionButton
                  label="▶ Activate Project"
                  variant="activate"
                  onClick={() => handleAction(projectApi.activate, "activate")}
                  disabled={loading || !canActivate}
                />
              )}

              {/* Delete button - always visible */}
              <ActionButton
                label="🗑 Delete Project"
                variant="delete"
                onClick={handleDelete}
                disabled={loading}
              />
            </div>

            {/* Warning message for insufficient funding */}
            {project.status === "Approved" && !canActivate && project.cost > 0 && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#fbbf24",
                  textAlign: "center",
                }}
              >
        ⚠️ Need additional {formatLKR((project.cost || 0) - (project.totalFunding || 0))} in funding before this project can be activated.              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}