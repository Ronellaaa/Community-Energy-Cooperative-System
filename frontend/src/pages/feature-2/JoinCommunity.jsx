import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api";
import "../../styles/feature-2/JoinCommunity.css";

export default function JoinCommunity() {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [search, setSearch] = useState("");
  const [msg, setMsg] = useState("");

  // join request status
  const [myReq, setMyReq] = useState(null);

  // form state
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    applicantType: "HOUSEHOLD",
    fullName: "",
    phone: "",
    address: "",
    reason: "",
    monthlyBillRange: "3000-6000",
    meterNumber: "",
    contributionTypes: [],
    lowIncomeRequested: false,
    incomeRange: "",
    familySize: "",
    documents: [],
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return communities;
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
    );
  }, [communities, search]);

  const load = async () => {
    setLoading(true);
    setMsg("");
    try {
      const [cRes, myRes] = await Promise.all([
        apiRequest(`/api/communities?search=${encodeURIComponent(search)}&page=1&limit=50`),
        apiRequest("/api/join-requests/me", { token }),
      ]);

      // Your backend might return array OR {items:[]}
      const items = Array.isArray(cRes) ? cRes : (cRes.items || []);
      setCommunities(items);
      setMyReq(myRes);
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

  const onPick = (community) => {
    setPicked(community);
    setOpen(true);

    // auto-fill name/phone from saved user if exists
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setForm((p) => ({
        ...p,
        fullName: p.fullName || u.name || "",
        phone: p.phone || u.phone || "",
      }));
    } catch {}
  };

  const toggleContribution = (value) => {
    setForm((p) => {
      const exists = p.contributionTypes.includes(value);
      const next = exists
        ? p.contributionTypes.filter((x) => x !== value)
        : [...p.contributionTypes, value];
      return { ...p, contributionTypes: next };
    });
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!token) {
      setMsg("Please login again.");
      return;
    }
    if (!picked?._id) {
      setMsg("Please choose a community.");
      return;
    }

    // minimal frontend checks (keep it simple)
    if (!form.fullName || !form.phone || !form.address || !form.reason) {
      setMsg("Please fill: full name, phone, address, reason.");
      return;
    }
    if (form.lowIncomeRequested && (!form.incomeRange || !form.familySize)) {
      setMsg("If low-income is ON, please select income range + family size.");
      return;
    }

    try {
      setSubmitting(true);

      // multipart/form-data (supports optional documents)
      const fd = new FormData();
      fd.append("communityId", picked._id);
      fd.append("applicantType", form.applicantType);
      fd.append("fullName", form.fullName);
      fd.append("phone", form.phone);
      fd.append("address", form.address);
      fd.append("reason", form.reason);
      fd.append("monthlyBillRange", form.monthlyBillRange);
      if (form.meterNumber) fd.append("meterNumber", form.meterNumber);

      // send as JSON string (backend handles this)
      fd.append("contributionTypes", JSON.stringify(form.contributionTypes));

      fd.append("lowIncomeRequested", String(form.lowIncomeRequested));
      if (form.lowIncomeRequested) {
        fd.append("incomeRange", form.incomeRange);
        fd.append("familySize", String(form.familySize));
      }

      // files
      for (const f of form.documents) fd.append("documents", f);

      await apiRequest("/api/join-requests", {
        method: "POST",
        body: fd,
        token,
        isFormData: true,
      });

      setOpen(false);
      setPicked(null);
      setForm((p) => ({ ...p, documents: [] }));
      await load();
      setMsg("Join request sent. Waiting for officer approval.");
    } catch (e2) {
      setMsg(e2.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="jc-page">
      {/* HERO (like image 1) */}
      <div className="jc-hero">
        <div className="jc-hero-inner">
          <div className="jc-hero-left">
            <div className="jc-badge">COMMUNITY ENERGY CO-OP</div>
            <h1 className="jc-title">
              Join a community <span className="jc-accent">project</span> and
              start saving.
            </h1>
            <p className="jc-sub">
              Pick your local community, apply once, and track approval. No
              membership is forced — you choose.
            </p>

            <div className="jc-hero-actions">
              <a className="jc-btn" href="#communities">
                Explore communities
              </a>
              <button
                className="jc-btn jc-btn-ghost"
                onClick={() => load()}
                type="button"
              >
                Refresh
              </button>
            </div>

            {myReq?.status ? (
              <div className="jc-status">
                <div className="jc-status-title">Your Join Status</div>
                <div className={`jc-chip jc-chip-${myReq.status.toLowerCase()}`}>
                  {myReq.status}
                </div>
                {myReq.status === "REJECTED" && myReq.rejectionReason ? (
                  <div className="jc-status-note">
                    Reason: {myReq.rejectionReason}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="jc-status jc-status-muted">
                You haven’t applied to any community yet.
              </div>
            )}
          </div>

          {/* Hero illustration block (no image needed, just style like example) */}
          <div className="jc-hero-right" aria-hidden="true">
            <div className="jc-orb jc-orb-1" />
            <div className="jc-orb jc-orb-2" />
            <div className="jc-illus-card">
              <div className="jc-illus-top">
                <div className="jc-dot" />
                <div className="jc-dot" />
                <div className="jc-dot" />
              </div>
              <div className="jc-illus-body">
                <div className="jc-illus-big" />
                <div className="jc-illus-line" />
                <div className="jc-illus-line short" />
                <div className="jc-illus-mini">
                  <div className="mini" />
                  <div className="mini" />
                  <div className="mini" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIST AREA (like image 2) */}
      <div className="jc-wrap" id="communities">
        <div className="jc-toolbar">
          <div className="jc-toolbar-left">
            <h2 className="jc-h2">Available Communities</h2>
            <p className="jc-p">Pick one and submit your join request.</p>
          </div>

          <div className="jc-search">
            <input
              className="jc-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or location…"
            />
            <button className="jc-search-btn" onClick={load} type="button">
              Search
            </button>
          </div>
        </div>

        {msg ? <div className="msg">{msg}</div> : null}

        {loading ? (
          <div className="jc-loading">Loading communities…</div>
        ) : (
          <div className="jc-grid">
            {filtered.map((c) => (
              <div className="jc-card" key={c._id}>
                <div className="jc-card-top">
                  <div className="jc-avatar">{(c.name || "C")[0]}</div>
                  <div className="jc-card-meta">
                    <div className="jc-card-name">{c.name}</div>
                    <div className="jc-card-loc">{c.location}</div>
                  </div>
                </div>

                <div className="jc-card-actions">
                  <button
                    className="jc-join"
                    onClick={() => onPick(c)}
                    type="button"
                    disabled={myReq?.status === "PENDING"}
                    title={myReq?.status === "PENDING" ? "You already have a pending request" : "Apply to join"}
                  >
                    {myReq?.status === "PENDING" ? "Pending…" : "Join"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL FORM */}
      {open && picked ? (
        <div className="jc-modal-backdrop" onMouseDown={() => setOpen(false)}>
          <div className="jc-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="jc-modal-head">
              <div>
                <div className="jc-modal-title">Join: {picked.name}</div>
                <div className="jc-modal-sub">{picked.location}</div>
              </div>
              <button className="jc-x" onClick={() => setOpen(false)} type="button">
                ✕
              </button>
            </div>

            <form className="jc-form" onSubmit={submitJoin}>
              <div className="jc-row">
                <div className="jc-field">
                  <label className="label">Applicant Type</label>
                  <select
                    className="input"
                    value={form.applicantType}
                    onChange={(e) => setForm((p) => ({ ...p, applicantType: e.target.value }))}
                  >
                    <option value="HOUSEHOLD">Household</option>
                    <option value="SCHOOL">School</option>
                    <option value="TEMPLE">Temple</option>
                    <option value="SMALL_BUSINESS">Small Business</option>
                  </select>
                </div>

                <div className="jc-field">
                  <label className="label">Monthly Bill Range</label>
                  <select
                    className="input"
                    value={form.monthlyBillRange}
                    onChange={(e) => setForm((p) => ({ ...p, monthlyBillRange: e.target.value }))}
                  >
                    <option value="0-3000">0–3000</option>
                    <option value="3000-6000">3000–6000</option>
                    <option value="6000-10000">6000–10000</option>
                    <option value="10000+">10000+</option>
                  </select>
                </div>
              </div>

              <label className="label">Full Name</label>
              <input className="input" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />

              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />

              <label className="label">Address</label>
              <input className="input" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />

              <label className="label">Reason</label>
              <textarea
                className="input"
                style={{ height: 90, resize: "vertical" }}
                value={form.reason}
                onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              />

              <label className="label">Meter Number (optional)</label>
              <input className="input" value={form.meterNumber} onChange={(e) => setForm((p) => ({ ...p, meterNumber: e.target.value }))} />

              <div className="jc-row">
                <div className="jc-field">
                  <label className="label">Contribution Type</label>
                  <div className="jc-checks">
                    {["MONEY", "ROOF_SPACE", "LABOUR_SUPPORT"].map((x) => (
                      <label className="jc-check" key={x}>
                        <input
                          type="checkbox"
                          checked={form.contributionTypes.includes(x)}
                          onChange={() => toggleContribution(x)}
                        />
                        <span>{x.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="jc-field">
                  <label className="label">Low-income Support</label>
                  <label className="jc-switch">
                    <input
                      type="checkbox"
                      checked={form.lowIncomeRequested}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          lowIncomeRequested: e.target.checked,
                          incomeRange: e.target.checked ? p.incomeRange : "",
                          familySize: e.target.checked ? p.familySize : "",
                        }))
                      }
                    />
                    <span className="jc-slider" />
                  </label>
                </div>
              </div>

              {form.lowIncomeRequested ? (
                <div className="jc-row">
                  <div className="jc-field">
                    <label className="label">Income Range</label>
                    <select
                      className="input"
                      value={form.incomeRange}
                      onChange={(e) => setForm((p) => ({ ...p, incomeRange: e.target.value }))}
                    >
                      <option value="">Select…</option>
                      <option value="<25000">&lt; 25000</option>
                      <option value="25000-50000">25000–50000</option>
                      <option value="50000-100000">50000–100000</option>
                      <option value="100000+">100000+</option>
                    </select>
                  </div>

                  <div className="jc-field">
                    <label className="label">Family Size</label>
                    <input
                      className="input"
                      type="number"
                      min={1}
                      max={30}
                      value={form.familySize}
                      onChange={(e) => setForm((p) => ({ ...p, familySize: e.target.value }))}
                    />
                  </div>
                </div>
              ) : null}

              <label className="label">Documents (optional, JPG/PNG/PDF)</label>
              <input
                className="input"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setForm((p) => ({ ...p, documents: Array.from(e.target.files || []) }))}
              />

              <div className="jc-form-actions">
                <button type="button" className="jc-btn jc-btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="jc-btn" type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}