import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Landmark, Pencil, Trash2 } from "lucide-react";
import { apiRequest } from "../../api";
import "../../styles/finance-payments/dashboard.css";

const typeColors = {
  GRANT: "#31b46b",
  LOAN: "#3a7be0",
  "COMMUNITY FUND": "#f4b53f",
  DONATION: "#ff8b49",
  OTHER: "#8f66ff",
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

export default function FinanceSourcesPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const token = localStorage.getItem("token");
  const role = getStoredUser()?.role || localStorage.getItem("role") || "";
  const canManage = role === "ADMIN" || role === "OFFICER";

  const [project, setProject] = useState(null);
  const [fundingSources, setFundingSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const request = (path, options) =>
    apiRequest(path, {
      ...options,
      token,
    });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [projectData, sourcesRes] = await Promise.all([
        request(`/api/projects/${projectId}`),
        request("/api/funding-sources"),
      ]);
      setProject(projectData);
      setFundingSources(sourcesRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (!canManage) {
      navigate(`/finance-payments/dashboard/${projectId}`, { replace: true });
      return;
    }
    loadData();
  }, [projectId, token]);

  const handleEditSource = (source) => {
    navigate(`/finance-payments/edit/source/${projectId}/${source._id}`);
  };

  const handleDeleteSource = async (source) => {
    const confirmed = window.confirm(`Delete ${source.fundName}?`);
    if (!confirmed) return;

    try {
      await request(`/api/funding-sources/${source._id}`, { method: "DELETE" });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filterTabs = useMemo(() => {
    const baseTabs = [
      { id: "ALL", label: "All Sources" },
      { id: "ACTIVE", label: "Active" },
      { id: "INACTIVE", label: "Inactive" },
    ];

    const typeTabs = ["GRANT", "LOAN", "COMMUNITY FUND", "DONATION", "OTHER"].map((type) => ({
      id: type,
      label: type,
    }));

    return [...baseTabs, ...typeTabs];
  }, []);

  const filteredSources = useMemo(() => {
    if (activeFilter === "ALL") return fundingSources;
    if (activeFilter === "ACTIVE") return fundingSources.filter((source) => source.isActive);
    if (activeFilter === "INACTIVE") return fundingSources.filter((source) => !source.isActive);
    return fundingSources.filter((source) => source.fundType === activeFilter);
  }, [activeFilter, fundingSources]);

  const getTabCount = (tabId) => {
    if (tabId === "ALL") return fundingSources.length;
    if (tabId === "ACTIVE") return fundingSources.filter((source) => source.isActive).length;
    if (tabId === "INACTIVE") return fundingSources.filter((source) => !source.isActive).length;
    return fundingSources.filter((source) => source.fundType === tabId).length;
  };

  return (
    <div className="finance-dashboard">
     
      <motion.div
        className="finance-shell finance-shell--sources"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="finance-sources-head">
          <div>
            <div className="finance-breadcrumbs">
              Dashboard / Finance & Payments / Source Directory
            </div>
            <h1 className="finance-sources-title">All Funding Sources</h1>
            <p className="finance-sources-subtitle">
              {project ? `${project.name} source directory` : "Manage every finance source from one place"}
            </p>
          </div>

          <button
            type="button"
            className="finance-back-button"
            onClick={() => navigate(`/finance-payments/dashboard/${projectId}`)}
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </button>
        </div>

        {loading ? <div className="finance-empty-state">Loading sources...</div> : null}
        {!loading && error ? <div className="finance-inline-error">{error}</div> : null}

        {!loading && !error ? (
          <>
            <div className="finance-subnav">
              {filterTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`finance-subnav__item ${activeFilter === tab.id ? "is-active" : ""}`}
                  onClick={() => setActiveFilter(tab.id)}
                >
                  <span>{tab.label}</span>
                  <strong>{getTabCount(tab.id)}</strong>
                </button>
              ))}
            </div>

            <div className="finance-sources-grid">
              {filteredSources.map((source) => (
              <div key={source._id} className="finance-source-card">
                <div className="finance-source-card__top">
                  <div className="finance-source-card__identity">
                    <span
                      className="finance-chip__marker finance-source-card__marker"
                      style={{ background: typeColors[source.fundType] || "#8f66ff" }}
                    />
                    <div>
                      <strong>{source.fundName}</strong>
                      <span>{source.fundType}</span>
                    </div>
                  </div>

                  <div className="finance-row-actions">
                    <button
                      type="button"
                      className="finance-action finance-action--edit"
                      onClick={() => handleEditSource(source)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      className="finance-action finance-action--delete"
                      onClick={() => handleDeleteSource(source)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="finance-source-card__meta">
                  <div>
                    <label>Status</label>
                    <span>{source.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <div>
                    <label>Phone</label>
                    <span>{source.contactPhone || "-"}</span>
                  </div>
                </div>

                <div className="finance-source-card__description">
                  <Landmark size={16} />
                  <p>{source.description || "No description added yet."}</p>
                </div>
              </div>
              ))}
            </div>

            {filteredSources.length === 0 ? (
              <div className="finance-empty-state">No funding sources match this filter.</div>
            ) : null}
          </>
        ) : null}
      </motion.div>
    </div>
  );
}
