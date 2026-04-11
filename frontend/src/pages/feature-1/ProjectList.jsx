// src/components/projects/ProjectList.jsx
import { useEffect, useState } from "react";
import { projectApi } from "../../api";
import { formatLKR } from "../../utils/feature-1/formatCurrency";
import { Link, useNavigate } from "react-router-dom";
import { focusInputStyle } from "../../components/feature-1/UI";
import FeedbackMessage from "../../components/feature-1/FeedbackMessage";
import Navbar from "../../components/Navbar";

const odPageStyle = {
  minHeight: "100vh",
  background: `radial-gradient(circle at top left, rgba(191,255,116,0.18), transparent 26%),
               radial-gradient(circle at 85% 12%, rgba(42,122,113,0.18), transparent 24%),
               linear-gradient(180deg, #081713 0%, #102720 42%, #122017 100%)`,
  fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
};

const calculateMetrics = (capacityKW) => {
  const monthlyGeneration = capacityKW * 120;
  const monthlySavings = monthlyGeneration * 25;
  return { monthlyGeneration, monthlySavings };
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
      padding: "4px 12px", borderRadius: "999px", fontSize: "12px",
      fontWeight: "800", letterSpacing: "0.04em",
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function FundingProgressBar({ raised, target }) {
  const percentage = target > 0 ? Math.min(Math.max((raised / target) * 100, 0), 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
        <span style={{ fontSize: "11px", color: "rgba(213,229,220,0.55)", fontWeight: "800", letterSpacing: "0.06em" }}>
          FUNDING PROGRESS
        </span>
        <span style={{ fontSize: "12px", color: "#d5ff77", fontWeight: "800" }}>
          {formatLKR(raised)} / {formatLKR(target)}
        </span>
      </div>
      <div style={{ height: "6px", background: "rgba(255,255,255,0.07)", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{
          width: `${percentage}%`, height: "100%",
          background: "linear-gradient(90deg, #d5ff77, #95e56d)",
          borderRadius: "3px", transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ fontSize: "11px", color: "rgba(213,229,220,0.5)", marginTop: "4px" }}>
        {percentage.toFixed(0)}% funded
      </div>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", borderRadius: "10px",
      padding: "10px 12px", flex: 1, textAlign: "center",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ fontSize: "10px", color: "rgba(213,229,220,0.55)", fontWeight: "800", letterSpacing: "0.07em", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "900", color: "#f1f8f4" }}>{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      borderRadius: "20px", background: "rgba(8,27,21,0.74)",
      border: "1px solid rgba(191,255,116,0.1)", padding: "60px 40px", textAlign: "center",
    }}>
      <div style={{ fontSize: "48px", marginBottom: "16px", opacity: 0.4 }}>☀</div>
      <p style={{ color: "rgba(231,243,237,0.7)", fontSize: "16px", fontWeight: "800", margin: "0 0 6px" }}>No projects yet</p>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px", margin: 0 }}>Create your first energy project to get started.</p>
    </div>
  );
}

