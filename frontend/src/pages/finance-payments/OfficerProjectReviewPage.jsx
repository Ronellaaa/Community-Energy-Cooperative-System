import React, { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/finance-payments/EmptyState";
import PaginationBar from "../../components/finance-payments/PaginationBar";
import SectionHeader from "../../components/finance-payments/SectionHeader";
import StatusBadge from "../../components/finance-payments/StatusBadge";
import {
  financeRequest,
  getCurrentAuthUser,
  loadFinanceProjects,
  paginateItems,
} from "./services/financeModuleApi";
import { formatLKR } from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-module.css";

export default function OfficerProjectReviewPage() {
  const user = getCurrentAuthUser();
  const isManager = user?.role === "ADMIN" || user?.role === "OFFICER";
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [approvingId, setApprovingId] = useState("");

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const projectList = await loadFinanceProjects();
      setProjects(projectList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isManager) return undefined;
    loadProjects();
    return undefined;
  }, [isManager]);

  const paginated = useMemo(
    () => paginateItems(projects, page, 8),
    [page, projects],
  );

  const handleApprove = async (project) => {
    if (!project.readyForApproval) return;

    try {
      setApprovingId(project.id);
      setError("");
      await financeRequest(`/api/projects/${project.id}/approve`, {
        method: "PATCH",
      });
      await loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovingId("");
    }
  };

  if (!isManager) {
    return (
      <div className="fp-page">
        <div className="fp-shell">
          <EmptyState
            title="Access limited"
            description="Only officers and admins can approve projects."
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
            <h1 className="fp-title">Project Review</h1>
            <p className="fp-subtitle">
              Review each project’s funding status and approve it only when
              enough funds have been recorded.
            </p>
          </div>
        </div>

        <div className="fp-card fp-card--pad fp-stack">
          <SectionHeader
            title="Approval Workflow"
            subtitle="Projects remain in collecting state until their funding requirement is satisfied."
          />

          {loading ? (
            <EmptyState
              title="Loading projects"
              description="Fetching project readiness from the backend."
            />
          ) : null}

          {!loading && error ? (
            <EmptyState
              title="Unable to load review data"
              description={error}
            />
          ) : null}

          {!loading && !error && paginated.items.length === 0 ? (
            <EmptyState
              title="No projects available"
              description="There are no finance-linked projects available for review right now."
            />
          ) : null}

          {!loading && !error && paginated.items.length > 0 ? (
            <>
              <div className="fp-record-grid">
                {paginated.items.map((project) => (
                  <article key={project.id} className="fp-record-card">
                    <div className="fp-record-card__head">
                      <div>
                        <h3>{project.name}</h3>
                        <p>
                          {project.communityName ||
                            "Community not exposed by backend"}
                        </p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="fp-record-card__grid">
                      <div className="fp-record-card__metric">
                        <span>Target Amount</span>
                        <strong>{formatLKR(project.targetAmount)}</strong>
                      </div>
                      <div className="fp-record-card__metric">
                        <span>Collected Amount</span>
                        <strong>{formatLKR(project.collectedAmount)}</strong>
                      </div>
                      <div className="fp-record-card__metric">
                        <span>Minimum Required</span>
                        <strong>
                          {formatLKR(project.minimumRequiredAmount)}
                        </strong>
                      </div>
                      <div className="fp-record-card__metric">
                        <span>Funding Progress</span>
                        <strong>{project.fundingPercentage}%</strong>
                      </div>
                    </div>
                    <div className="fp-record-card__actions">
                      <button
                        type="button"
                        className={
                          project.readyForApproval
                            ? "fp-action-button fp-action-button--approve"
                            : "fp-action-button fp-action-button--muted"
                        }
                        disabled={
                          !project.readyForApproval ||
                          approvingId === project.id
                        }
                        onClick={() => handleApprove(project)}
                      >
                        {approvingId === project.id
                          ? "Approving..."
                          : project.readyForApproval
                            ? "Approve Project"
                            : "Insufficient funds to approve"}
                      </button>
                    </div>
                  </article>
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
