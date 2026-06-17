import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DummyProjectCard from "../../components/finance-payments/DummyProjectCard";
import EmptyState from "../../components/finance-payments/EmptyState";
import PaginationBar from "../../components/finance-payments/PaginationBar";
import SectionHeader from "../../components/finance-payments/SectionHeader";
import {
  getCurrentAuthUser,
  loadFinanceProjects,
  paginateItems,
} from "./services/financeModuleApi";
import "../../styles/finance-payments/finance-module.css";

export default function CommunityProjectsPage() {
  const navigate = useNavigate();
  const user = getCurrentAuthUser();
  const isManager = user?.role === "ADMIN" || user?.role === "OFFICER";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const allProjects = await loadFinanceProjects();

        // Backend project documents currently do not expose a direct communityId,
        // so the safe user view is limited to projects where the user is assigned
        // or has participation through their own payment history.
        const visibleProjects = allProjects.filter((project) =>
          (project.assignedMembers || []).some((member) => (member._id || member.id || member) === user?.id),
        );

        if (!ignore) setProjects(visibleProjects);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    load();
    return () => {
      ignore = true;
    };
  }, [user?.id]);

  const paginated = useMemo(() => paginateItems(projects, page, 6), [page, projects]);

  if (isManager) {
    return (
      <div className="fp-page">
        <div className="fp-shell">
          <EmptyState
            title="Community member view only"
            description="Admins and officers should use the finance management pages instead of the member project view."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fp-page">
      <div className="fp-shell fp-stack">
        <div className="fp-page-head">
          <div>
            <div className="fp-eyebrow">Finance & Payments</div>
            <h1 className="fp-title">Community Projects</h1>
            <p className="fp-subtitle">
              Safe project view for normal community users. Only visible assigned projects are shown
              here, and no sensitive community-wide logs appear on this page.
            </p>
          </div>
        </div>

        <div className="fp-card fp-card--pad fp-stack">
          <SectionHeader
            title="Projects Assigned To Me"
            subtitle="Temporary placeholder project cards until the shared card is merged."
          />

          {loading ? <EmptyState title="Loading projects" description="Fetching finance project visibility from the backend." /> : null}
          {!loading && error ? <EmptyState title="Unable to load projects" description={error} /> : null}
          {!loading && !error && projects.length === 0 ? (
            <EmptyState
              title="No visible projects"
              description="No finance projects are currently assigned to your user account."
            />
          ) : null}

          {!loading && !error && paginated.items.length > 0 ? (
            <>
              <div className="fp-grid fp-grid--3">
                {paginated.items.map((project) => (
                  <DummyProjectCard
                    key={project.id}
                    project={project}
                    onView={(selectedProject) => navigate(`/finance-payments/project/${selectedProject.id}`)}
                  />
                ))}
              </div>
              <PaginationBar
                page={paginated.page}
                totalPages={paginated.totalPages}
                onPageChange={setPage}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
