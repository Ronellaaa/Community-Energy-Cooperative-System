// UserProjectDetails.jsx
import { useEffect, useState } from "react";
import { projectApi, apiRequest } from "../../api";
import { useParams, useNavigate } from "react-router-dom";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
import { focusInputStyle, TYPE_ICONS } from "../../components/feature-1/UI";
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
    Active: {
      bg: "rgba(149,229,109,0.18)",
      border: "rgba(149,229,109,0.35)",
      color: "#a7e87a",
      dot: "#a7e87a",
    },
    Approved: {
      bg: "rgba(96,165,250,0.18)",
      border: "rgba(96,165,250,0.3)",
      color: "#93c5fd",
      dot: "#93c5fd",
    },
    Pending: {
      bg: "rgba(253,230,138,0.18)",
      border: "rgba(253,230,138,0.35)",
      color: "#fde68a",
      dot: "#fde68a",
    },
    Rejected: {
      bg: "rgba(255,126,126,0.18)",
      border: "rgba(255,126,126,0.3)",
      color: "#fca5a5",
      dot: "#fca5a5",
    },
  };
  const c = cfg[status] || cfg.Pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: "800",
        letterSpacing: "0.04em",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.color,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: c.dot,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "4px 11px",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "6px",
        fontSize: "13px",
        color: "#a7d7b2",
        fontWeight: "700",
      }}
    >
      <span style={{ fontSize: "14px" }}>{TYPE_ICONS[type] || "◆"}</span>
      {type}
    </span>
  );
}

