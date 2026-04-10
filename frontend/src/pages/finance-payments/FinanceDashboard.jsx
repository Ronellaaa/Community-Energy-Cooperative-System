import React, { useEffect, useMemo, useState } from "react";
import { CreditCard, HandCoins, Landmark, Plus, Wrench } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import ActionToolbar from "../../components/finance-payments/ActionToolbar";
import EmptyState from "../../components/finance-payments/EmptyState";
import PaginationBar from "../../components/finance-payments/PaginationBar";
import SectionHeader from "../../components/finance-payments/SectionHeader";
import FundingRecordForm from "./forms/FundingRecordForm";
import FundingSourceForm from "./forms/FundingSourceForm";
import MaintenanceExpenseForm from "./forms/MaintenanceExpenseForm";
import MemberPaymentForm from "./forms/MemberPaymentForm";
import {
  buildProjectBundle,
  financeRequest,
  getCurrentAuthUser,
  loadFinanceProjects,
  paginateItems,
} from "./services/financeModuleApi";
import { formatDate, formatLKR } from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-module.css";

const sourceDefaults = {
  fundName: "",
  fundType: "GRANT",
  contactPhone: "",
  description: "",
  isActive: true,
};

const recordDefaults = {
  sourceId: "",
  amount: "",
  status: "PENDING",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const paymentDefaults = {
  memberId: "",
  paymentType: "JOINING",
  method: "BANK",
  amount: "",
  month: new Date().toISOString().slice(0, 7),
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

const expenseDefaults = {
  amount: "",
  category: "REPAIR",
  date: new Date().toISOString().slice(0, 10),
  description: "",
};

const getStatusTone = (value) => {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "ACTIVE" || normalized === "RECEIVED" || normalized === "READY FOR APPROVAL") {
    return "success";
  }
  if (normalized === "PENDING" || normalized === "COLLECTING FUNDS") {
    return "warning";
  }
  if (normalized === "REJECTED" || normalized === "INACTIVE") {
    return "danger";
  }
  return "info";
};

const entityLabelByTab = {
  sources: "Funding source",
  records: "Funding record",
  payments: "Member payment",
  expenses: "Maintenance expense",
};

export default function FinanceDashboard() {
  const user = getCurrentAuthUser();
  const isManager = user?.role === "ADMIN" || user?.role === "OFFICER";
  const [activeTab, setActiveTab] = useState("sources");
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [bundle, setBundle] = useState(null);
  const [fundingSources, setFundingSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [editingItem, setEditingItem] = useState(null);
  const [sourceForm, setSourceForm] = useState(sourceDefaults);
  const [recordForm, setRecordForm] = useState(recordDefaults);
  const [paymentForm, setPaymentForm] = useState(paymentDefaults);
  const [expenseForm, setExpenseForm] = useState(expenseDefaults);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [projectList, sourcesRes] = await Promise.all([
          loadFinanceProjects(),
          financeRequest("/api/funding-sources"),
        ]);
        if (ignore) return;
        setProjects(projectList);
        setFundingSources(sourcesRes.data || []);
        setSelectedProjectId((current) => current || projectList[0]?.id || "");
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    if (isManager) load();
    return () => {
      ignore = true;
    };
  }, [isManager]);

  useEffect(() => {
    let ignore = false;
    if (!selectedProjectId || !isManager) return;

    const loadBundle = async () => {
      try {
        setLoading(true);
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
  }, [isManager, selectedProjectId]);

  useEffect(() => {
    if (fundingSources.length > 0) {
      setRecordForm((current) => ({
        ...current,
        sourceId: current.sourceId || fundingSources[0]._id || fundingSources[0].id,
      }));
    }
  }, [fundingSources]);

  useEffect(() => {
    if (bundle?.project?.assignedMembers?.length) {
      const firstMember = bundle.project.assignedMembers[0];
      setPaymentForm((current) => ({
        ...current,
        memberId: current.memberId || firstMember._id,
      }));
    }
  }, [bundle?.project?.assignedMembers]);

  const activeRows = useMemo(() => {
    if (activeTab === "sources") return fundingSources;
    if (activeTab === "records") return bundle?.fundingRecords || [];
    if (activeTab === "payments") return bundle?.memberPayments || [];
    return bundle?.maintenanceExpenses || [];
  }, [activeTab, bundle?.fundingRecords, bundle?.maintenanceExpenses, bundle?.memberPayments, fundingSources]);

  const paginated = useMemo(() => paginateItems(activeRows, page, 6), [activeRows, page]);

  const refreshBundle = async () => {
    if (!selectedProjectId) return;
    const [bundleRes, sourcesRes, projectList] = await Promise.all([
      buildProjectBundle(selectedProjectId),
      financeRequest("/api/funding-sources"),
      loadFinanceProjects(),
    ]);
    setBundle(bundleRes);
    setFundingSources(sourcesRes.data || []);
    setProjects(projectList);
  };

  const resetForms = () => {
    setEditingItem(null);
    setSourceForm(sourceDefaults);
    setRecordForm((current) => ({ ...recordDefaults, sourceId: current.sourceId || fundingSources[0]?._id || "" }));
    setPaymentForm((current) => ({
      ...paymentDefaults,
      memberId: bundle?.project?.assignedMembers?.[0]?._id || current.memberId || "",
    }));
    setExpenseForm(expenseDefaults);
  };

  const setField = (setter) => (name, value) => setter((current) => ({ ...current, [name]: value }));

  const startAdd = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
    resetForms();
  };

  const startEdit = (item) => {
    setEditingItem(item);
    if (activeTab === "sources") {
      setSourceForm({
        fundName: item.fundName || "",
        fundType: item.fundType || "GRANT",
        contactPhone: item.contactPhone || "",
        description: item.description || "",
        isActive: Boolean(item.isActive),
      });
    }
    if (activeTab === "records") {
      setRecordForm({
        sourceId: item.sourceId?._id || item.sourceId || "",
        amount: String(item.amount || ""),
        status: item.status || "PENDING",
        date: new Date(item.date).toISOString().slice(0, 10),
        note: item.note || "",
      });
    }
    if (activeTab === "payments") {
      setPaymentForm({
        memberId: item.memberId?._id || item.memberId || "",
        paymentType: item.paymentType || "JOINING",
        method: item.method || "BANK",
        amount: String(item.amount || ""),
        month: String(item.month || "").slice(0, 7),
        date: new Date(item.date).toISOString().slice(0, 10),
        note: item.note || "",
      });
    }
    if (activeTab === "expenses") {
      setExpenseForm({
        amount: String(item.amount || ""),
        category: item.category || "REPAIR",
        date: new Date(item.date).toISOString().slice(0, 10),
        description: item.description || "",
      });
    }
  };

  const handleDelete = async (id) => {
    const entityLabel = entityLabelByTab[activeTab] || "Item";
    const confirmed = window.confirm(`Are you sure you want to delete this ${entityLabel.toLowerCase()}?`);
    if (!confirmed) return;

    try {
      if (activeTab === "sources") await financeRequest(`/api/funding-sources/${id}`, { method: "DELETE" });
      if (activeTab === "records") await financeRequest(`/api/funding-records/${id}`, { method: "DELETE" });
      if (activeTab === "payments") await financeRequest(`/api/member-payments/${id}`, { method: "DELETE" });
      if (activeTab === "expenses") await financeRequest(`/api/maintenance-expenses/${id}`, { method: "DELETE" });
      await refreshBundle();
      resetForms();
      toast.success(`${entityLabel} deleted successfully.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || `Failed to delete ${entityLabel.toLowerCase()}.`);
    }
  };

  const submitSource = async (event) => {
    event.preventDefault();
    try {
      const isEditing = Boolean(editingItem?._id);
      if (editingItem?._id) {
        await financeRequest(`/api/funding-sources/${editingItem._id}`, { method: "PUT", body: sourceForm });
      } else {
        await financeRequest("/api/funding-sources", { method: "POST", body: sourceForm });
      }
      await refreshBundle();
      resetForms();
      toast.success(`Funding source ${isEditing ? "updated" : "saved"} successfully.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to save funding source.");
    }
  };

  const submitRecord = async (event) => {
    event.preventDefault();
    try {
      const isEditing = Boolean(editingItem?._id);
      const payload = { ...recordForm, amount: Number(recordForm.amount), projectId: selectedProjectId };
      if (editingItem?._id) {
        await financeRequest(`/api/funding-records/${editingItem._id}`, { method: "PUT", body: payload });
      } else {
        await financeRequest("/api/funding-records", { method: "POST", body: payload });
      }
      await refreshBundle();
      resetForms();
      toast.success(`Funding record ${isEditing ? "updated" : "saved"} successfully.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to save funding record.");
    }
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    try {
      const isEditing = Boolean(editingItem?._id);
      const payload = { ...paymentForm, amount: Number(paymentForm.amount), projectId: selectedProjectId };
      if (editingItem?._id) {
        await financeRequest(`/api/member-payments/${editingItem._id}`, { method: "PUT", body: payload });
      } else {
        await financeRequest("/api/member-payments", { method: "POST", body: payload });
      }
      await refreshBundle();
      resetForms();
      toast.success(`Member payment ${isEditing ? "updated" : "saved"} successfully.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to save member payment.");
    }
  };

  const submitExpense = async (event) => {
    event.preventDefault();
    try {
      const isEditing = Boolean(editingItem?._id);
      const payload = { ...expenseForm, amount: Number(expenseForm.amount), projectId: selectedProjectId };
      if (editingItem?._id) {
        await financeRequest(`/api/maintenance-expenses/${editingItem._id}`, { method: "PUT", body: payload });
      } else {
        await financeRequest("/api/maintenance-expenses", { method: "POST", body: payload });
      }
      await refreshBundle();
      resetForms();
      toast.success(`Maintenance expense ${isEditing ? "updated" : "saved"} successfully.`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to save maintenance expense.");
    }
  };

  if (!isManager) {
    return (
      <div className="fp-page">
        <div className="fp-shell">
          <EmptyState
            title="Finance dashboard access restricted"
            description="This page is only available to admins and officers."
          />
        </div>
      </div>
    );
  }

  const renderRecordGrid = () => (
    <div className="fp-record-grid">
      {paginated.items.map((row) => (
        <article key={row._id || row.id} className="fp-record-card">
          {activeTab === "sources" ? (
            <>
              <div className="fp-record-card__head">
                <div>
                  <h3>{row.fundName}</h3>
                  <p>{row.contactPhone || "No contact phone"}</p>
                </div>
                <span className={`fp-pill fp-pill--${getStatusTone(row.isActive ? "ACTIVE" : "INACTIVE")}`}>
                  {row.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="fp-record-card__grid">
                <div className="fp-record-card__metric">
                  <span>Fund Type</span>
                  <strong>{row.fundType}</strong>
                </div>
                <div className="fp-record-card__metric fp-record-card__metric--wide">
                  <span>Description</span>
                  <strong>{row.description || "No description provided"}</strong>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "records" ? (
            <>
              <div className="fp-record-card__head">
                <div>
                  <h3>{row.sourceId?.fundName || "Funding Source"}</h3>
                  <p>{formatDate(row.date)}</p>
                </div>
                <span className={`fp-pill fp-pill--${getStatusTone(row.status)}`}>{row.status}</span>
              </div>
              <div className="fp-record-card__grid">
                <div className="fp-record-card__metric">
                  <span>Amount</span>
                  <strong>{formatLKR(row.amount)}</strong>
                </div>
                <div className="fp-record-card__metric fp-record-card__metric--wide">
                  <span>Note</span>
                  <strong>{row.note || "No note added"}</strong>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "payments" ? (
            <>
              <div className="fp-record-card__head">
                <div>
                  <h3>{row.memberId?.name || "Member"}</h3>
                  <p>{formatDate(row.date)}</p>
                </div>
                <span className={`fp-pill fp-pill--${getStatusTone("ACTIVE")}`}>{row.method}</span>
              </div>
              <div className="fp-record-card__grid">
                <div className="fp-record-card__metric">
                  <span>Amount</span>
                  <strong>{formatLKR(row.amount)}</strong>
                </div>
                <div className="fp-record-card__metric">
                  <span>Payment Type</span>
                  <strong>{row.paymentType}</strong>
                </div>
                <div className="fp-record-card__metric">
                  <span>Month</span>
                  <strong>{row.month || "-"}</strong>
                </div>
                <div className="fp-record-card__metric fp-record-card__metric--wide">
                  <span>Note</span>
                  <strong>{row.note || "No note added"}</strong>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "expenses" ? (
            <>
              <div className="fp-record-card__head">
                <div>
                  <h3>{row.category}</h3>
                  <p>{formatDate(row.date)}</p>
                </div>
                <span className={`fp-pill fp-pill--${getStatusTone("PENDING")}`}>Expense</span>
              </div>
              <div className="fp-record-card__grid">
                <div className="fp-record-card__metric">
                  <span>Amount</span>
                  <strong>{formatLKR(row.amount)}</strong>
                </div>
                <div className="fp-record-card__metric fp-record-card__metric--wide">
                  <span>Description</span>
                  <strong>{row.description || "No description added"}</strong>
                </div>
              </div>
            </>
          ) : null}

          <div className="fp-record-card__actions">
            <button type="button" className="fp-action-button fp-action-button--edit" onClick={() => startEdit(row)}>
              Edit
            </button>
            <button
              type="button"
              className="fp-action-button fp-action-button--delete"
              onClick={() => handleDelete(row._id || row.id)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className="fp-page">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2800,
          style: {
            background: "rgba(11, 23, 49, 0.92)",
            color: "#eff6ff",
            border: "1px solid rgba(193, 218, 255, 0.18)",
            borderRadius: "14px",
            backdropFilter: "blur(14px)",
          },
          success: {
            iconTheme: {
              primary: "#67d8a9",
              secondary: "#0b1731",
            },
          },
          error: {
            iconTheme: {
              primary: "#ff8ea3",
              secondary: "#0b1731",
            },
          },
        }}
      />
      <div className="fp-shell fp-stack">
        <div className="fp-page-head">
          <div>
            <div className="fp-eyebrow">Finance & Payments</div>
            <h1 className="fp-title">Finance Dashboard</h1>
            <p className="fp-subtitle">
              Monitor funding, track payments, and manage expenses across all projects in one place.
            </p>
          </div>
          <div className="fp-toolbar">
            <select
              className="fp-chip-button"
              value={selectedProjectId}
              onChange={(event) => {
                setSelectedProjectId(event.target.value);
                setPage(1);
                resetForms();
              }}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
        </div>

        <ActionToolbar
          actions={[
            { label: "Add Funding Source", icon: <Plus size={16} />, onClick: () => startAdd("sources") },
            { label: "Add Funding Record", icon: <Plus size={16} />, onClick: () => startAdd("records") },
            { label: "Add Member Payment", icon: <Plus size={16} />, onClick: () => startAdd("payments") },
            { label: "Add Maintenance Expense", icon: <Plus size={16} />, onClick: () => startAdd("expenses") },
          ]}
        />

        {loading ? <EmptyState title="Loading dashboard" description="Fetching live finance data from the backend." /> : null}
        {!loading && error ? <EmptyState title="Unable to load finance data" description={error} /> : null}

        {!loading && !error ? (
          <div className="fp-split">
            <div className="fp-card fp-card--pad fp-stack">
              <SectionHeader
                title="Management Sections"
                subtitle="View, add, edit, and delete finance data inside the selected section."
              />

              <div className="fp-tabbar">
                <button type="button" className={activeTab === "sources" ? "is-active" : ""} onClick={() => setActiveTab("sources")}>Funding Sources</button>
                <button type="button" className={activeTab === "records" ? "is-active" : ""} onClick={() => setActiveTab("records")}>Funding Records</button>
                <button type="button" className={activeTab === "payments" ? "is-active" : ""} onClick={() => setActiveTab("payments")}>Member Payments</button>
                <button type="button" className={activeTab === "expenses" ? "is-active" : ""} onClick={() => setActiveTab("expenses")}>Maintenance Expenses</button>
              </div>

              {paginated.items.length === 0 ? (
                <EmptyState
                  title="No records in this section"
                  description="Use the form panel to create the first item."
                />
              ) : (
                <>
                  {renderRecordGrid()}
                  <PaginationBar page={paginated.page} totalPages={paginated.totalPages} onPageChange={setPage} />
                </>
              )}
            </div>

            <div className="fp-card fp-card--pad fp-stack">
              <SectionHeader
                title={`${editingItem ? "Edit" : "Add"} ${activeTab === "sources" ? "Funding Source" : activeTab === "records" ? "Funding Record" : activeTab === "payments" ? "Member Payment" : "Maintenance Expense"}`}
                subtitle="Fill in the details and save your changes"
              />

              {activeTab === "sources" ? (
                <FundingSourceForm value={sourceForm} onChange={setField(setSourceForm)} onSubmit={submitSource} submitLabel={editingItem ? "Update Funding Source" : "Save Funding Source"} />
              ) : null}
              {activeTab === "records" ? (
                <FundingRecordForm value={recordForm} onChange={setField(setRecordForm)} onSubmit={submitRecord} sources={fundingSources.map((source) => ({ id: source._id, fundName: source.fundName }))} submitLabel={editingItem ? "Update Funding Record" : "Save Funding Record"} />
              ) : null}
              {activeTab === "payments" ? (
                <MemberPaymentForm role={user.role} value={paymentForm} onChange={setField(setPaymentForm)} onSubmit={submitPayment} members={(bundle?.project?.assignedMembers || []).map((member) => ({ id: member._id, name: member.name }))} currentUserName={user.name} submitLabel={editingItem ? "Update Member Payment" : "Save Member Payment"} />
              ) : null}
              {activeTab === "expenses" ? (
                <MaintenanceExpenseForm value={expenseForm} onChange={setField(setExpenseForm)} onSubmit={submitExpense} submitLabel={editingItem ? "Update Maintenance Expense" : "Save Maintenance Expense"} />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