const FILTERS = ["All", "Pending", "Approved", "Rejected", "Active"];

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await projectApi.getAll();
      setProjects(data);
    } catch (err) {
      console.error("Fetch error:", err);
      const errorMessage = err.message || "Failed to load projects";
      
      if (errorMessage.includes("log in") || errorMessage.includes("login")) {
        setFeedback({
          type: "auth",
          message: "🔐 Please log in first to view projects",
          action: true,
          actionLabel: "Go to Login",
          onAction: () => navigate("/login"),
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

  const filtered = filter === "All" ? projects : projects.filter((p) => p.status === filter);
  const countFor = (s) => s === "All" ? projects.length : projects.filter((p) => p.status === s).length;

  return (
    <>
      {/* Navbar added here - this fixes the "value is not used" warning */}
      <Navbar />
      
      <div style={odPageStyle}>
        <style>{focusInputStyle}</style>
        <style>{`
          .pl-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
          .pl-card:hover {
            transform: translateY(-4px);
            border-color: rgba(191,255,116,0.25) !important;
            background: rgba(8,27,21,0.9) !important;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
          }
          .pl-pill { transition: all 0.2s ease; }
          .pl-pill:hover { transform: translateY(-1px); }
          .pl-stat-card { transition: all 0.2s ease; cursor: pointer; }
          .pl-stat-card:hover { transform: translateY(-2px); }
          .pl-view-btn:hover { background: rgba(213,255,119,0.18) !important; transform: translateY(-1px); }
          .pl-edit-btn:hover { background: rgba(251,191,36,0.18) !important; transform: translateY(-1px); }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .card-appear { animation: slideUp 0.4s ease forwards; }
        `}</style>

        {/* Hero */}
        <div style={{ padding: "26px 16px 10px" }}>
          <div style={{
            maxWidth: "1000px", margin: "0 auto",
            borderRadius: "32px",
            background: "linear-gradient(135deg, rgba(14,37,31,0.97), rgba(19,56,44,0.92))",
            border: "1px solid rgba(191,255,116,0.14)",
            padding: "28px",
            display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "18px",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{
                display: "inline-flex", alignItems: "center",
                padding: "6px 14px", borderRadius: "999px",
                background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)",
                fontWeight: "900", letterSpacing: "1.6px", fontSize: "12px",
                color: "rgba(238,246,240,0.88)", marginBottom: "14px",
              }}>
                Project Management
              </div>
              <h1 style={{ fontSize: "clamp(1.8rem,3.2vw,2.8rem)", fontWeight: "900", color: "#fff", lineHeight: 1.05, margin: "0 0 10px", maxWidth: "14ch" }}>
                Energy Projects
              </h1>
              <p style={{ margin: 0, color: "rgba(231,243,237,0.78)", fontSize: "15px", lineHeight: 1.6, maxWidth: "480px" }}>
                Manage, approve and monitor all community renewable energy projects from one dashboard.
              </p>
            </div>
            <div style={{
              borderRadius: "24px", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)", padding: "16px",
              display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px",
              position: "relative", zIndex: 1,
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
                {[
                  { label: "Total projects", value: projects.length },
                  { label: "Active",  value: countFor("Active") },
                  { label: "Pending", value: countFor("Pending") },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    borderRadius: "14px", padding: "12px", minHeight: "80px",
                    background: "linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))",
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}>
                    <span style={{ color: "rgba(231,243,237,0.7)", fontSize: "12px", fontWeight: "700" }}>{label}</span>
                    <strong style={{ color: "#fff", fontSize: "24px", fontWeight: "900", lineHeight: 1 }}>{value}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Link
                  to="/projects/create/:communityId"
                  style={{
                    flex: 1, textAlign: "center",
                    padding: "12px 18px", borderRadius: "999px",
                    background: "linear-gradient(135deg, #d5ff77, #95e56d)",
                    color: "#122017", fontWeight: "900", fontSize: "14px",
                    textDecoration: "none", letterSpacing: "0.02em",
                  }}
                >
                  + New Project
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "16px 16px 48px" }}>

          {/* Feedback Message */}
          {feedback && (
            <FeedbackMessage
              {...feedback}
              onDismiss={() => setFeedback(null)}
            />
          )}

          {/* Loading state */}
          {loading && (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              color: "rgba(231,243,237,0.6)",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "12px", opacity: 0.5 }}>☀</div>
              <p style={{ fontSize: "15px", fontWeight: "700" }}>Loading projects...</p>
            </div>
          )}

          {/* Content */}
          {!loading && !feedback && (
            <>
              {/* Status stat cards */}
              {projects.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "12px", margin: "16px 0 20px" }}
                  className="fade-up fade-up-1">
                  {[
                    { status: "Pending",  bg: "rgba(253,230,138,0.14)", border: "rgba(253,230,138,0.3)",  color: "#fde68a" },
                    { status: "Approved", bg: "rgba(96,165,250,0.14)",  border: "rgba(96,165,250,0.28)",  color: "#93c5fd" },
                    { status: "Active",   bg: "rgba(149,229,109,0.14)", border: "rgba(149,229,109,0.3)",  color: "#a7e87a" },
                    { status: "Rejected", bg: "rgba(255,126,126,0.14)", border: "rgba(255,126,126,0.28)", color: "#fca5a5" },
                  ].map(({ status, bg, border, color }) => (
                    <div
                      key={status}
                      className="pl-stat-card"
                      onClick={() => setFilter(filter === status ? "All" : status)}
                      style={{
                        padding: "16px 20px", borderRadius: "16px", textAlign: "center",
                        background: filter === status ? bg : "rgba(255,255,255,0.04)",
                        border: filter === status ? `1px solid ${border}` : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div style={{ fontSize: "11px", color, fontWeight: "800", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: "8px" }}>
                        {status}
                      </div>
                      <div style={{ fontSize: "28px", fontWeight: "900", color: "#f1f8f4" }}>{countFor(status)}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Filter pills */}
              {projects.length > 0 && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }} className="fade-up fade-up-2">
                  {FILTERS.map((f) => {
                    const active = filter === f;
                    return (
                      <button
                        key={f}
                        className="pl-pill"
                        onClick={() => setFilter(f)}
                        style={{
                          padding: "9px 18px", borderRadius: "999px", fontSize: "14px", fontWeight: "800",
                          cursor: "pointer",
                          background: active ? "linear-gradient(135deg,#d5ff77,#95e56d)" : "rgba(255,255,255,0.06)",
                          border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
                          color: active ? "#102018" : "#f2f8f5",
                          boxShadow: active ? "0 8px 20px rgba(149,229,109,0.2)" : "none",
                          display: "flex", alignItems: "center", gap: "8px",
                        }}
                      >
                        {f}
                        <span style={{
                          fontSize: "12px", padding: "2px 8px", borderRadius: "12px",
                          background: active ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.1)",
                          color: active ? "#102018" : "#f2f8f5",
                        }}>{countFor(f)}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Section label */}
              <div style={{ fontSize: "13px", fontWeight: "700", letterSpacing: "0.06em", color: "rgba(213,229,220,0.5)", textTransform: "uppercase", marginBottom: "16px" }}>
                {filtered.length} project{filtered.length !== 1 ? "s" : ""} shown
              </div>

              {/* Cards grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "20px" }}>
                {filtered.length === 0 ? (
                  <div style={{ gridColumn: "1 / -1" }}><EmptyState /></div>
                ) : (
                  filtered.map((p, i) => {
                    const { monthlySavings } = calculateMetrics(p.capacityKW);
                    return (
                      <div
                        key={p._id}
                        className="pl-card card-appear"
                        style={{
                          borderRadius: "20px", background: "rgba(8,27,21,0.74)",
                          border: "1px solid rgba(191,255,116,0.1)", overflow: "hidden",
                          animationDelay: `${i * 0.05}s`, cursor: "pointer",
                        }}
                        onClick={() => navigate(`/projects/${p._id}`)}
                      >
                        {/* Top */}
                        <div style={{
                          display: "flex", alignItems: "center", gap: "12px", padding: "18px",
                          background: "linear-gradient(135deg,rgba(213,255,119,0.18),rgba(255,255,255,0.03))",
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}>
                          <span style={{ fontSize: "28px", lineHeight: 1 }}>☀</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "17px", fontWeight: "900", color: "#fff", lineHeight: 1.3 }}>
                              {p.name.length > 35 ? p.name.slice(0, 35) + "…" : p.name}
                            </div>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>

                        {/* Body */}
                        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                          <div style={{ display: "flex", gap: "10px" }}>
                            <StatChip label="CAPACITY" value={`${p.capacityKW} kW`} />
                            <StatChip label="SAVINGS/MO" value={formatLKR(monthlySavings)} />
                            <StatChip label="TOTAL COST" value={formatLKR(p.cost || 0)} />
                          </div>

                          {p.communityId && (
                            <div style={{
                              display: "flex", alignItems: "center", gap: "6px",
                              padding: "8px 12px",
                              background: "rgba(149,229,109,0.07)",
                              border: "1px solid rgba(149,229,109,0.14)",
                              borderRadius: "10px", fontSize: "13px", color: "#a7e87a", fontWeight: "600",
                            }}>
                              <span style={{ fontSize: "15px" }}>🏘️</span>
                              {p.communityId.name}
                            </div>
                          )}

                          <FundingProgressBar raised={p.totalFunding || 0} target={p.cost || 0} />

                          <div
                            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", gap: "10px" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="pl-view-btn"
                              onClick={() => navigate(`/projects/${p._id}`)}
                              style={{
                                flex: 1, padding: "11px", borderRadius: "10px",
                                fontSize: "14px", fontWeight: "800", cursor: "pointer",
                                background: "rgba(213,255,119,0.1)",
                                border: "1px solid rgba(213,255,119,0.25)",
                                color: "#c6f06a", transition: "all 0.2s ease",
                              }}
                            >
                              View Details
                            </button>
                            <button
                              className="pl-edit-btn"
                              onClick={() => navigate(`/projects/${p._id}/edit`)}
                              style={{
                                flex: 1, padding: "11px", borderRadius: "10px",
                                fontSize: "14px", fontWeight: "800", cursor: "pointer",
                                background: "rgba(251,191,36,0.08)",
                                border: "1px solid rgba(251,191,36,0.22)",
                                color: "#fcd34d", transition: "all 0.2s ease",
                              }}
                            >
                              Edit Project
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Empty state when no projects */}
          {!loading && !feedback && filtered.length === 0 && projects.length === 0 && (
            <EmptyState />
          )}
        </div>
      </div>
    </>
  );
}