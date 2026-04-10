import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/feature-2/officerDashboard.css";

export default function OfficerDashboard() {
  return (
    <div className="od-page">
      <Navbar />
      {/* ✅ NEW: Communities section at the top */}
      <OfficerCommunitiesSection />

      {/* ✅ Your existing Join Requests dashboard unchanged */}
      <OfficerJoinRequestsSection />
    </div>
  );
}

/* =========================
   ✅ NEW SECTION: Communities
   ========================= */
function OfficerCommunitiesSection() {
  const token = localStorage.getItem("token");

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", location: "" });
  const [acting, setActing] = useState(false);

  // edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", location: "" });

  const totalPages = useMemo(() => {
    const t = data.total || 0;
    return Math.max(1, Math.ceil(t / limit));
  }, [data.total]);
  const communityCount = data.items?.length || 0;
  const projectReadyCount = data.items?.filter((item) => item.hasProject).length || 0;
  const totalMembers = data.items?.reduce(
    (sum, item) => sum + (item.memberCount || 0),
    0
  ) || 0;

  const load = async (p = page) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await apiRequest(
        `/api/communities?search=${encodeURIComponent(search)}&page=${p}&limit=${limit}`,
        { token }
      );
      setData(res);
      setPage(res.page || p);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCommunity = async () => {
    setMsg("");
    if (!createForm.name || !createForm.location) {
      setMsg("name and location required");
      return;
    }

    setActing(true);
    try {
      await apiRequest("/api/communities", {
        method: "POST",
        token,
        body: createForm,
      });
      setOpenCreate(false);
      setCreateForm({ name: "", location: "" });
      await load(1);
      setMsg("Community created ✅");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setActing(false);
    }
  };

  const openEditModal = (c) => {
    setEditId(c._id);
    setEditForm({ name: c.name || "", location: c.location || "" });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    setMsg("");
    if (!editId) return;

    setActing(true);
    try {
      await apiRequest(`/api/communities/${editId}`, {
        method: "PATCH",
        token,
        body: editForm,
      });
      setOpenEdit(false);
      setEditId(null);
      await load(page);
      setMsg("Community updated ✅");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setActing(false);
    }
  };

  const del = async (id) => {
    if (!window.confirm("Delete (archive) this community?")) return;

    setActing(true);
    setMsg("");
    try {
      await apiRequest(`/api/communities/${id}`, {
        method: "DELETE",
        token,
      });
      await load(page);
      setMsg("Community deleted (archived) ✅");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setActing(false);
    }
  };

  return (
    <>
      <div className="od-top">
        <div className="od-top-inner">
          <div className="od-copy">
            <div className="od-kicker">OFFICER PANEL</div>
            <h1 className="od-title">Manage your communities with clarity.</h1>
            <p className="od-sub">
              Create communities, update details, and move straight into project setup from one clean dashboard.
            </p>
          </div>

          <div className="od-side-panel">
            <div className="od-side-grid">
              <div className="od-side-stat">
                <span className="od-side-label">Active communities</span>
                <strong>{data.total || 0}</strong>
              </div>
              <div className="od-side-stat">
                <span className="od-side-label">Project-ready sites</span>
                <strong>{projectReadyCount}</strong>
              </div>
              <div className="od-side-stat">
                <span className="od-side-label">Members tracked</span>
                <strong>{totalMembers}</strong>
              </div>
            </div>

            <div className="od-actions">
              <button className="od-btn" onClick={() => setOpenCreate(true)} type="button">
              + New Community
              </button>
              <button className="od-btn od-btn-ghost-dark" onClick={() => load(page)} disabled={loading} type="button">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="od-wrap">
        <div className="od-stats od-stats-tight">
          <div className="od-stat">
            <div className="od-stat-num">{communityCount}</div>
            <div className="od-stat-lbl">Visible Communities</div>
          </div>
          <div className="od-stat">
            <div className="od-stat-num">{projectReadyCount}</div>
            <div className="od-stat-lbl">With Projects</div>
          </div>
          <div className="od-stat">
            <div className="od-stat-num">{totalMembers}</div>
            <div className="od-stat-lbl">Total Members</div>
          </div>
        </div>

        <div className="od-toolbar">
          <div className="od-toolbar-copy">
            <div className="od-toolbar-title">Active communities</div>
            <div className="od-toolbar-sub">
              Search, edit, archive, or move directly into project setup.
            </div>
          </div>

          <div className="od-search">
            <input
              className="od-search-input"
              placeholder="Search name / location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="od-search-btn" onClick={() => load(1)} disabled={loading} type="button">
              Search
            </button>
          </div>
        </div>

        {msg ? <div className="msg">{msg}</div> : null}

        {loading ? (
          <div className="od-loading">Loading communities…</div>
        ) : data.items?.length ? (
          <div className="od-grid">
            {data.items.map((c) => (
              <div className="od-card" key={c._id}>
                <div className="od-card-top">
                  <div className="od-avatar">{(c.name || "C")[0]}</div>
                  <div className="od-meta">
                    <div className="od-name">{c.name}</div>
                    <div className="od-mini">{c.location}</div>
                  </div>
                  <div className="od-chip od-chip-approved">ACTIVE</div>
                </div>

                <div className="od-info">
                  <div className="od-metric-row">
                    <div className="od-metric">
                      <span>Members</span>
                      <strong>{c.memberCount || 0}</strong>
                    </div>
                    <div className="od-metric">
                      <span>Project</span>
                      <strong>{c.hasProject ? "Live" : "Pending"}</strong>
                    </div>
                    <div className="od-metric">
                      <span>Community ID</span>
                      <strong>{String(c._id).slice(-6).toUpperCase()}</strong>
                    </div>
                  </div>

                  <div className="od-foot">
                    <span className="od-time">
                      Created: {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                    </span>
                  </div>

                  <div className="od-card-actions">
                    <button
                      className="od-btn"
                      type="button"
                      disabled={c.hasProject}
                      onClick={() => navigate(`/projects/create/${c._id}`)}
                    >
                      {c.hasProject ? "Project Exists" : "+ Add Project"}
                    </button>
                    <button className="od-btn-approve" type="button" onClick={() => openEditModal(c)} disabled={acting}>
                      Edit
                    </button>
                    <button className="od-btn-reject" type="button" onClick={() => del(c._id)} disabled={acting}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="od-empty">No communities found.</div>
        )}

        <div className="od-pagination">
          <button
            className="od-pagebtn"
            onClick={() => load(Math.max(1, page - 1))}
            disabled={loading || page <= 1}
          >
            ← Prev
          </button>
          <div className="od-pagetext">
            Page <b>{page}</b> of <b>{totalPages}</b>
          </div>
          <button
            className="od-pagebtn"
            onClick={() => load(Math.min(totalPages, page + 1))}
            disabled={loading || page >= totalPages}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Create modal */}
      {openCreate ? (
        <div className="od-modal-backdrop" onMouseDown={() => setOpenCreate(false)}>
          <div className="od-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="od-modal-head">
              <div className="od-modal-title">Create Community</div>
              <button className="od-x" onClick={() => setOpenCreate(false)} type="button">
                ✕
              </button>
            </div>

            <label className="label">Name</label>
            <input
              className="input"
              value={createForm.name}
              onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
            />

            <label className="label">Location</label>
            <input
              className="input"
              value={createForm.location}
              onChange={(e) => setCreateForm((p) => ({ ...p, location: e.target.value }))}
            />

            <div className="od-modal-actions">
              <button className="od-btn od-btn-ghost" onClick={() => setOpenCreate(false)} type="button">
                Cancel
              </button>
              <button className="od-btn" onClick={createCommunity} disabled={acting} type="button">
                {acting ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit modal */}
      {openEdit ? (
        <div className="od-modal-backdrop" onMouseDown={() => setOpenEdit(false)}>
          <div className="od-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="od-modal-head">
              <div className="od-modal-title">Edit Community</div>
              <button className="od-x" onClick={() => setOpenEdit(false)} type="button">
                ✕
              </button>
            </div>

            <label className="label">Name</label>
            <input
              className="input"
              value={editForm.name}
              onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
            />

            <label className="label">Location</label>
            <input
              className="input"
              value={editForm.location}
              onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
            />

            <div className="od-modal-actions">
              <button className="od-btn od-btn-ghost" onClick={() => setOpenEdit(false)} type="button">
                Cancel
              </button>
              <button className="od-btn" onClick={saveEdit} disabled={acting} type="button">
                {acting ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* =========================
   ✅ YOUR ORIGINAL SECTION: Join Requests
   (copied without changes)
   ========================= */
function OfficerJoinRequestsSection() {
  const token = localStorage.getItem("token");

  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  // reject modal
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  const totalPages = useMemo(() => {
    const t = data.total || 0;
    return Math.max(1, Math.ceil(t / limit));
  }, [data.total]);
  const visibleRequests = data.items?.length || 0;
  const documentCount = data.items?.reduce(
    (sum, item) => sum + (Array.isArray(item.documents) ? item.documents.length : 0),
    0
  ) || 0;

  const load = async (p = page) => {
    setLoading(true);
    setMsg("");
    try {
      const res = await apiRequest(
        `/api/officer/join-requests?status=${encodeURIComponent(status)}&page=${p}&limit=${limit}&search=${encodeURIComponent(search)}`,
        { token }
      );

      // backend returns {items,total,page,limit}
      setData(res);
      setPage(res.page || p);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const doApprove = async (id) => {
    if (!window.confirm("Approve this join request?")) return;

    setActing(true);
    setMsg("");
    try {
      await apiRequest(`/api/officer/join-requests/${id}/approve`, {
        method: "PATCH",
        token,
      });
      await load(page);
      setMsg("Approved ✅");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setActing(false);
    }
  };

  const openReject = (id) => {
    setRejectId(id);
    setRejectReason("");
    setRejectOpen(true);
  };

  const doReject = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      setMsg("Please enter a rejection reason.");
      return;
    }

    setActing(true);
    setMsg("");
    try {
      await apiRequest(`/api/officer/join-requests/${rejectId}/reject`, {
        method: "PATCH",
        token,
        body: { reason: rejectReason.trim() },
      });
      setRejectOpen(false);
      setRejectId(null);
      setRejectReason("");
      await load(page);
      setMsg("Rejected ✅");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setActing(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  return (
    <>
      <div className="od-top">
        <div className="od-top-inner">
          <div className="od-copy">
            <div className="od-kicker">MEMBERSHIP REVIEW</div>
            <h1 className="od-title">Review join requests faster.</h1>
            <p className="od-sub">
              Check the applicant, review their documents, and approve or reject with less clutter.
            </p>
          </div>

          <div className="od-side-panel">
            <div className="od-side-grid">
              <div className="od-side-stat">
                <span className="od-side-label">Queue total</span>
                <strong>{data.total || 0}</strong>
              </div>
              <div className="od-side-stat">
                <span className="od-side-label">Visible requests</span>
                <strong>{visibleRequests}</strong>
              </div>
              <div className="od-side-stat">
                <span className="od-side-label">Docs attached</span>
                <strong>{documentCount}</strong>
              </div>
            </div>

            <div className="od-actions">
              <button className="od-btn od-btn-ghost-dark" onClick={() => load(page)} disabled={loading}>
              Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="od-wrap">
        <div className="od-stats od-stats-tight">
          <div className="od-stat">
            <div className="od-stat-num">{data.total || 0}</div>
            <div className="od-stat-lbl">Queue Total</div>
          </div>
          <div className="od-stat">
            <div className="od-stat-num">{visibleRequests}</div>
            <div className="od-stat-lbl">Visible Requests</div>
          </div>
          <div className="od-stat">
            <div className="od-stat-num">{status}</div>
            <div className="od-stat-lbl">Current Filter</div>
          </div>
        </div>

        <div className="od-toolbar">
          <div className="od-filters">
            <button
              className={`od-pill ${status === "PENDING" ? "active" : ""}`}
              onClick={() => setStatus("PENDING")}
              type="button"
            >
              Pending
            </button>
            <button
              className={`od-pill ${status === "APPROVED" ? "active" : ""}`}
              onClick={() => setStatus("APPROVED")}
              type="button"
            >
              Approved
            </button>
            <button
              className={`od-pill ${status === "REJECTED" ? "active" : ""}`}
              onClick={() => setStatus("REJECTED")}
              type="button"
            >
              Rejected
            </button>
            <button
              className={`od-pill ${status === "CANCELLED" ? "active" : ""}`}
              onClick={() => setStatus("CANCELLED")}
              type="button"
            >
              Cancelled
            </button>
          </div>

          <div className="od-search">
            <input
              className="od-search-input"
              placeholder="Search name / phone / address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="od-search-btn" onClick={() => load(1)} disabled={loading}>
              Search
            </button>
          </div>
        </div>

        {msg ? <div className="msg">{msg}</div> : null}

        {/* stats row */}
        <div className="od-stats">
          <div className="od-stat">
            <div className="od-stat-num">{data.total || 0}</div>
            <div className="od-stat-lbl">Total ({status})</div>
          </div>
          <div className="od-stat">
            <div className="od-stat-num">{page}</div>
            <div className="od-stat-lbl">Page</div>
          </div>
          <div className="od-stat">
            <div className="od-stat-num">{totalPages}</div>
            <div className="od-stat-lbl">Pages</div>
          </div>
        </div>

        {/* grid */}
        {loading ? (
          <div className="od-loading">Loading requests…</div>
        ) : data.items?.length ? (
          <div className="od-grid">
            {data.items.map((r) => (
              <div className="od-card" key={r._id}>
                <div className="od-card-top">
                  <div className="od-avatar">
                    {(r.fullName || "U")[0]}
                  </div>
                  <div className="od-meta">
                    <div className="od-name">{r.fullName}</div>
                    <div className="od-mini">
                      {r.applicantType} • {r.monthlyBillRange}
                    </div>
                  </div>

                  <div className={`od-chip od-chip-${r.status.toLowerCase()}`}>
                    {r.status}
                  </div>
                </div>

                <div className="od-info">
                  <div className="od-metric-row">
                    <div className="od-metric">
                      <span>Applicant</span>
                      <strong>{r.applicantType}</strong>
                    </div>
                    <div className="od-metric">
                      <span>Bill range</span>
                      <strong>{r.monthlyBillRange || "—"}</strong>
                    </div>
                    <div className="od-metric">
                      <span>Docs</span>
                      <strong>{Array.isArray(r.documents) ? r.documents.length : 0}</strong>
                    </div>
                  </div>

                  <div><b>Community:</b> {r.communityId?.name || "—"}</div>
                  <div><b>Location:</b> {r.communityId?.location || "—"}</div>
                  <div><b>Phone:</b> {r.phone}</div>
                  <div className="od-reason">
                    <b>Reason:</b> {r.reason}
                  </div>

                  <div className="od-foot">
                    <span className="od-time">Created: {formatDate(r.createdAt)}</span>
                    {r.meterNumber ? <span className="od-meter">Meter: {r.meterNumber}</span> : null}
                  </div>

                  {Array.isArray(r.documents) && r.documents.length ? (
                    <div className="od-docs">
                      <div className="od-docs-title">Documents</div>
                      <div className="od-docs-list">
                        {r.documents.map((d, idx) => (
                          <a
                            key={idx}
                            className="od-doc"
                            href={`http://localhost:5001${d.fileUrl}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {d.type || "DOC"}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {r.status === "PENDING" ? (
                  <div className="od-card-actions">
                    <button
                      className="od-btn-approve"
                      onClick={() => doApprove(r._id)}
                      disabled={acting}
                      type="button"
                    >
                      Approve
                    </button>
                    <button
                      className="od-btn-reject"
                      onClick={() => openReject(r._id)}
                      disabled={acting}
                      type="button"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="od-card-actions muted">
                    Reviewed {r.reviewedAt ? `• ${formatDate(r.reviewedAt)}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="od-empty">No requests found.</div>
        )}

        {/* pagination */}
        <div className="od-pagination">
          <button
            className="od-pagebtn"
            onClick={() => load(Math.max(1, page - 1))}
            disabled={loading || page <= 1}
          >
            ← Prev
          </button>
          <div className="od-pagetext">
            Page <b>{page}</b> of <b>{totalPages}</b>
          </div>
          <button
            className="od-pagebtn"
            onClick={() => load(Math.min(totalPages, page + 1))}
            disabled={loading || page >= totalPages}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Reject modal */}
      {rejectOpen ? (
        <div className="od-modal-backdrop" onMouseDown={() => setRejectOpen(false)}>
          <div className="od-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="od-modal-head">
              <div className="od-modal-title">Reject Request</div>
              <button className="od-x" onClick={() => setRejectOpen(false)} type="button">
                ✕
              </button>
            </div>

            <label className="label">Reason</label>
            <textarea
              className="input"
              style={{ height: 100, resize: "vertical" }}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Example: Missing documents / not eligible / wrong details..."
            />

            <div className="od-modal-actions">
              <button className="od-btn od-btn-ghost" onClick={() => setRejectOpen(false)} type="button">
                Cancel
              </button>
              <button className="od-btn" onClick={doReject} disabled={acting} type="button">
                {acting ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
