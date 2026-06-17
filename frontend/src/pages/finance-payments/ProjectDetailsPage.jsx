import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import MemberPaymentForm from "./forms/MemberPaymentForm";
import EmptyState from "../../components/finance-payments/EmptyState";
import PaginationBar from "../../components/finance-payments/PaginationBar";
import ProgressCard from "../../components/finance-payments/ProgressCard";
import SectionHeader from "../../components/finance-payments/SectionHeader";
import StatusBadge from "../../components/finance-payments/StatusBadge";
import {
  buildProjectBundle,
  financeRequest,
  getCurrentAuthUser,
  loadFinanceProjects,
  paginateItems,
} from "./services/financeModuleApi";
import { formatDate, formatLKR } from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-module.css";

const defaultPaymentForm = (userId) => ({
  memberId: userId || "",
  paymentType: "JOINING",
  method: "BANK",
  amount: "",
  month: new Date().toISOString().slice(0, 7),
  date: new Date().toISOString().slice(0, 10),
  note: "",
});

export default function ProjectDetailsPage({ projectId: projectIdProp }) {
  const { projectId: projectIdFromRoute } = useParams();
  const user = getCurrentAuthUser();
  const isManager = user?.role === "ADMIN" || user?.role === "OFFICER";
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectIdProp || projectIdFromRoute || "");
  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState(defaultPaymentForm(user?.id));
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [recordsPage, setRecordsPage] = useState(1);
  const [approvalLoading, setApprovalLoading] = useState(false);

  const userVisibleProjects = useMemo(
    () =>
      availableProjects.filter((project) =>
        (project.assignedMembers || []).some((member) => (member._id || member.id || member) === user?.id),
      ),
    [availableProjects, user?.id],
  );
  const projectChoices = isManager ? availableProjects : userVisibleProjects;

  useEffect(() => {
    let ignore = false;

    const loadProjects = async () => {
      try {
        const projects = await loadFinanceProjects();
        if (ignore) return;
        setAvailableProjects(projects);
        const visibleProjects = isManager
          ? projects
          : projects.filter((project) =>
              (project.assignedMembers || []).some((member) => (member._id || member.id || member) === user?.id),
            );
        const requestedProjectId = projectIdProp || projectIdFromRoute || selectedProjectId;
        const canKeepSelected = visibleProjects.some((project) => project.id === requestedProjectId);
        setSelectedProjectId(canKeepSelected ? requestedProjectId : visibleProjects[0]?.id || "");
      } catch (err) {
        if (!ignore) setError(err.message);
      }
    };

    loadProjects();
    return () => {
      ignore = true;
    };
  }, [isManager, projectIdFromRoute, projectIdProp, selectedProjectId, user?.id]);

  useEffect(() => {
    let ignore = false;
    if (!selectedProjectId) return;

    const loadBundle = async () => {
      try {
        setLoading(true);
        setError("");
        if (
          !isManager &&
          availableProjects.length > 0 &&
          !userVisibleProjects.some((project) => project.id === selectedProjectId)
        ) {
          throw new Error("You do not have access to this project's finance details.");
        }
        const nextBundle = await buildProjectBundle(selectedProjectId);
        if (!ignore) setBundle(nextBundle);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadBundle();
    return () => {
      ignore = true;
    };
  }, [availableProjects.length, isManager, selectedProjectId, userVisibleProjects]);

  const setField = (name, value) => {
    setPaymentForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddMyPayment = async (event) => {
    event.preventDefault();
    try {
      await financeRequest("/api/member-payments", {
        method: "POST",
        body: {
          ...paymentForm,
          projectId: selectedProjectId,
          amount: Number(paymentForm.amount),
          memberId: user.id,
        },
      });
      setShowPaymentForm(false);
      setPaymentForm(defaultPaymentForm(user.id));
      setBundle(await buildProjectBundle(selectedProjectId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleApproveProject = async () => {
    if (!bundle?.project?._id) return;

    try {
      setApprovalLoading(true);
      setError("");
      await financeRequest(`/api/projects/${bundle.project._id}/approve`, { method: "PATCH" });
      setBundle(await buildProjectBundle(selectedProjectId));
      setAvailableProjects(await loadFinanceProjects());
    } catch (err) {
      setError(err.message);
    } finally {
      setApprovalLoading(false);
    }
  };

  const myContributions = useMemo(
    () => (bundle?.memberPayments || []).filter((payment) => (payment.memberId?._id || payment.memberId) === user?.id),
    [bundle?.memberPayments, user?.id],
  );

  const visiblePayments = isManager ? bundle?.memberPayments || [] : myContributions;
  const paginatedPayments = useMemo(
    () => paginateItems(visiblePayments, paymentsPage, 6),
    [paymentsPage, visiblePayments],
  );
  const paginatedRecords = useMemo(
    () => paginateItems(bundle?.fundingRecords || [], recordsPage, 6),
    [bundle?.fundingRecords, recordsPage],
  );

  if (!selectedProjectId && !loading) {
    return (
      <div className="fp-page">
        <div className="fp-shell">
          <EmptyState
            title="No project selected"
            description="Choose a project first before viewing project-level finance details."
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
            <h1 className="fp-title">{bundle?.project?.name || "Project Details"}</h1>
            <p className="fp-subtitle">
              Project-specific finance view with separate visibility for community users and
              finance managers.
            </p>
          </div>
          <div className="fp-toolbar">
            <select
              className="fp-chip-button"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
            >
              {projectChoices.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
            {bundle?.summary ? <StatusBadge status={projectChoices.find((item) => item.id === selectedProjectId)?.status || "Collecting Funds"} /> : null}
          </div>
        </div>

        {loading ? <EmptyState title="Loading project data" description="Fetching finance records from the backend." /> : null}
        {!loading && error ? <EmptyState title="Unable to load project details" description={error} /> : null}

        {!loading && !error && bundle ? (
          <>
            <div className="fp-stat-grid">
              <div className="fp-stat-card">
                <span>Project Type</span>
                <strong>{bundle.project.type}</strong>
              </div>
              <div className="fp-stat-card">
                <span>Target Amount</span>
                <strong>{formatLKR(bundle.summary.projectCost)}</strong>
              </div>
              <div className="fp-stat-card">
                <span>Collected Amount</span>
                <strong>{formatLKR(bundle.summary.availableForInstallation)}</strong>
              </div>
              <div className="fp-stat-card">
                <span>Officer Approval Status</span>
                <strong>
                  {bundle.summary.availableForInstallation >= bundle.summary.projectCost
                    ? "Ready for Approval"
                    : "Pending Officer Review"}
                </strong>
              </div>
            </div>

            <div className="fp-grid fp-grid--2">
              <ProgressCard
                title="Funding Progress"
                targetAmount={bundle.summary.projectCost}
                collectedAmount={bundle.summary.availableForInstallation}
                percentage={bundle.summary.projectCost
                  ? Math.min(100, Math.round((bundle.summary.availableForInstallation / bundle.summary.projectCost) * 100))
                  : 0}
              />

              <div className="fp-card fp-card--pad fp-stack">
                <SectionHeader title="Project Status" subtitle="Simple stage view based on current finance readiness." />
                <div className="fp-timeline">
                  {[
                    { label: "Collecting Funds", done: true },
                    { label: "Ready for Approval", done: bundle.summary.availableForInstallation >= bundle.summary.projectCost },
                    { label: "Approved", done: bundle.project.status === "Approved" || bundle.project.status === "Active" },
                    { label: "Active", done: bundle.project.status === "Active" },
                  ].map((step) => (
                    <div key={step.label} className="fp-timeline-item">
                      <span className={`fp-timeline-dot ${step.done ? "is-done" : ""}`} />
                      <div>
                        <strong>{step.label}</strong>
                        <p>{step.done ? "Reached" : "Pending"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!isManager ? (
              <div className="fp-card fp-card--pad fp-stack">
                <SectionHeader
                  title="My Contributions"
                  subtitle="Only the logged-in user's own payment log is visible here."
                  action={
                    <button type="button" className="fp-button" onClick={() => setShowPaymentForm((current) => !current)}>
                      Add My Payment
                    </button>
                  }
                />

                {showPaymentForm ? (
                  <MemberPaymentForm
                    role={user.role}
                    value={paymentForm}
                    onChange={setField}
                    onSubmit={handleAddMyPayment}
                    members={(bundle.project.assignedMembers || []).map((member) => ({
                      id: member._id,
                      name: member.name,
                    }))}
                    currentUserName={user.name}
                    submitLabel="Submit My Payment"
                  />
                ) : null}

                {paginatedPayments.items.length === 0 ? (
                  <EmptyState
                    title="No contributions yet"
                    description="Your own payment submissions for this project will appear here."
                  />
                ) : (
                  <>
                    <div className="fp-table-wrap">
                      <table className="fp-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Payment Type</th>
                            <th>Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedPayments.items.map((payment) => (
                            <tr key={payment._id}>
                              <td>{formatDate(payment.date)}</td>
                              <td>{formatLKR(payment.amount)}</td>
                              <td>{payment.method}</td>
                              <td>{payment.paymentType}</td>
                              <td>{payment.note || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <PaginationBar
                      page={paginatedPayments.page}
                      totalPages={paginatedPayments.totalPages}
                      onPageChange={setPaymentsPage}
                    />
                  </>
                )}
              </div>
            ) : (
              <div className="fp-stack">
                <div className="fp-grid fp-grid--3">
                  <div className="fp-stat-card">
                    <span>Funding Summary</span>
                    <strong>{formatLKR(bundle.summary.totalReceived + bundle.summary.totalPromised)}</strong>
                  </div>
                  <div className="fp-stat-card">
                    <span>Maintenance Summary</span>
                    <strong>{formatLKR(bundle.summary.maintenanceFundBalance)}</strong>
                  </div>
                  <div className="fp-stat-card">
                    <span>Approval Status</span>
                    <strong>{bundle.summary.availableForInstallation >= bundle.summary.projectCost ? "Ready for Approval" : "Insufficient funds to approve"}</strong>
                  </div>
                </div>

                <div className="fp-card fp-card--pad fp-stack">
                  <SectionHeader title="Member Payments" subtitle="Full payment list for finance managers." />
                  <div className="fp-table-wrap">
                    <table className="fp-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Member</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPayments.items.map((payment) => (
                          <tr key={payment._id}>
                            <td>{formatDate(payment.date)}</td>
                            <td>{payment.memberId?.name || "Member"}</td>
                            <td>{formatLKR(payment.amount)}</td>
                            <td>{payment.method}</td>
                            <td>{payment.paymentType}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <PaginationBar
                    page={paginatedPayments.page}
                    totalPages={paginatedPayments.totalPages}
                    onPageChange={setPaymentsPage}
                  />
                </div>

                <div className="fp-grid fp-grid--2">
                  <div className="fp-card fp-card--pad fp-stack">
                    <SectionHeader title="Funding Records" subtitle="Full funding records for the selected project." />
                    <div className="fp-table-wrap">
                      <table className="fp-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Source</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedRecords.items.map((record) => (
                            <tr key={record._id}>
                              <td>{formatDate(record.date)}</td>
                              <td>{record.sourceId?.fundName || "Funding Source"}</td>
                              <td>{formatLKR(record.amount)}</td>
                              <td>{record.status}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <PaginationBar
                      page={paginatedRecords.page}
                      totalPages={paginatedRecords.totalPages}
                      onPageChange={setRecordsPage}
                    />
                  </div>

                  <div className="fp-card fp-card--pad fp-stack">
                    <SectionHeader title="Maintenance Summary" subtitle="Maintenance expense records and balance." />
                    {bundle.maintenanceExpenses.length === 0 ? (
                      <EmptyState title="No maintenance expenses" description="No maintenance spending has been recorded for this project." />
                    ) : (
                      <div className="fp-inline-list">
                        {bundle.maintenanceExpenses.map((expense) => (
                          <div key={expense._id} className="fp-inline-item">
                            <div className="fp-inline-item-head">
                              <strong>{expense.category}</strong>
                              <span>{formatLKR(expense.amount)}</span>
                            </div>
                            <p>{expense.description}</p>
                            <span>{formatDate(expense.date)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="fp-actions">
                      <button
                        type="button"
                        className={bundle.summary.availableForInstallation >= bundle.summary.projectCost ? "fp-button" : "fp-button-secondary"}
                        disabled={bundle.summary.availableForInstallation < bundle.summary.projectCost || approvalLoading}
                        onClick={handleApproveProject}
                      >
                        {approvalLoading
                          ? "Approving..."
                          : bundle.summary.availableForInstallation >= bundle.summary.projectCost
                            ? "Approve Project"
                          : "Insufficient funds to approve"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
