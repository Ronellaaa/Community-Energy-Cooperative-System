import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FinanceCard from "../../components/finance-payments/FinanceCard";
import StatusBadge from "../../components/finance-payments/StatusBadge";
import FinancePagination from "../../components/finance-payments/FinancePagination";
import {
  loadFinanceProjects,
  loadProjectFinanceBundle,
  paginateItems,
} from "./services/financeModuleApi";
import {
  formatCurrency,
  getProjectStatusLabel,
} from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-payments.css";

export default function FinanceDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [firstProjectSummary, setFirstProjectSummary] = useState(null);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const allProjects = await loadFinanceProjects();
        if (ignore) return;

        setProjects(allProjects);

        if (allProjects[0]?._id) {
          const bundle = await loadProjectFinanceBundle(allProjects[0]._id);
          if (!ignore) {
            setFirstProjectSummary(bundle.summary);
          }
        } else {
          setFirstProjectSummary(null);
        }
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
  }, []);

  const paginated = useMemo(() => paginateItems(projects, page, 6), [page, projects]);

  return (
    <div className="fp-page">
      <div className="fp-container">
        <div className="fp-header">
          <div>
            <h1 className="fp-title">Finance & Payments</h1>
            <p className="fp-subtitle">
              Manage fund sources, records, maintenance, and member contributions.
            </p>
          </div>
          <div className="fp-toolbar">
            <Link className="fp-button" to="/finance-payments/fund-sources">Fund Sources</Link>
            <Link className="fp-button" to="/finance-payments/fund-records">Fund Records</Link>
            <Link className="fp-button" to="/finance-payments/member-contributions">Member Contributions</Link>
            <Link className="fp-button" to="/finance-payments/maintenance">Maintenance</Link>
          </div>
        </div>

        {loading ? <div className="fp-message fp-message--loading">Loading finance data...</div> : null}
        {!loading && error ? <div className="fp-message fp-message--error">{error}</div> : null}

        {!loading && !error ? (
          <>
            <div className="fp-kpi-grid">
              <div className="fp-kpi">
                <div className="fp-kpi__label">Projects</div>
                <div className="fp-kpi__value">{projects.length}</div>
              </div>
              <div className="fp-kpi">
                <div className="fp-kpi__label">Project Cost</div>
                <div className="fp-kpi__value">{formatCurrency(firstProjectSummary?.projectCost)}</div>
              </div>
              <div className="fp-kpi">
                <div className="fp-kpi__label">Available For Installation</div>
                <div className="fp-kpi__value">{formatCurrency(firstProjectSummary?.availableForInstallation)}</div>
              </div>
              <div className="fp-kpi">
                <div className="fp-kpi__label">Maintenance Balance</div>
                <div className="fp-kpi__value">{formatCurrency(firstProjectSummary?.maintenanceFundBalance)}</div>
              </div>
            </div>

            <FinanceCard
              title="Projects"
              subtitle="Open a project to view finance details."
            >
              {!paginated.items.length ? (
                <div className="fp-empty">No projects available.</div>
              ) : (
                <>
                  <div className="fp-grid fp-grid--3">
                    {paginated.items.map((project) => {
                      const target = project.cost || 0;
                      const collected = project.financeSummary?.availableForInstallation ?? project.totalFunding ?? 0;
                      const percentage = target ? Math.min(100, Math.round((collected / target) * 100)) : 0;
                      const statusLabel = getProjectStatusLabel(project, {
                        projectCost: target,
                        availableForInstallation: collected,
                      });

                      return (
                        <FinanceCard
                          key={project._id}
                          title={project.name}
                          subtitle={project.type}
                          action={<StatusBadge text={statusLabel} />}
                        >
                          <div className="fp-project-card">
                            <div className="fp-summary">
                              <span className="fp-summary__label">Target Amount</span>
                              <span className="fp-summary__value">{formatCurrency(project.cost)}</span>
                            </div>
                            <div className="fp-summary">
                              <span className="fp-summary__label">Collected Amount</span>
                              <span>{formatCurrency(collected)}</span>
                            </div>
                            <div className="fp-progress">
                              <div className="fp-progress__bar" style={{ width: `${percentage}%` }} />
                            </div>
                            <div className="fp-toolbar">
                              <Link className="fp-button" to={`/finance-payments/project/${project._id}`}>
                                View Project
                              </Link>
                            </div>
                          </div>
                        </FinanceCard>
                      );
                    })}
                  </div>
                  <FinancePagination page={paginated.page} totalPages={paginated.totalPages} onPageChange={setPage} />
                </>
              )}
            </FinanceCard>
          </>
        ) : null}
      </div>
    </div>
  );
}
