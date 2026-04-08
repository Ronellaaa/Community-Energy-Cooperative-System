
import { useEffect, useState } from "react";
import { projectApi } from "../../api";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
import { Link, useNavigate } from "react-router-dom";
import {
  pageWrapperStyle,
  glassPanelStyle,
  PageHeader,
  focusInputStyle,
} from "../../components/feature-1/UI";

// Calculate metrics helper
const calculateMetrics = (capacityKW) => {
  const monthlyGeneration = capacityKW * 120;
  const monthlySavings = monthlyGeneration * 25;
  return { monthlyGeneration, monthlySavings };
};

function LightStatusBadge({ status }) {
  const statusConfig = {
    Pending: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", color: "#fbbf24", dot: "#fbbf24" },
    Approved: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#4ade80", dot: "#4ade80" },
    Active: { bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.3)", color: "#38bdf8", dot: "#38bdf8" },
    Rejected: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", color: "#f87171", dot: "#f87171" },
  };

  const config = statusConfig[status] || statusConfig.Pending;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "600",
        letterSpacing: "0.04em",
        background: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: config.dot,
          display: "inline-block",
        }}
      />
      {status}
    </span>
  );
}

function FundingProgressBar({ raised, target }) {
  const percentage = Math.min(Math.max((raised / target) * 100, 0), 100);
  
  return (
    <div style={{ marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "10px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.06em" }}>
          FUNDING PROGRESS
        </span>
        <span style={{ fontSize: "11px", color: "#4ade80", fontWeight: "700" }}>
          {formatLKR(raised)} / {formatLKR(target)}
        </span>
      </div>
      <div
        style={{
          height: "6px",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "3px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "linear-gradient(90deg, #22c55e, #16a34a)",
            borderRadius: "3px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <div style={{ fontSize: "10px", color: "#8aad92", marginTop: "4px" }}>
        {percentage.toFixed(0)}% funded
      </div>
    </div>
  );
}

function StatBadge({ label, value, unit }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        borderRadius: "8px",
        padding: "8px 12px",
        textAlign: "center",
        flex: 1,
        transition: "all 0.2s ease",
      }}
      className="stat-badge"
    >
      <div style={{ fontSize: "9px", color: "#6abf7b", fontWeight: "600", letterSpacing: "0.07em", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#e8f5e9" }}>
        {value} {unit && <span style={{ fontSize: "10px", color: "#6abf7b" }}>{unit}</span>}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        ...glassPanelStyle,
        padding: "60px 40px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.4 }}>☀</div>
      <p style={{ color: "#6abf7b", fontSize: "15px", fontWeight: "600", margin: "0 0 6px" }}>No projects yet</p>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "13px", margin: 0 }}>
        Create your first energy project to get started.
      </p>
    </div>
  );
}

