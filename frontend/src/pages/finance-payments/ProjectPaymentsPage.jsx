import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DeleteConfirmModal from "../../components/finance-payments/DeleteConfirmModal";
import FinanceCard from "../../components/finance-payments/FinanceCard";
import FinanceForm from "../../components/finance-payments/FinanceForm";
import FinancePagination from "../../components/finance-payments/FinancePagination";
import FinanceTable from "../../components/finance-payments/FinanceTable";
import StatusBadge from "../../components/finance-payments/StatusBadge";
import {
  financePaymentsApi,
  getStoredFinanceUser,
  isFinanceManager,
  loadCommunityMembersForProject,
  loadProjectFinanceBundle,
  paginateItems,
} from "./services/financeModuleApi";
import {
  formatCurrency,
  formatDate,
  getProjectStatusLabel,
} from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-payments.css";

const createContributionForm = (userId = "", memberId = "") => ({
  memberId: userId || memberId || "",
  paymentType: "JOINING",
  method: "BANK",
  amount: "",
  month: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
});

const createFundRecordForm = (sourceId = "") => ({
  sourceId,
  amount: "",
  status: "PENDING",
  date: new Date().toISOString().slice(0, 10),
  note: "",
});

const createMaintenanceForm = () => ({
  amount: "",
  category: "REPAIR",
  date: new Date().toISOString().slice(0, 10),
  description: "",
});

