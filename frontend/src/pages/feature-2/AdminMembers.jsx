import { useEffect, useState } from "react";
import { apiRequest } from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/feature-2/admin.css";

export default function AdminMembers() {
  const token = localStorage.getItem("token");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {}

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMsg("");
      try {
        const list = await apiRequest("/api/admin/users", { token });
        setMembers(Array.isArray(list) ? list : []);
      } catch (e) {
        setMsg(e.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  if (user.role !== "ADMIN") {
    return (
      <div className="admin-wrap">
        <div className="admin-msg">Forbidden (Admin only)</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="admin-wrap">
        <div className="admin-header">
          <h2>Users</h2>
        </div>

        {msg ? <div className="admin-msg">{msg}</div> : null}

        <div className="admin-list">
          {loading ? <p>Loading users...</p> : null}

          {!loading &&
            members.map((member) => (
              <div className="admin-card" key={member._id}>
                <div className="admin-main">
                  <div className="admin-name">{member.name}</div>
                  <div className="admin-email">{member.email}</div>
                  <div className="admin-status">
                    Community: {member.communityId?.name || "Not assigned yet"}
                  </div>
                  <div className="admin-subtext">
                    Location: {member.communityId?.location || "—"}
                  </div>
                </div>

                <div className="admin-side">
                  <div className="admin-badge">
                    {member.communityId?._id || "No community"}
                  </div>
                </div>
              </div>
            ))}

          {!loading && members.length === 0 ? <p>No users found.</p> : null}
        </div>
      </div>
    </div>
  );
}
