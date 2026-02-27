import { useEffect, useState } from "react";
import { api, setAuthToken } from "../../api";
import "../../styles/feature-2/admin.css";

export default function AdminMembers() {
  const [status, setStatus] = useState("pending");
  const [memberships, setMemberships] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setAuthToken(token);
  }, []);

  const load = async () => {
    setMsg("");
    try {
      const res = await api.get(`/memberships?status=${status}`);
      setMemberships(res.data.memberships || []);
    } catch (e) {
      setMsg(e?.response?.data?.message || "Failed to load");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [status]);

  const approve = async (userId) => {
    await api.patch(`/memberships/${userId}/approve`);
    load();
  };

  const reject = async (userId) => {
    await api.patch(`/memberships/${userId}/reject`);
    load();
  };

  return (
    <div className="admin-wrap">
      <div className="admin-header">
        <h2>Membership Requests</h2>

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {msg ? <div className="admin-msg">{msg}</div> : null}

      <div className="admin-list">
        {memberships.map((m) => (
          <div className="admin-card" key={m._id}>
            <div>
              <div className="admin-name">{m.userId?.fullName}</div>
              <div className="admin-email">{m.userId?.email}</div>
              <div className="admin-status">Status: {m.status}</div>
            </div>

            {status === "pending" && (
              <div className="admin-actions">
                <button className="btn-approve" onClick={() => approve(m.userId?._id)}>
                  Approve
                </button>
                <button className="btn-reject" onClick={() => reject(m.userId?._id)}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {memberships.length === 0 && <p>No records.</p>}
      </div>
    </div>
  );
}