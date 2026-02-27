import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Btn, StatusBadge, PageHeader, Card, ErrorMsg, LoadingSpinner, MetricBox, ConfirmModal } from "../../components/feature-1/UI";

const API = "/api/projects"; 
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Helpers
const formatLKR = (amount) => {
  const n = parseFloat(amount) || 0;
  if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `LKR ${(n / 1_000).toFixed(0)}k`;
  return `LKR ${n}`;
};

const getTypeIcon = (type) => {
  if (type === "Solar") return "☀️";
  if (type === "Wind")  return "🌬️";
  if (type === "Hydro") return "💧";
  return "⚡";
};

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [actionError, setActionError]   = useState("");
  const [filter, setFilter]             = useState("All");
  const [confirm, setConfirm]           = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch(API, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch projects");
      setProjects(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleApprove = async (project) => {
  try {
    setActionError("");
    if ((project.assignedMembers?.length || 0) < 5) {
      setActionError("Cannot approve: assigned members must be ≥ 5");
      return;
    }
    if (!project.cost || project.cost <= 0) {
      setActionError("Cannot approve: project cost not defined");
      return;
    }

    const res = await fetch(`${API}/${project._id}/approve`, { method: "PATCH", headers: getHeaders() });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    fetchProjects();
  } catch (e) { setActionError(e.message); }
};

const handleActivate = async (project) => {
  try {
    setActionError("");
    if (project.totalFunding < project.cost) {
      setActionError("Cannot activate: total funding less than project cost");
      return;
    }
    if (project.status !== "Approved") {
      setActionError("Cannot activate: project must be approved first");
      return;
    }

    const res = await fetch(`${API}/${project._id}/activate`, { method: "PATCH", headers: getHeaders() });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    fetchProjects();
  } catch (e) { setActionError(e.message); }
};

const handleDelete = async () => {
  try {
    const res = await fetch(`${API}/${confirm.id}`, { method: "DELETE", headers: getHeaders() });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
    setConfirm(null);
    fetchProjects();
  } catch (e) { setActionError(e.message); setConfirm(null); }
};
  const filtered     = filter === "All" ? projects : projects.filter(p => p.status === filter);
  const totalCapacity = projects.reduce((s, p) => s + (p.capacityKW || 0), 0);
  const totalSavings  = projects.reduce((s, p) => s + (p.expectedMonthlySavings || 0), 0);
  const activeCount   = projects.filter(p => p.status === "Active").length;

  return (
    <div style={{ padding: "32px 36px", maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader
        breadcrumb="ENERGY PROJECTS"
        title={<>Energy <span style={{ color: "var(--accent)" }}>Projects</span></>}
        subtitle="Create, manage and track community energy projects"
        action={
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={fetchProjects}>↻ Refresh</Btn>
            <Btn onClick={() => navigate("/projects/create")}>＋ New Project</Btn>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[ 
          { label: "Total Projects",       value: projects.length,        icon: "⚡", top: "var(--accent)" },
          { label: "Active Projects",      value: activeCount,           icon: "🟢", top: "var(--accent)" },
          { label: "Total Capacity",       value: `${totalCapacity} kW`, icon: "🔆", top: "var(--accent3)" },
          { label: "Est. Monthly Savings", value: formatLKR(totalSavings),icon: "💡", top: "var(--accent2)" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.top }} />
            <div style={{ position: "absolute", top: 14, right: 14, fontSize: 22, opacity: 0.25 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {actionError && <div style={{ marginBottom: 16 }}><ErrorMsg message={actionError} /></div>}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 22 }}>
        {["All", "Pending", "Approved", "Active"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "7px 18px", borderRadius: 7, fontSize: 13, cursor: "pointer", fontWeight: 500,
            border: filter === f ? "1px solid rgba(0,229,160,0.25)" : "1px solid transparent",
            background: filter === f ? "var(--surface)" : "transparent",
            color: filter === f ? "var(--accent)" : "var(--muted)", transition: "all 0.2s",
          }}>
            {f} ({f === "All" ? projects.length : projects.filter(p => p.status === f).length})
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner text="Fetching projects..." />}
      {!loading && error && <ErrorMsg message={error} />}

      {!loading && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
          {filtered.length === 0 && (
            <div style={{ gridColumn: "span 2", textAlign: "center", padding: 60, color: "var(--muted)", fontSize: 14 }}>
              No projects found.{" "}
              <span style={{ color: "var(--accent)", cursor: "pointer" }} onClick={() => navigate("/projects/create")}>
                Create one →
              </span>
            </div>
          )}
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              formatLKR={formatLKR}
              getTypeIcon={getTypeIcon}
              onView={()     => navigate(`/projects/${project._id}`)}
              onEdit={()     => navigate(`/projects/${project._id}/edit`)}
              onApprove={()  => handleApprove(project)}
              onActivate={() => handleActivate(project)}
              onDelete={()   => setConfirm({ id: project._id, name: project.name })}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!confirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${confirm?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

function ProjectCard({ project, formatLKR, getTypeIcon, onView, onEdit, onApprove, onActivate, onDelete }) {
  const membersCount = project.assignedMembers?.length || 0;
  const fundingPct   = project.cost > 0 ? Math.min(100, Math.round((project.totalFunding / project.cost) * 100)) : 0;

  return (
    <Card hover>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: "var(--surface)", border: "1px solid var(--border)" }}>
            {getTypeIcon(project.type)}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700 }}>{project.name}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{project.type}</div>
          </div>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 14 }}>
        {[
          { label: "Capacity",   value: `${project.capacityKW} kW`,              color: "var(--text)" },
          { label: "Cost",       value: formatLKR(project.cost),                  color: "var(--accent2)" },
          { label: "Savings/mo", value: formatLKR(project.expectedMonthlySavings),color: "var(--accent)" },
        ].map((m, i) => (
          <div key={i} style={{ background: "var(--surface)", padding: "12px 10px" }}>
            <MetricBox {...m} />
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
        <span>⚡ <span style={{ color: "var(--accent3)", fontFamily: "var(--font-mono)" }}>{project.expectedMonthlyGeneration?.toLocaleString()} kWh</span>/mo</span>
        <span>👥 <span style={{ color: membersCount >= 10 ? "var(--accent)" : "var(--danger)", fontWeight: 600 }}>{membersCount}</span> members
          {membersCount < 10 && <span style={{ color: "var(--danger)", fontSize: 10, marginLeft: 4 }}>(min 10)</span>}
        </span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 5 }}>
          <span>Funding</span>
          <span style={{ color: fundingPct >= 100 ? "var(--accent)" : "var(--accent2)" }}>{fundingPct}%</span>
        </div>
        <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 3, width: `${fundingPct}%`, transition: "width 0.6s", background: fundingPct >= 100 ? "linear-gradient(90deg,#00b87a,var(--accent))" : "linear-gradient(90deg,#d47a1a,var(--accent2))" }} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <Btn variant="ghost" onClick={onView}   style={{ fontSize: 12, padding: "7px 12px" }}>View</Btn>
        <Btn variant="ghost" onClick={onEdit}   style={{ fontSize: 12, padding: "7px 12px" }}>Edit</Btn>
        {project.status === "Draft"    && <Btn variant="blue" onClick={onApprove}  style={{ fontSize: 12, padding: "7px 12px"}}>✔ Approve</Btn>}
        {project.status === "Approved" && <Btn onClick={onActivate} style={{ fontSize: 12, padding: "7px 12px"}}>⚡ Activate</Btn>}
        {project.status === "Active"   && <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 4 }}>● RUNNING</span>}
        <Btn variant="danger" onClick={onDelete} style={{ fontSize: 12, padding: "7px 12px", marginLeft: "auto"}}>Delete</Btn>
      </div>
    </Card>
  );
}