function StatCard({ label, value, unit, accent = false }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "12px",
        background: accent
          ? "rgba(213,255,119,0.07)"
          : "rgba(255,255,255,0.04)",
        border: accent
          ? "1px solid rgba(213,255,119,0.18)"
          : "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: "800",
          letterSpacing: "0.07em",
          color: "rgba(213,229,220,0.55)",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
        <span
          style={{
            fontSize: "22px",
            fontWeight: "900",
            color: accent ? "#c6f06a" : "#f1f8f4",
          }}
        >
          {value ?? "—"}
        </span>
        {unit && (
          <span
            style={{
              fontSize: "13px",
              color: "rgba(213,229,220,0.5)",
              fontWeight: "700",
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <span
        style={{
          fontSize: "14px",
          color: "rgba(213,229,220,0.6)",
          fontWeight: "600",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: "14px", color: "#f1f8f4", fontWeight: "800" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function FundingProgressBar({ raised, target }) {
  const percentage =
    target > 0 ? Math.min(Math.max((raised / target) * 100, 0), 100) : 0;
  return (
    <div style={{ marginBottom: "4px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            color: "rgba(213,229,220,0.55)",
            fontWeight: "800",
            letterSpacing: "0.06em",
          }}
        >
          FUNDING PROGRESS
        </span>
        <span style={{ fontSize: "13px", color: "#d5ff77", fontWeight: "800" }}>
          {formatLKR(raised)} / {formatLKR(target)}
        </span>
      </div>
      <div
        style={{
          height: "8px",
          background: "rgba(255,255,255,0.07)",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "linear-gradient(90deg, #d5ff77, #95e56d)",
            borderRadius: "4px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "rgba(213,229,220,0.5)",
          marginTop: "6px",
        }}
      >
        {percentage.toFixed(0)}% funded
      </div>
    </div>
  );
}

export default function UserProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);

  useEffect(() => {
    if (id) fetchProject();
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      // const data = await projectApi.getOne(id);
      // setProject(data);
      const [projectData, summaryRes] = await Promise.all([
        projectApi.getOne(id),
        apiRequest(`/api/funding-records/summary/${id}`),
      ]);

      setProject(projectData);
      setFinanceSummary(summaryRes?.data || null);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || "Failed to load project details";

      if (
        errorMessage.includes("log in") ||
        errorMessage.includes("login") ||
        errorMessage.includes("Please log in")
      ) {
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
          message: "❌ Project not found",
          action: true,
          actionLabel: "Back to Projects",
          onAction: () => navigate(-1),
        });
      } else if (
        errorMessage.includes("Forbidden") ||
        errorMessage.includes("403")
      ) {
        setFeedback({
          type: "auth",
          message: "🔒 You don't have permission to view this project",
          action: true,
          actionLabel: "Back to Projects",
          onAction: () => navigate(-1),
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

  if (loading) {
    return (
      <div
        style={{
          ...odPageStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <style>{focusInputStyle}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.5 }}>
            {TYPE_ICONS.Solar}
          </div>
          <p
            style={{
              color: "rgba(231,243,237,0.6)",
              fontSize: "15px",
              fontWeight: "700",
            }}
          >
            Loading project details...
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={odPageStyle}>
        <style>{focusInputStyle}</style>
        <div
          style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}
        >
          <button
            className="upd-back-btn"
            onClick={() => navigate(-1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              color: "#a7e87a",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
              padding: 0,
              marginBottom: "28px",
            }}
          >
            ← Back
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
        .upd-back-btn:hover { color: #d5ff77 !important; }
        .upd-pay-btn:hover { background: rgba(213,255,119,0.2) !important; transform: translateY(-1px); }
        .upd-back-btn2:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-1px); }
      `}</style>

      <div
        style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}
      >
        {/* Back link */}
        <button
          className="upd-back-btn"
          onClick={() => navigate(`/my-projects/${project.communityId?._id}`)
}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "none",
            border: "none",
            color: "#a7e87a",
            fontSize: "14px",
            fontWeight: "800",
            cursor: "pointer",
            padding: 0,
            marginBottom: "28px",
            letterSpacing: "0.02em",
            transition: "color 0.2s ease",
          }}
        >
          ← Back to Projects
        </button>

        {/* Header card */}
        <div
          style={{
            borderRadius: "24px",
            background:
              "linear-gradient(135deg,rgba(14,37,31,0.97),rgba(19,56,44,0.92))",
            border: "1px solid rgba(191,255,116,0.14)",
            padding: "28px",
            marginBottom: "20px",
          }}
          className="fade-up fade-up-1"
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "32px" }}>
                  {TYPE_ICONS[project.type] || "◆"}
                </span>
                <h1
                  style={{
                    fontSize: "26px",
                    fontWeight: "900",
                    color: "#fff",
                    letterSpacing: "-0.02em",
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  {project.name}
                </h1>
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <StatusBadge status={project.status} />
                <TypeBadge type={project.type} />
                {project.communityId && (
                  <span
                    style={{
                      padding: "4px 11px",
                      background: "rgba(149,229,109,0.1)",
                      border: "1px solid rgba(149,229,109,0.22)",
                      borderRadius: "6px",
                      fontSize: "13px",
                      color: "#a7e87a",
                      fontWeight: "700",
                    }}
                  >
                    {project.communityId.name}
                  </span>
                )}
              </div>
            </div>
            <button
              className="upd-pay-btn"
              onClick={() => {
                if (!project?._id) return;
                navigate(`/finance-payments/project/${project._id}`);
              }}
              style={{
                padding: "11px 20px",
                background: "rgba(213,255,119,0.12)",
                border: "1px solid rgba(213,255,119,0.28)",
                borderRadius: "10px",
                color: "#c6f06a",
                fontWeight: "800",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Payment Details
            </button>
          </div>
        </div>

        {/* Stat grid */}
        <div
          style={{
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
            value={
              project.expectedMonthlyGeneration ||
              (project.capacityKW || 0) * 120
            }
            unit="kWh"
            accent
          />
          <StatCard
            label="Monthly Savings (LKR)"
            value={
              project.expectedMonthlySavings
                ? formatLKR(project.expectedMonthlySavings)
                : formatLKR(project.capacityKW * 120 * 25)
            }
            accent
          />
        </div>

        {/* Funding progress */}
        {project.cost > 0 && (
          <div
            style={{
              borderRadius: "16px",
              background: "rgba(8,27,21,0.74)",
              border: "1px solid rgba(191,255,116,0.1)",
              padding: "20px",
              marginBottom: "16px",
            }}
            className="fade-up fade-up-3"
          >
            <FundingProgressBar
              raised={financeSummary?.availableForInstallation || 0}
              target={financeSummary?.projectCost || project.cost || 0}
            />
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div
            style={{
              borderRadius: "16px",
              background: "rgba(8,27,21,0.74)",
              border: "1px solid rgba(191,255,116,0.1)",
              padding: "22px",
              marginBottom: "16px",
            }}
            className="fade-up fade-up-3"
          >
            <h3
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "rgba(213,229,220,0.5)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "0 0 12px 0",
              }}
            >
              Description
            </h3>
            <p
              style={{
                fontSize: "15px",
                color: "#d5e8da",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {project.description}
            </p>
          </div>
        )}

        {/* Project details */}
        <div
          style={{
            borderRadius: "16px",
            background: "rgba(8,27,21,0.74)",
            border: "1px solid rgba(191,255,116,0.1)",
            padding: "22px",
          }}
          className="fade-up fade-up-3"
        >
          <h3
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "rgba(213,229,220,0.5)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 8px 0",
            }}
          >
            Project Details
          </h3>
          <InfoRow label="Status" value={project.status} />
          <InfoRow label="Energy Type" value={project.type} />
          <InfoRow label="Project Category" value={project.projectType} />
          {project.communityId && (
            <InfoRow label="Community" value={project.communityId.name} />
          )}
          {/* <InfoRow
            label="Total Funding Raised (LKR)"
            value={formatLKR(project.totalFunding || 0)}
          /> */}
          <InfoRow
            label="Total Funding Raised (LKR)"
            value={formatLKR(financeSummary?.availableForInstallation || 0)}
          />

          {project.location && (
            <InfoRow label="Location" value={project.location} />
          )}
          {project.startDate && (
            <InfoRow
              label="Start Date"
              value={new Date(project.startDate).toLocaleDateString()}
            />
          )}
          {project.estimatedCompletionDate && (
            <InfoRow
              label="Est. Completion"
              value={new Date(
                project.estimatedCompletionDate,
              ).toLocaleDateString()}
            />
          )}
        </div>

        {/* Back button */}
        <div
          className="fade-up fade-up-4"
          style={{ marginTop: "24px", textAlign: "center" }}
        >
          <button
            className="upd-back-btn2"
            onClick={() => navigate(-1)}
            style={{
              padding: "13px 28px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(213,229,220,0.7)",
            }}
          >
            ← Back to Projects
          </button>
        </div>
      </div>
    </div>
  );
}