function FilterTab({ label, active, onClick, count }) {
  const statusColors = {
    All: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", text: "#4ade80" },
    Pending: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", text: "#fbbf24" },
    Approved: { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.35)", text: "#4ade80" },
    Rejected: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", text: "#f87171" },
    Active: { bg: "rgba(14,165,233,0.12)", border: "rgba(14,165,233,0.35)", text: "#38bdf8" },
  };

  const colors = statusColors[label] || statusColors.All;

  return (
    <button
      onClick={onClick}
      className="filter-tab"
      style={{
        padding: "8px 16px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
        background: active ? colors.bg : "rgba(255,255,255,0.04)",
        border: active ? `1px solid ${colors.border}` : "1px solid rgba(255,255,255,0.08)",
        color: active ? colors.text : "#8aad92",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.transform = "translateY(0)";
        }
      }}
    >
      {label}
      {count != null && (
        <span
          style={{
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "12px",
            background: active ? colors.bg : "rgba(255,255,255,0.08)",
            color: active ? colors.text : "#8aad92",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

const FILTERS = ["All", "Pending", "Approved", "Rejected", "Active"];

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = filter === "All"
    ? projects
    : projects.filter((p) => p.status === filter);

  const countFor = (s) => s === "All" ? projects.length : projects.filter((p) => p.status === s).length;

  return (
    <div style={pageWrapperStyle}>
      <style>{focusInputStyle}</style>
      <style>{`
        .project-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .project-card:hover {
          transform: translateY(-4px);
          border-color: rgba(34, 197, 94, 0.3) !important;
          background: rgba(255, 255, 255, 0.07) !important;
          box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.3);
        }
        .stat-badge:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .card-appear {
          animation: slideUp 0.4s ease forwards;
        }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>

        <PageHeader
          title="Energy Projects"
          subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""} in your portfolio`}
          action={
            <Link
              to="/projects/create"
              className="create-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "11px 20px",
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none",
                borderRadius: "10px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "13px",
                textDecoration: "none",
                letterSpacing: "0.03em",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(34,197,94,0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              + New Project
            </Link>
          }
        />

        {/* Stats row - Light colored status cards */}
        {projects.length > 0 && (
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}
            className="fade-up fade-up-1"
          >
            {[
              { status: "Pending", color: "#fbbf24", bgColor: "rgba(245,158,11,0.12)", borderColor: "rgba(245,158,11,0.3)" },
              { status: "Approved", color: "#4ade80", bgColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" },
              { status: "Active", color: "#38bdf8", bgColor: "rgba(14,165,233,0.12)", borderColor: "rgba(14,165,233,0.3)" },
              { status: "Rejected", color: "#f87171", bgColor: "rgba(239,68,68,0.12)", borderColor: "rgba(239,68,68,0.3)" },
            ].map(({ status, color, bgColor, borderColor }) => {
              const c = countFor(status);
              return (
                <div
                  key={status}
                  onClick={() => setFilter(filter === status ? "All" : status)}
                  className="stat-card"
                  style={{
                    padding: "16px 20px",
                    background: filter === status ? bgColor : "rgba(255,255,255,0.04)",
                    border: filter === status ? `1px solid ${borderColor}` : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = bgColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    if (filter !== status) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }
                  }}
                >
                  <div style={{ fontSize: "11px", color: color, fontWeight: "700", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                    {status}
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "800", color: "#e8f5e9" }}>{c}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter tabs */}
        {projects.length > 0 && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }} className="fade-up fade-up-2">
            {FILTERS.map((f) => (
              <FilterTab
                key={f}
                label={f}
                active={filter === f}
                onClick={() => setFilter(f)}
                count={countFor(f)}
              />
            ))}
          </div>
        )}

        {/* 2 Cards per row Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState />
            </div>
          ) : (
            filtered.map((p, i) => {
              const { monthlySavings } = calculateMetrics(p.capacityKW);
              
              return (
                <div
                  key={p._id}
                  className="project-card card-appear"
                  style={{
                    ...glassPanelStyle,
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    animationDelay: `${i * 0.05}s`,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/projects/${p._id}`)}
                >
                  {/* Header: Icon + Name + Status */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <span style={{ fontSize: "32px" }}>☀</span>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#e8f5e9", margin: 0, lineHeight: 1.3 }}>
                          {p.name.length > 35 ? p.name.slice(0, 35) + "..." : p.name}
                        </h3>
                      </div>
                    </div>
                    <LightStatusBadge status={p.status} />
                  </div>

                  {/* Stats Grid */}
                 <div style={{ display: "flex", gap: "12px", marginTop: "4px" }}>
                    <StatBadge label="CAPACITY" value={p.capacityKW} unit="kW" />

                    <StatBadge label="MONTHLY SAVINGS" value={formatLKR(monthlySavings)}/>
                    <StatBadge label="TOTAL COST" value={formatLKR(p.cost || 0)}/>
                 </div>

                  {/* Community info */}
                  {p.communityId && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 12px",
                        background: "rgba(14,165,233,0.08)",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "#7dd3fc",
                      }}
                    >
                      <span>🏘️</span>
                      <span style={{ fontWeight: "500" }}>{p.communityId.name}</span>
                    </div>
                  )}

                  {/* Funding Progress Bar */}
                  <FundingProgressBar raised={p.totalFunding || 0} target={p.cost || 0} />

                  {/* Simple Action Buttons - Only View and Edit */}
                  <div 
                    style={{ 
                      display: "flex", 
                      gap: "10px", 
                      marginTop: "8px",
                      paddingTop: "12px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => navigate(`/projects/${p._id}`)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.3)",
                        color: "#4ade80",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(34,197,94,0.2)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(34,197,94,0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      View Details
                    </button>
                    
                    <button
                      onClick={() => navigate(`/projects/${p._id}/edit`)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        background: "rgba(251,191,36,0.08)",
                        border: "1px solid rgba(251,191,36,0.2)",
                        color: "#fcd34d",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(251,191,36,0.15)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(251,191,36,0.08)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Edit Project
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}