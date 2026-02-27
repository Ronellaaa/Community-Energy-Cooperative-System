import { useEffect, useState } from "react";
import { apiRequest } from "../../api";

export default function AdminOfficers() {
  const token = localStorage.getItem("token");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  // simple admin guard
  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {}
  if (user.role !== "ADMIN") {
    return (
      <div className="od-wrap">
        <div className="msg">Forbidden (Admin only)</div>
      </div>
    );
  }

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const list = await apiRequest("/api/admin/officers", { token });
      setOfficers(Array.isArray(list) ? list : []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createOfficer = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.name || !form.email || !form.password) {
      setMsg("name, email, password required");
      return;
    }

    try {
      await apiRequest("/api/admin/officers", {
        method: "POST",
        token,
        body: form,
      });

      setForm({ name: "", email: "", phone: "", password: "" });
      setMsg("Officer created ✅");
      load();
    } catch (e2) {
      setMsg(e2.message);
    }
  };

  return (
    <div className="od-page">
      <div className="od-top">
        <div className="od-top-inner">
          <div>
            <div className="od-kicker">ADMIN PANEL</div>
            <h1 className="od-title">Officer Management</h1>
            <p className="od-sub">
              Create, update, and delete officer accounts.
            </p>
          </div>

          <div className="od-actions">
            <button className="od-btn" onClick={load} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="od-wrap">
        {msg ? <div className="msg">{msg}</div> : null}

        <div className="od-grid" style={{ marginTop: 16 }}>
          {/* Create Officer */}
          <div className="od-card">
            <div className="od-card-top">
              <div className="od-avatar">+</div>
              <div className="od-meta">
                <div className="od-name">Create Officer</div>
                <div className="od-mini">Admin only</div>
              </div>
              <div className="od-chip od-chip-approved">NEW</div>
            </div>

            <div className="od-info">
              <form className="form" onSubmit={createOfficer}>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Officer name"
                />

                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="officer@example.com"
                />

                <label className="label">Phone (optional)</label>
                <input
                  className="input"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="0771234567"
                />

                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Set initial password"
                />

                <div className="od-card-actions">
                  <button className="od-btn-approve" type="submit">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Officers list */}
          {loading ? (
            <div className="od-loading">Loading officers…</div>
          ) : officers.length ? (
            officers.map((o) => (
              <OfficerCard
                key={o._id}
                officer={o}
                token={token}
                onChanged={load}
              />
            ))
          ) : (
            <div className="od-empty">No officers found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Officer Card (Update + Delete) ===== */
function OfficerCard({ officer, token, onChanged }) {
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: officer.name || "",
    email: officer.email || "",
    phone: officer.phone || "",
  });

  const save = async () => {
    setMsg("");
    if (!form.name || !form.email) {
      setMsg("Name and email are required.");
      return;
    }

    setBusy(true);
    try {
      await apiRequest(`/api/admin/officers/${officer._id}`, {
        method: "PATCH",
        token,
        body: form,
      });
      setEdit(false);
      onChanged();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const archive = async () => {
    setMsg("");
    if (!window.confirm("Archive this officer?")) return;

    setBusy(true);
    try {
      await apiRequest(`/api/admin/officers/${officer._id}/archive`, {
        method: "PATCH",
        token,
      });
      onChanged();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  const unarchive = async () => {
    setMsg("");
    if (!window.confirm("Unarchive this officer?")) return;

    setBusy(true);
    try {
      await apiRequest(`/api/admin/officers/${officer._id}/unarchive`, {
        method: "PATCH",
        token,
      });
      onChanged();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="od-card">
      <div className="od-card-top">
        <div className="od-avatar">{(officer.name || "O")[0]}</div>
        <div className="od-meta">
          <div className="od-name">{officer.name}</div>
          <div className="od-mini">{officer.email}</div>
        </div>
        <div
          className={`od-chip ${officer.isArchived ? "od-chip-cancelled" : "od-chip-approved"}`}
        >
          {officer.isArchived ? "ARCHIVED" : "OFFICER"}
        </div>
      </div>

      <div className="od-info">
        {msg ? <div className="msg">{msg}</div> : null}

        {!edit ? (
          <>
            <div>
              <b>Phone:</b> {officer.phone || "—"}
            </div>
            <div className="od-foot">
              <span className="od-time">
                Created:{" "}
                {officer.createdAt
                  ? new Date(officer.createdAt).toLocaleString()
                  : "—"}
              </span>
            </div>

            <div className="od-card-actions">
              {!officer.isArchived ? (
                <>
                  <button
                    className="od-btn-approve"
                    type="button"
                    onClick={() => setEdit(true)}
                    disabled={busy}
                  >
                    Edit
                  </button>

                  <button
                    className="od-btn-reject"
                    type="button"
                    onClick={archive}
                    disabled={busy}
                  >
                    Archive
                  </button>
                </>
              ) : (
                <button
                  className="od-btn"
                  type="button"
                  onClick={unarchive}
                  disabled={busy}
                >
                  Unarchive
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <label className="label">Name</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />

            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />

            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: e.target.value }))
              }
            />

            <div className="od-card-actions">
              <button
                className="od-btn od-btn-ghost"
                type="button"
                onClick={() => setEdit(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="od-btn-approve"
                type="button"
                onClick={save}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