export default function ProjectPaymentsPage() {
  const { projectId } = useParams();
  const user = getStoredFinanceUser();
  const managerView = isFinanceManager(user?.role);
  const [bundle, setBundle] = useState(null);
  const [communityMembers, setCommunityMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [contributionForm, setContributionForm] = useState(createContributionForm());
  const [fundRecordForm, setFundRecordForm] = useState(createFundRecordForm());
  const [maintenanceForm, setMaintenanceForm] = useState(createMaintenanceForm());

  const [editingContributionId, setEditingContributionId] = useState("");
  const [editingFundRecordId, setEditingFundRecordId] = useState("");
  const [editingMaintenanceId, setEditingMaintenanceId] = useState("");

  const [contributionPage, setContributionPage] = useState(1);
  const [fundRecordPage, setFundRecordPage] = useState(1);
  const [maintenancePage, setMaintenancePage] = useState(1);

  const [saving, setSaving] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadBundle = async () => {
    try {
      setLoading(true);
      setError("");
      const nextBundle = await loadProjectFinanceBundle(projectId);
      const members = await loadCommunityMembersForProject(nextBundle.project, user?.role);
      setBundle(nextBundle);
      setCommunityMembers(members);

      setContributionForm((current) => ({
        ...createContributionForm(
          managerView ? "" : user?.id,
          members[0]?._id || "",
        ),
        memberId: managerView
          ? current.memberId || members[0]?._id || ""
          : user?.id || "",
      }));
      setFundRecordForm((current) =>
        createFundRecordForm(current.sourceId || nextBundle.fundSources?.[0]?._id || ""),
      );
      setMaintenanceForm(createMaintenanceForm());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBundle();
  }, [projectId]);

  const visibleContributions = useMemo(() => {
    const list = bundle?.contributions || [];
    if (managerView) return list;
    return list.filter((item) => (item.memberId?._id || item.memberId) === user?.id);
  }, [bundle?.contributions, managerView, user?.id]);

  const contributionRows = useMemo(
    () => paginateItems(visibleContributions, contributionPage, 5),
    [contributionPage, visibleContributions],
  );
  const fundRecordRows = useMemo(
    () => paginateItems(bundle?.fundRecords || [], fundRecordPage, 5),
    [bundle?.fundRecords, fundRecordPage],
  );
  const maintenanceRows = useMemo(
    () => paginateItems(bundle?.maintenanceRecords || [], maintenancePage, 5),
    [bundle?.maintenanceRecords, maintenancePage],
  );

  const resetContributionForm = () => {
    setEditingContributionId("");
    setContributionForm(
      createContributionForm(
        managerView ? "" : user?.id,
        communityMembers[0]?._id || "",
      ),
    );
  };

  const resetFundRecordForm = () => {
    setEditingFundRecordId("");
    setFundRecordForm(createFundRecordForm(bundle?.fundSources?.[0]?._id || ""));
  };

  const resetMaintenanceForm = () => {
    setEditingMaintenanceId("");
    setMaintenanceForm(createMaintenanceForm());
  };

  const contributionFields = [
    managerView
      ? {
          name: "memberId",
          label: "Member",
          type: "select",
          options: (communityMembers || []).map((member) => ({
            value: member._id,
            label: member.name,
          })),
        }
      : {
          name: "memberName",
          label: "Member",
          type: "text",
          disabled: true,
        },
    {
      name: "paymentType",
      label: "Payment Type",
      type: "select",
      options: [
        { value: "JOINING", label: "Joining" },
        { value: "MONTHLY_MAINTENANCE", label: "Monthly Maintenance" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      name: "method",
      label: "Method",
      type: "select",
      options: [
        { value: "CASH", label: "Cash" },
        { value: "BANK", label: "Bank" },
        { value: "TRANSFER", label: "Transfer" },
      ],
    },
    { name: "amount", label: "Amount", type: "number", required: true, min: 0 },
    { name: "month", label: "Month", type: "month" },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "note", label: "Note", type: "textarea", fullWidth: true, rows: 3 },
  ];

  const fundRecordFields = [
    {
      name: "sourceId",
      label: "Funding Source",
      type: "select",
      options: (bundle?.fundSources || []).map((source) => ({
        value: source._id,
        label: source.fundName,
      })),
    },
    { name: "amount", label: "Amount", type: "number", required: true, min: 0 },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "PENDING", label: "Pending" },
        { value: "RECEIVED", label: "Received" },
        { value: "REJECTED", label: "Rejected" },
      ],
    },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "note", label: "Note", type: "textarea", fullWidth: true, rows: 3 },
  ];

  const maintenanceFields = [
    { name: "amount", label: "Amount", type: "number", required: true, min: 0 },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: [
        { value: "REPAIR", label: "Repair" },
        { value: "SERVICE", label: "Service" },
        { value: "REPLACEMENT", label: "Replacement" },
        { value: "OTHER", label: "Other" },
      ],
    },
    { name: "date", label: "Date", type: "date", required: true },
    { name: "description", label: "Description", type: "textarea", fullWidth: true, rows: 3 },
  ];

  const handleContributionEdit = (item) => {
    setEditingContributionId(item._id);
    setContributionForm({
      memberId: item.memberId?._id || item.memberId || "",
      memberName: item.memberId?.name || user?.name || "",
      paymentType: item.paymentType || "JOINING",
      method: item.method || "BANK",
      amount: item.amount || "",
      month: item.month || "",
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      note: item.note || "",
    });
  };

  const handleFundRecordEdit = (item) => {
    setEditingFundRecordId(item._id);
    setFundRecordForm({
      sourceId: item.sourceId?._id || item.sourceId || "",
      amount: item.amount || "",
      status: item.status || "PENDING",
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      note: item.note || "",
    });
  };

  const handleMaintenanceEdit = (item) => {
    setEditingMaintenanceId(item._id);
    setMaintenanceForm({
      amount: item.amount || "",
      category: item.category || "REPAIR",
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: item.description || "",
    });
  };

  const handleContributionSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving("contribution");
      const payload = {
        memberId: managerView ? contributionForm.memberId : user?.id,
        projectId,
        paymentType: contributionForm.paymentType,
        method: contributionForm.method,
        amount: Number(contributionForm.amount),
        month: contributionForm.month,
        date: contributionForm.date,
        note: contributionForm.note,
      };

      if (editingContributionId) {
        await financePaymentsApi.updateMemberContribution(editingContributionId, payload);
        toast.success("Member contribution updated.");
      } else {
        await financePaymentsApi.createMemberContribution(payload);
        toast.success("Member contribution added.");
      }

      await loadBundle();
      resetContributionForm();
    } catch (err) {
      toast.error(err.message || "Failed to save member contribution.");
    } finally {
      setSaving("");
    }
  };

  const handleFundRecordSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving("fund-record");
      const payload = {
        projectId,
        sourceId: fundRecordForm.sourceId,
        amount: Number(fundRecordForm.amount),
        status: fundRecordForm.status,
        date: fundRecordForm.date,
        note: fundRecordForm.note,
      };

      if (editingFundRecordId) {
        await financePaymentsApi.updateFundRecord(editingFundRecordId, payload);
        toast.success("Funding record updated.");
      } else {
        await financePaymentsApi.createFundRecord(payload);
        toast.success("Funding record added.");
      }

      await loadBundle();
      resetFundRecordForm();
    } catch (err) {
      toast.error(err.message || "Failed to save funding record.");
    } finally {
      setSaving("");
    }
  };

  const handleMaintenanceSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving("maintenance");
      const payload = {
        projectId,
        amount: Number(maintenanceForm.amount),
        category: maintenanceForm.category,
        date: maintenanceForm.date,
        description: maintenanceForm.description,
      };

      if (editingMaintenanceId) {
        await financePaymentsApi.updateMaintenanceRecord(editingMaintenanceId, payload);
        toast.success("Maintenance record updated.");
      } else {
        await financePaymentsApi.createMaintenanceRecord(payload);
        toast.success("Maintenance record added.");
      }

      await loadBundle();
      resetMaintenanceForm();
    } catch (err) {
      toast.error(err.message || "Failed to save maintenance record.");
    } finally {
      setSaving("");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      if (deleteTarget.type === "contribution") {
        await financePaymentsApi.deleteMemberContribution(deleteTarget.item._id);
        if (editingContributionId === deleteTarget.item._id) resetContributionForm();
      }

      if (deleteTarget.type === "fund-record") {
        await financePaymentsApi.deleteFundRecord(deleteTarget.item._id);
        if (editingFundRecordId === deleteTarget.item._id) resetFundRecordForm();
      }

      if (deleteTarget.type === "maintenance") {
        await financePaymentsApi.deleteMaintenanceRecord(deleteTarget.item._id);
        if (editingMaintenanceId === deleteTarget.item._id) resetMaintenanceForm();
      }

      toast.success("Record deleted.");
      setDeleteTarget(null);
      await loadBundle();
    } catch (err) {
      toast.error(err.message || "Failed to delete record.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fp-page">
      <Toaster position="top-right" />
      <div className="fp-container">
        <div className="fp-header">
          <div>
            <h1 className="fp-title">{bundle?.project?.name || "Project Finance Details"}</h1>
            <p className="fp-subtitle">Funding, member contribution, and maintenance details for this project.</p>
          </div>
          <div className="fp-toolbar">
            <Link className="fp-button fp-button--secondary" to="/finance-payments/dashboard">
              Back
            </Link>
            <StatusBadge text={getProjectStatusLabel(bundle?.project, bundle?.summary)} />
          </div>
        </div>

        {loading ? <div className="fp-message fp-message--loading">Loading project finance details...</div> : null}
        {!loading && error ? <div className="fp-message fp-message--error">{error}</div> : null}

        {!loading && !error && bundle ? (
          <>
            <div className="fp-kpi-grid">
              <div className="fp-kpi">
                <div className="fp-kpi__label">Project Cost</div>
                <div className="fp-kpi__value">{formatCurrency(bundle.summary?.projectCost)}</div>
              </div>
              <div className="fp-kpi">
                <div className="fp-kpi__label">Available</div>
                <div className="fp-kpi__value">{formatCurrency(bundle.summary?.availableForInstallation)}</div>
              </div>
              <div className="fp-kpi">
                <div className="fp-kpi__label">Total Received</div>
                <div className="fp-kpi__value">{formatCurrency(bundle.summary?.totalReceived)}</div>
              </div>
              <div className="fp-kpi">
                <div className="fp-kpi__label">Maintenance Balance</div>
                <div className="fp-kpi__value">{formatCurrency(bundle.summary?.maintenanceFundBalance)}</div>
              </div>
            </div>

            <div className="fp-layout">
              <FinanceCard
                title="Funding Details"
                subtitle="Funding records and sources used for this project."
              >
                <FinanceTable
                  rows={fundRecordRows.items}
                  emptyText="No funding records found for this project."
                  columns={[
                    { key: "date", label: "Date", render: (item) => formatDate(item.date) },
                    { key: "source", label: "Funding Source", render: (item) => item.sourceId?.fundName || "-" },
                    { key: "amount", label: "Amount", render: (item) => formatCurrency(item.amount) },
                    { key: "status", label: "Status", render: (item) => <StatusBadge text={item.status} /> },
                    ...(managerView
                      ? [
                          {
                            key: "actions",
                            label: "Actions",
                            render: (item) => (
                              <div className="fp-toolbar">
                                <button type="button" className="fp-button fp-button--secondary" onClick={() => handleFundRecordEdit(item)}>
                                  Edit
                                </button>
                                <button type="button" className="fp-button fp-button--danger" onClick={() => setDeleteTarget({ type: "fund-record", item })}>
                                  Delete
                                </button>
                              </div>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
                <FinancePagination page={fundRecordRows.page} totalPages={fundRecordRows.totalPages} onPageChange={setFundRecordPage} />
              </FinanceCard>

              {managerView ? (
                <FinanceCard
                  title={editingFundRecordId ? "Edit Funding Record" : "Add Funding Record"}
                  subtitle="Save project funding details."
                >
                  <FinanceForm
                    fields={fundRecordFields}
                    values={fundRecordForm}
                    onChange={(name, value) => setFundRecordForm((current) => ({ ...current, [name]: value }))}
                    onSubmit={handleFundRecordSubmit}
                    submitLabel={saving === "fund-record" ? "Saving..." : editingFundRecordId ? "Update Funding Record" : "Add Funding Record"}
                    onCancel={editingFundRecordId ? resetFundRecordForm : undefined}
                  />
                </FinanceCard>
              ) : null}
            </div>

            <div className="fp-layout">
              <FinanceCard
                title={managerView ? "Member Contributions" : "My Payment History"}
                subtitle={managerView ? "All member contributions for this project." : "Only your own payments for this project."}
              >
                <FinanceTable
                  rows={contributionRows.items}
                  emptyText="No contribution records found."
                  columns={[
                    { key: "date", label: "Date", render: (item) => formatDate(item.date) },
                    { key: "member", label: "Member", render: (item) => item.memberId?.name || user?.name || "-" },
                    { key: "paymentType", label: "Payment Type" },
                    { key: "method", label: "Method" },
                    { key: "amount", label: "Amount", render: (item) => formatCurrency(item.amount) },
                    { key: "status", label: "Status", render: () => <StatusBadge text="Received" /> },
                    ...(managerView
                      ? [
                          {
                            key: "actions",
                            label: "Actions",
                            render: (item) => (
                              <div className="fp-toolbar">
                                <button type="button" className="fp-button fp-button--secondary" onClick={() => handleContributionEdit(item)}>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="fp-button fp-button--danger"
                                  onClick={() => setDeleteTarget({ type: "contribution", item })}
                                >
                                  Delete
                                </button>
                              </div>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
                <FinancePagination page={contributionRows.page} totalPages={contributionRows.totalPages} onPageChange={setContributionPage} />
              </FinanceCard>

              {managerView ? (
                <FinanceCard
                  title={editingContributionId ? "Edit Member Contribution" : "Add Member Contribution"}
                  subtitle="Use this form to save contribution details."
                >
                  <FinanceForm
                    fields={contributionFields}
                    values={{ ...contributionForm, memberName: user?.name || "" }}
                    onChange={(name, value) => setContributionForm((current) => ({ ...current, [name]: value }))}
                    onSubmit={handleContributionSubmit}
                    submitLabel={saving === "contribution" ? "Saving..." : editingContributionId ? "Update Contribution" : "Add Contribution"}
                    onCancel={editingContributionId ? resetContributionForm : undefined}
                  />
                </FinanceCard>
              ) : null}
            </div>

            <div className="fp-layout">
              <FinanceCard
                title="Maintenance Details"
                subtitle="Maintenance spending recorded for this project."
              >
                <FinanceTable
                  rows={maintenanceRows.items}
                  emptyText="No maintenance records found."
                  columns={[
                    { key: "date", label: "Date", render: (item) => formatDate(item.date) },
                    { key: "category", label: "Category" },
                    { key: "amount", label: "Amount", render: (item) => formatCurrency(item.amount) },
                    { key: "description", label: "Description" },
                    ...(managerView
                      ? [
                          {
                            key: "actions",
                            label: "Actions",
                            render: (item) => (
                              <div className="fp-toolbar">
                                <button type="button" className="fp-button fp-button--secondary" onClick={() => handleMaintenanceEdit(item)}>
                                  Edit
                                </button>
                                <button type="button" className="fp-button fp-button--danger" onClick={() => setDeleteTarget({ type: "maintenance", item })}>
                                  Delete
                                </button>
                              </div>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
                <FinancePagination page={maintenanceRows.page} totalPages={maintenanceRows.totalPages} onPageChange={setMaintenancePage} />
              </FinanceCard>

              {managerView ? (
                <FinanceCard
                  title={editingMaintenanceId ? "Edit Maintenance" : "Add Maintenance"}
                  subtitle="Save maintenance details for this project."
                >
                  <FinanceForm
                    fields={maintenanceFields}
                    values={maintenanceForm}
                    onChange={(name, value) => setMaintenanceForm((current) => ({ ...current, [name]: value }))}
                    onSubmit={handleMaintenanceSubmit}
                    submitLabel={saving === "maintenance" ? "Saving..." : editingMaintenanceId ? "Update Maintenance" : "Add Maintenance"}
                    onCancel={editingMaintenanceId ? resetMaintenanceForm : undefined}
                  />
                </FinanceCard>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      <DeleteConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Record"
        message="Are you sure you want to delete this record?"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
