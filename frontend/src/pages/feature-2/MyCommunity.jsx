import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api";
import Navbar from "../../components/Navbar";
import "../../styles/feature-2/MyCommunity.css";

export default function MyCommunity() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [community, setCommunity] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      setMsg("");
      try {
        const me = await apiRequest("/api/auth/me", { token });
        localStorage.setItem("user", JSON.stringify(me));
        setUser(me);

        if (me.role !== "USER") {
          navigate("/login", { replace: true });
          return;
        }

        if (!me.communityId) {
          navigate("/join-community", { replace: true });
          return;
        }

        const [communityRes, communitiesRes] = await Promise.all([
          apiRequest(`/api/communities/${me.communityId}`),
          apiRequest("/api/communities?page=1&limit=100"),
        ]);

        const communityList = Array.isArray(communitiesRes)
          ? communitiesRes
          : (communitiesRes.items || []);
        const matched = communityList.find((item) => item._id === me.communityId);

        setCommunity({
          ...communityRes,
          memberCount: matched?.memberCount || 0,
          hasProject: matched?.hasProject || false,
        });
      } catch (error) {
        setMsg(error.message || "Failed to load your community.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, token]);

  return (
    <div className="mc-page">
      <Navbar />

      <section className="mc-hero">
        <div className="mc-shell">
          <div className="mc-copy">
            <div className="mc-kicker">MY COMMUNITY</div>
            <h1>
              {community?.name || "Your community"}
            </h1>
            <p>
              {community
                ? `You are now an approved member of ${community.name}. This page shows the community you belong to and keeps your membership view separate from the public directory.`
                : "Your approved community will appear here once an officer accepts your membership request."}
            </p>

            <div className="mc-actions">
              <button
                type="button"
                className="mc-btn"
                onClick={() => navigate("/feature-3/member-consumption")}
              >
                E-Bill
              </button>
              {community?.hasProject ? (
                <button
                  type="button"
                  className="mc-btn mc-btn-ghost"
                  onClick={() => navigate(`/my-projects/${community._id}`)}
                >
                  View Projects
                </button>
              ) : null}
            </div>
          </div>

          <div className="mc-panel">
            {loading ? (
              <div className="mc-empty">Loading your community...</div>
            ) : community ? (
              <>
                <div className="mc-card-top">
                  <div className="mc-avatar">{(community.name || "C")[0]}</div>
                  <div>
                    <div className="mc-name">{community.name}</div>
                    <div className="mc-location">{community.location}</div>
                  </div>
                </div>

                <div className="mc-grid">
                  <div className="mc-stat">
                    <span>Members</span>
                    <strong>{community.memberCount || 0}</strong>
                  </div>
                  <div className="mc-stat">
                    <span>Status</span>
                    <strong>Approved</strong>
                  </div>
                  <div className="mc-stat">
                    <span>Projects</span>
                    <strong>{community.hasProject ? "Available" : "Coming soon"}</strong>
                  </div>
                  <div className="mc-stat">
                    <span>Member</span>
                    <strong>{user?.name || "—"}</strong>
                  </div>
                </div>

                <div className="mc-community-id">
                  Community ID: {community._id}
                </div>
              </>
            ) : (
              <div className="mc-empty">{msg || "No community assigned yet."}</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
