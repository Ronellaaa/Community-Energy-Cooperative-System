// src/components/projects/ProjectDetails.jsx
import { useEffect, useState } from "react";
import { projectApi } from "../../api";
import { useParams, useNavigate } from "react-router-dom";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
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

function StatusBadge({ status }) {
  const cfg = {
    Active:   { bg: "rgba(149,229,109,0.18)", border: "rgba(149,229,109,0.35)", color: "#a7e87a", dot: "#a7e87a" },
    Approved: { bg: "rgba(96,165,250,0.18)",  border: "rgba(96,165,250,0.3)",   color: "#93c5fd", dot: "#93c5fd" },
    Pending:  { bg: "rgba(253,230,138,0.18)", border: "rgba(253,230,138,0.35)", color: "#fde68a", dot: "#fde68a" },
    Rejected: { bg: "rgba(255,126,126,0.18)", border: "rgba(255,126,126,0.3)",  color: "#fca5a5", dot: "#fca5a5" },
  };
  const c = cfg[status] || cfg.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "6px",
      padding: "4px 12px", borderRadius: "999px", fontSize: "13px",
      fontWeight: "800", letterSpacing: "0.04em",
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "4px 11px",
      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: "6px", fontSize: "13px", color: "#a7d7b2", fontWeight: "700",
    }}>
      <span style={{ fontSize: "14px" }}>{TYPE_ICONS[type] || "◆"}</span>
      {type}
    </span>
  );
}

