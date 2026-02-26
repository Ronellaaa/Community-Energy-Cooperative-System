import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Btn, PageHeader, Card, StatusBadge, ErrorMsg, LoadingSpinner, MetricBox, ConfirmModal } from "../../components/feature-1/UI";

const API = "/api/projects";
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

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

export default function ProjectDetailPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const location     = useLocation();

  const [project, setProject]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");
  const [actionError, setActionError]     = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [confirm, setConfirm]             = useState(null);

  const justCreated = location.state?.justCreated;

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/${id}`, { headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to fetch project");
      setProject(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleApprove = async () => {
    try {
      setActionError(""); setActionLoading("approve");
      const res = await fetch(`${API}/${id}/approve`, { method: "PATCH", headers: getHeaders() });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      fetchProject();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(""); }
  };

  const handleActivate = async () => {
    try {
      setActionError(""); setActionLoading("activate");
      const res = await fetch(`${API}/${id}/activate`, { method: "PATCH", headers: getHeaders() });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      fetchProject();
    } catch (e) { setActionError(e.message); }
    finally { setActionLoading(""); }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/${id}`, { method: "DELETE", headers: getHeaders() });
      if (!res.ok) throw new Error("Failed to delete");
      navigate("/projects");
    } catch (e) { setActionError(e.message); setConfirm(null); }
  };

  if (loading)  return <div style={{ padding: 40 }}><LoadingSpinner text="Loading project..." /></div>;
  if (error)    return <div style={{ padding: 40 }}><ErrorMsg message={error} /></div>;
  if (!project) return null;

  const membersCount      = project.assignedMembers?.length || 0;
  const fundingPct        = project.cost > 0 ? Math.min(100, Math.round((project.totalFunding / project.cost) * 100)) : 0;
  const fundingSufficient = project.totalFunding >= project.cost;
  const canApprove        = project.status === "Draft" && project.cost > 0 && membersCount >= 2;
  const canActivate       = project.status === "Approved" && fundingSufficient;

  const approvalBlocks = [
    ...(!project.cost || project.cost <= 0  ? ["Project cost not defined"] : []),
    ...(membersCount < 2 ? [`Min 2 members required (currently ${membersCount})`] : []),
  ];
  const activationBlocks = [
    ...(project.status !== "Approved" ? ["Project must be Approved first"] : []),
    ...(!fundingSufficient ? [`Funding: ${formatLKR(project.totalFunding)} / ${formatLKR(project.cost)} (${fundingPct}%)`] : []),
  ];

  return (
    <div style={{ padding: "32px 36px", maxWidth: 900, margin: "0 auto" }}>
      <PageHeader
        breadcrumb={`PROJECT / ${project.name?.toUpperCase()}`}
        title={<>{getTypeIcon(project.type)} <span style={{ color: "var(--accent)" }}>{project.name}</span></>}
        subtitle={`${project.type} · Created ${new Date(project.createdAt).toLocaleDateString()}`}
        action={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StatusBadge status={project.status} />
            <Btn variant="ghost" onClick={() => navigate("/projects")}>← Back</Btn>
          </div>
        }
      />

      {justCreated && (
        <div style={{ background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)", borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 13, color: "var(--accent)", display: "flex", gap: 8, alignItems: "center" }}>
          ✅ Project created! Assign members, then Approve → Activate.
        </div>
      )}
      {actionError && <div style={{ marginBottom: 16 }}><ErrorMsg message={actionError} /></div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Project Metrics</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
              {[
                { label: "Capacity",        value: `${project.capacityKW} kW`,                                color: "var(--text)" },
                { label: "Total Cost",      value: formatLKR(project.cost),                                    color: "var(--accent2)" },
                { label: "Total Funding",   value: formatLKR(project.totalFunding),                            color: fundingSufficient ? "var(--accent)" : "var(--danger)" },
                { label: "Monthly Gen.",    value: `${project.expectedMonthlyGeneration?.toLocaleString()} kWh`,color: "var(--accent3)" },
                { label: "Monthly Savings", value: formatLKR(project.expectedMonthlySavings),                  color: "var(--accent)" },
                { label: "Members",         value: membersCount,                                                color: membersCount >= 2 ? "var(--accent)" : "var(--danger)" },
              ].map((m, i) => (
                <div key={i} style={{ background: "var(--surface)", padding: "14px 10px" }}>
                  <MetricBox {...m} />
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>
                <span>Funding Progress</span>
                <span style={{ color: fundingSufficient ? "var(--accent)" : "var(--accent2)" }}>
                  {formatLKR(project.totalFunding)} / {formatLKR(project.cost)} ({fundingPct}%)
                </span>
              </div>
              <div style={{ height: 7, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 4, width: `${fundingPct}%`, background: fundingSufficient ? "linear-gradient(90deg,#00b87a,var(--accent))" : "linear-gradient(90deg,#d47a1a,var(--accent2))", transition: "width 0.6s" }} />
              </div>
            </div>
          </Card>

          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>Assigned Members</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Managed by your team's member module</div>
              </div>
              <span style={{ background: membersCount >= 2 ? "rgba(0,229,160,0.1)" : "rgba(255,77,109,0.1)", color: membersCount >= 2 ? "var(--accent)" : "var(--danger)", border: `1px solid ${membersCount >= 2 ? "rgba(0,229,160,0.2)" : "rgba(255,77,109,0.2)"}`, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontFamily: "var(--font-mono)" }}>
                {membersCount} / min 2
              </span>
            </div>
            {membersCount === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: 13 }}>No members assigned yet.</div>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.assignedMembers.map((m, i) => (
                  <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                    {typeof m === "object" ? m.name || m._id : m}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ background: "var(--surface)" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Admin Actions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Btn variant="ghost" onClick={() => navigate(`/projects/${id}/edit`)} style={{ justifyContent: "center" }}>✏️ Edit Project</Btn>

              {project.status === "Draft" && (
                <div>
                  <Btn variant="blue" disabled={!canApprove || actionLoading === "approve"} onClick={handleApprove} style={{ justifyContent: "center", width: "100%" }}>
                    {actionLoading === "approve" ? "⏳ Approving..." : "✔ Approve Project"}
                  </Btn>
                  {!canApprove && approvalBlocks.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--danger)", lineHeight: 1.7 }}>
                      {approvalBlocks.map((b, i) => <div key={i}>⚠ {b}</div>)}
                    </div>
                  )}
                </div>
              )}

              {project.status === "Approved" && (
                <div>
                  <Btn disabled={!canActivate || actionLoading === "activate"} onClick={handleActivate} style={{ justifyContent: "center", width: "100%" }}>
                    {actionLoading === "activate" ? "⏳ Activating..." : "⚡ Activate Project"}
                  </Btn>
                  {!canActivate && activationBlocks.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--danger)", lineHeight: 1.7 }}>
                      {activationBlocks.map((b, i) => <div key={i}>⚠ {b}</div>)}
                    </div>
                  )}
                </div>
              )}

              {project.status === "Active" && (
                <div style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 8, padding: "12px 14px", textAlign: "center", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
                  ● Project is ACTIVE
                </div>
              )}

              <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
              <Btn variant="danger" onClick={() => setConfirm(true)} style={{ justifyContent: "center" }}>🗑 Delete Project</Btn>
            </div>
          </Card>

          <Card style={{ background: "var(--surface)" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Status Timeline</div>
            {[
              { s: "Draft",    done: true,                                                         desc: "Project created" },
              { s: "Approved", done: project.status === "Approved" || project.status === "Active", desc: "Cost + 2+ members" },
              { s: "Active",   done: project.status === "Active",                                  desc: "Funding ≥ cost" },
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 2 ? 12 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, background: step.done ? "rgba(0,229,160,0.15)" : "var(--card)", border: `1.5px solid ${step.done ? "var(--accent)" : "var(--border)"}`, color: step.done ? "var(--accent)" : "var(--muted)" }}>
                    {step.done ? "✓" : i + 1}
                  </div>
                  {i < 2 && <div style={{ width: 1, height: 12, background: step.done ? "var(--accent)" : "var(--border)", margin: "2px 0", opacity: 0.4 }} />}
                </div>
                <div style={{ paddingTop: 3 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: step.done ? "var(--accent)" : "var(--muted)", fontFamily: "var(--font-display)" }}>{step.s}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card style={{ background: "var(--surface)" }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Timestamps</div>
            {[
              { label: "Created", value: new Date(project.createdAt).toLocaleString() },
              { label: "Updated", value: new Date(project.updatedAt).toLocaleString() },
            ].map((t, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginBottom: i < 1 ? 8 : 0 }}>
                <span style={{ color: "var(--muted)" }}>{t.label}</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{t.value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        title="Delete Project"
        message={`Delete "${project.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