function StatCard({ label, value, unit, accent = false }) {
  return (
    <div style={{
      padding: "18px", borderRadius: "12px",
      background: accent ? "rgba(213,255,119,0.07)" : "rgba(255,255,255,0.04)",
      border: accent ? "1px solid rgba(213,255,119,0.18)" : "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column", gap: "6px",
    }}>
      <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "0.07em", color: "rgba(213,229,220,0.55)", textTransform: "uppercase" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span style={{ fontSize: "22px", fontWeight: "900", color: accent ? "#c6f06a" : "#f1f8f4" }}>
          {value ?? "—"}
        </span>
        {unit && <span style={{ fontSize: "13px", color: "rgba(213,229,220,0.5)", fontWeight: "700" }}>{unit}</span>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <span style={{ fontSize: "14px", color: "rgba(213,229,220,0.6)", fontWeight: "600" }}>{label}</span>
      <span style={{ fontSize: "14px", color: "#f1f8f4", fontWeight: "800" }}>{value ?? "—"}</span>
    </div>
  );
}

function FundingProgressBar({ raised, target }) {
  const percentage = target > 0 ? Math.min(Math.max((raised / target) * 100, 0), 100) : 0;
  return (
    <div style={{ marginBottom: "4px" }}>
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
      <div style={{ fontSize: "12px", color: "rgba(213,229,220,0.5)", marginTop: "6px" }}>
        {percentage.toFixed(0)}% funded
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, variant = "approve", disabled = false, loading = false }) {
  const variants = {
    approve: { bg: "rgba(149,229,109,0.14)", border: "rgba(149,229,109,0.3)",  color: "#a7e87a", hoverBg: "rgba(149,229,109,0.24)" },
    reject:  { bg: "rgba(255,126,126,0.12)", border: "rgba(255,126,126,0.28)", color: "#fca5a5", hoverBg: "rgba(255,126,126,0.22)" },
    activate:{ bg: "rgba(213,255,119,0.12)", border: "rgba(213,255,119,0.28)", color: "#c6f06a", hoverBg: "rgba(213,255,119,0.22)" },
    delete:  { bg: "rgba(255,126,126,0.08)", border: "rgba(255,126,126,0.2)",  color: "#fca5a5", hoverBg: "rgba(255,126,126,0.16)" },
    edit:    { bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.25)",  color: "#fcd34d", hoverBg: "rgba(251,191,36,0.2)"  },
  };
  const s = variants[variant] || variants.approve;
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: "11px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "800",
        cursor: (disabled || loading) ? "not-allowed" : "pointer",
        transition: "all 0.2s ease", opacity: disabled ? 0.5 : 1,
        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
        position: "relative",
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) { e.currentTarget.style.background = s.hoverBg; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={(e) => { if (!disabled && !loading) { e.currentTarget.style.background = s.bg; e.currentTarget.style.transform = "translateY(0)"; } }}
    >
      <span style={{ opacity: loading ? 0 : 1 }}>{label}</span>
      {loading && (
        <span style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <span style={{
            width: "16px", height: "16px", border: "2px solid currentColor",
            borderTopColor: "transparent", borderRadius: "50%",
            display: "inline-block", animation: "spin 0.8s linear infinite",
          }} />
        </span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { if (id) fetchProject(); }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      console.log("ID:", id);
      const data = await projectApi.getOne(id);
      setProject(data);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || "Failed to load project details";
      
      if (errorMessage.includes("log in") || errorMessage.includes("login") || errorMessage.includes("Please log in")) {
        setFeedback({
          type: "auth",
          message: "🔐 Please log in first to view project details",
          action: true,
          actionLabel: "Go to Login",
          onAction: () => navigate("/login"),
        });
      } else if (errorMessage.includes("not found")) {
        setFeedback({
          type: "error",
          message: "❌ Project not found. It may have been deleted.",
          action: true,
          actionLabel: "Back to Projects",
          onAction: () => navigate("/projects"),
        });
      } else if (errorMessage.includes("Forbidden") || errorMessage.includes("403")) {
        setFeedback({
          type: "auth",
          message: "🔒 You don't have permission to view this project",
          action: true,
          actionLabel: "Back to Projects",
          onAction: () => navigate("/projects"),
        });
      } else {
        setFeedback({
          type: "error",
          message: `❌ ${errorMessage}`,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (apiCall, actionName, actionKey) => {
    if (!window.confirm(`Are you sure you want to ${actionName} this project?`)) return;
    
    setActionLoading(prev => ({ ...prev, [actionKey]: true }));
    setFeedback(null);
    
    try {
      await apiCall(id);
      setFeedback({
        type: "success",
        message: `✅ Project ${actionName}d successfully!`,
        autoDismiss: true,
      });
      await fetchProject();
    } catch (err) {
      console.error(`${actionName} error:`, err);
      setFeedback({
        type: "error",
        message: `❌ ${err.message || `Failed to ${actionName} project`}`,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project? This action cannot be undone.")) return;
    
    setActionLoading(prev => ({ ...prev, delete: true }));
    setFeedback(null);
    
    try {
      await projectApi.delete(id);
      setFeedback({
        type: "success",
        message: "✅ Project deleted successfully! Redirecting...",
      });
      setTimeout(() => {
        navigate("/projects");
      }, 1500);
    } catch (err) {
      console.error("Delete error:", err);
      setFeedback({
        type: "error",
        message: `❌ ${err.message || "Failed to delete project"}`,
      });
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  const canActivate = project && project.status === "Approved" && (project.totalFunding || 0) >= (project.cost || 0);

  if (loading && !project) {
    return (
      <div style={{ ...odPageStyle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{focusInputStyle}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.5 }}>{TYPE_ICONS.Solar}</div>
          <p style={{ color: "rgba(231,243,237,0.6)", fontSize: "15px", fontWeight: "700" }}>Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={odPageStyle}>
        <style>{focusInputStyle}</style>
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>
          <button
            className="pd-back"
            onClick={() => navigate("/projects")}
            style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "none", border: "none", color: "#a7e87a",
              fontSize: "14px", fontWeight: "800", cursor: "pointer",
              padding: 0, marginBottom: "28px",
            }}
          >
            ← Back to Projects
          </button>
          
          {feedback && (
            <FeedbackMessage
              {...feedback}
              onDismiss={() => setFeedback(null)}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={odPageStyle}>
      <style>{focusInputStyle}</style>
      <style>{`
        .pd-back:hover { color: #d5ff77 !important; }
      `}</style>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}>

        {/* Back */}
        <button
          className="pd-back"
          onClick={() => navigate("/projects")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "none", border: "none", color: "#a7e87a",
            fontSize: "14px", fontWeight: "800", cursor: "pointer",
            padding: 0, marginBottom: "28px", transition: "color 0.2s ease",
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

        {/* Header card */}
        <div style={{
          borderRadius: "24px",
          background: "linear-gradient(135deg,rgba(14,37,31,0.97),rgba(19,56,44,0.92))",
          border: "1px solid rgba(191,255,116,0.14)",
          padding: "28px", marginBottom: "20px",
        }} className="fade-up fade-up-1">
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <span style={{ fontSize: "32px" }}>{TYPE_ICONS[project.type] || "◆"}</span>
                <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#fff", letterSpacing: "-0.02em", margin: 0, lineHeight: 1.1 }}>
                  {project.name}
                </h1>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <StatusBadge status={project.status} />
                <TypeBadge type={project.type} />
                {project.communityId && (
                  <span style={{
                    padding: "4px 11px",
                    background: "rgba(149,229,109,0.1)", border: "1px solid rgba(149,229,109,0.22)",
                    borderRadius: "6px", fontSize: "13px", color: "#a7e87a", fontWeight: "700",
                  }}>
                    {project.communityId.name}
                  </span>
                )}
              </div>
            </div>
            <ActionButton
              label="✏️ Edit Project"
              variant="edit"
              onClick={() => navigate(`/projects/${project._id}/edit`)}
              loading={actionLoading.edit}
            />
          </div>
        </div>

        {/* Stat grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}
          className="fade-up fade-up-2">
          <StatCard label="Capacity" value={project.capacityKW} unit="kW" />
          <StatCard label="Total Cost (LKR)" value={project.cost ? formatLKR(project.cost) : null} />
          <StatCard label="Monthly Generation" value={project.expectedMonthlyGeneration} unit="kWh" accent />
          <StatCard label="Monthly Savings (LKR)" value={project.expectedMonthlySavings ? formatLKR(project.expectedMonthlySavings) : null} accent />
        </div>

        {/* Funding */}
        {project.cost > 0 && (
          <div style={{
            borderRadius: "16px", background: "rgba(8,27,21,0.74)",
            border: "1px solid rgba(191,255,116,0.1)", padding: "20px", marginBottom: "16px",
          }} className="fade-up fade-up-3">
            <FundingProgressBar raised={project.totalFunding || 0} target={project.cost} />
          </div>
        )}

        {/* Details */}
        <div style={{
          borderRadius: "16px", background: "rgba(8,27,21,0.74)",
          border: "1px solid rgba(191,255,116,0.1)", padding: "22px", marginBottom: "16px",
        }} className="fade-up fade-up-3">
          <h3 style={{ fontSize: "11px", fontWeight: "800", color: "rgba(213,229,220,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 8px 0" }}>
            Project Details
          </h3>
          <InfoRow label="Status" value={project.status} />
          <InfoRow label="Energy Type" value={project.type} />
          {/* <InfoRow label="Project Category" value={project.projectType} /> */}
          {project.communityId && <InfoRow label="Community" value={project.communityId.name} />}
          <InfoRow label="Total Funding Raised (LKR)" value={formatLKR(project.totalFunding || 0)} />
        </div>

        {/* Actions */}
        <div style={{
          borderRadius: "16px", background: "rgba(8,27,21,0.74)",
          border: "1px solid rgba(191,255,116,0.1)", padding: "22px",
        }} className="fade-up fade-up-4">
          <h3 style={{ fontSize: "11px", fontWeight: "800", color: "rgba(213,229,220,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px 0" }}>
            Project Actions
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {project.status === "Pending" && (
              <> 
                <ActionButton 
                  label="✓ Approve Project" 
                  variant="approve"
                  onClick={() => handleAction(projectApi.approve, "approve", "approve")} 
                  loading={actionLoading.approve}
                />
                <ActionButton 
                  label="✕ Reject Project" 
                  variant="reject"
                  onClick={() => handleAction(projectApi.reject, "reject", "reject")} 
                  loading={actionLoading.reject}
                />
              </>
            )}
            <ActionButton 
              label="Add Payment" 
              variant="activate"
              onClick={() => navigate(`/finance-payments/project/${project._id}`)}
            />
            {project.status === "Approved" && (
              <ActionButton 
                label="▶ Activate Project" 
                variant="activate"
                onClick={() => handleAction(projectApi.activate, "activate", "activate")}
                loading={actionLoading.activate}
                disabled={!canActivate}
              />
            )}
            <ActionButton 
              label="🗑 Delete Project" 
              variant="delete"
              onClick={handleDelete} 
              loading={actionLoading.delete}
            />
          </div>

          {project.status === "Approved" && !canActivate && project.cost > 0 && (
            <div style={{
              marginTop: "16px", padding: "13px 16px",
              background: "rgba(253,230,138,0.1)", border: "1px solid rgba(253,230,138,0.25)",
              borderRadius: "10px", fontSize: "13px", color: "#fde68a", textAlign: "center", fontWeight: "600",
            }}>
              ⚠️ Need additional {formatLKR((project.cost || 0) - (project.totalFunding || 0))} in funding before this project can be activated.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}