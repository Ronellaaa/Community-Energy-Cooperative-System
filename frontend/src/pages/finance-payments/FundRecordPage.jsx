import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DeleteConfirmModal from "../../components/finance-payments/DeleteConfirmModal";
import FinanceCard from "../../components/finance-payments/FinanceCard";
import FinanceForm from "../../components/finance-payments/FinanceForm";
import FinancePagination from "../../components/finance-payments/FinancePagination";
import FinanceTable from "../../components/finance-payments/FinanceTable";
import StatusBadge from "../../components/finance-payments/StatusBadge";
import {
  financePaymentsApi,
  loadFinanceProjects,
  paginateItems,
} from "./services/financeModuleApi";
import { formatCurrency, formatDate } from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-payments.css";

const createInitialForm = (projectId = "", sourceId = "") => ({
  projectId,
  sourceId,
  amount: "",
  status: "PENDING",
  date: new Date().toISOString().slice(0, 10),
  note: "",
});

export default function FundRecordPage() {
  const [projects, setProjects] = useState([]);
  const [sources, setSources] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [form, setForm] = useState(createInitialForm());
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadBaseData = async () => {
    const [projectList, sourceRes] = await Promise.all([
      loadFinanceProjects(),
      financePaymentsApi.getFundSources(),
    ]);

    setProjects(projectList);
    setSources(sourceRes?.data || []);

    const firstProjectId = projectList[0]?._id || "";
    const firstSourceId = sourceRes?.data?.[0]?._id || "";
    setSelectedProjectId((current) => current || firstProjectId);
    setForm((current) => ({
      ...current,
      projectId: current.projectId || firstProjectId,
      sourceId: current.sourceId || firstSourceId,
    }));

    return { projectList, sourceList: sourceRes?.data || [] };
  };

  const loadRecords = async (projectId) => {
    const res = await financePaymentsApi.getFundRecords(projectId);
    setRecords(res?.data || []);
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const { projectList } = await loadBaseData();
        if (!ignore && projectList[0]?._id) {
          await loadRecords(projectList[0]._id);
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

  useEffect(() => {
    if (!selectedProjectId) return;
    loadRecords(selectedProjectId).catch((err) => setError(err.message));
  }, [selectedProjectId]);

  const paginated = useMemo(() => paginateItems(records, page, 6), [page, records]);

  const fields = [
    {
      name: "projectId",
      label: "Project",
      type: "select",
      options: projects.map((project) => ({ value: project._id, label: project.name })),
    },
    {
      name: "sourceId",
      label: "Funding Source",
      type: "select",
      options: sources.map((source) => ({ value: source._id, label: source.fundName })),
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

  const handleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "projectId") setSelectedProjectId(value);
  };

  const resetForm = () => {
    setEditingId("");
    setForm(createInitialForm(selectedProjectId, sources[0]?._id || ""));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      projectId: item.projectId?._id || item.projectId || selectedProjectId,
      sourceId: item.sourceId?._id || item.sourceId || "",
      amount: item.amount || "",
      status: item.status || "PENDING",
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      note: item.note || "",
    });
    setSelectedProjectId(item.projectId?._id || item.projectId || selectedProjectId);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingId) {
        await financePaymentsApi.updateFundRecord(editingId, payload);
        toast.success("Fund record updated.");
      } else {
        await financePaymentsApi.createFundRecord(payload);
        toast.success("Fund record added.");
      }

      await loadRecords(form.projectId);
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to save fund record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setDeleting(true);
      await financePaymentsApi.deleteFundRecord(deleteItem._id);
      toast.success("Fund record deleted.");
      setDeleteItem(null);
      await loadRecords(selectedProjectId);
      if (editingId === deleteItem._id) resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to delete fund record.");
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
            <h1 className="fp-title">Fund Records</h1>
            <p className="fp-subtitle">Project-related funding records.</p>
          </div>
          <Link className="fp-button fp-button--secondary" to="/finance-payments/dashboard">
            Back
          </Link>
        </div>

        {loading ? <div className="fp-message fp-message--loading">Loading fund records...</div> : null}
        {!loading && error ? <div className="fp-message fp-message--error">{error}</div> : null}

        {!loading && !error ? (
          <div className="fp-layout">
            <FinanceCard
              title="Fund Record List"
              subtitle="Select a project to view its records."
              action={
                <select
                  className="fp-select"
                  value={selectedProjectId}
                  onChange={(event) => {
                    setSelectedProjectId(event.target.value);
                    setForm((current) => ({ ...current, projectId: event.target.value }));
                    setPage(1);
                  }}
                >
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              }
            >
              <FinanceTable
                rows={paginated.items}
                emptyText="No fund records found."
                columns={[
                  { key: "date", label: "Date", render: (item) => formatDate(item.date) },
                  { key: "sourceId", label: "Source", render: (item) => item.sourceId?.fundName || "-" },
                  { key: "amount", label: "Amount", render: (item) => formatCurrency(item.amount) },
                  {
                    key: "status",
                    label: "Status",
                    render: (item) => <StatusBadge text={item.status} />,
                  },
                  {
                    key: "actions",
                    label: "Actions",
                    render: (item) => (
                      <div className="fp-toolbar">
                        <button type="button" className="fp-button fp-button--secondary" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button type="button" className="fp-button fp-button--danger" onClick={() => setDeleteItem(item)}>
                          Delete
                        </button>
                      </div>
                    ),
                  },
                ]}
              />
              <FinancePagination page={paginated.page} totalPages={paginated.totalPages} onPageChange={setPage} />
            </FinanceCard>

            <FinanceCard title={editingId ? "Edit Fund Record" : "Add Fund Record"} subtitle="Save project funding details.">
              <FinanceForm
                fields={fields}
                values={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitLabel={saving ? "Saving..." : editingId ? "Update Fund Record" : "Add Fund Record"}
                onCancel={editingId ? resetForm : undefined}
              />
            </FinanceCard>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        open={Boolean(deleteItem)}
        title="Delete Fund Record"
        message="Are you sure you want to delete this fund record?"
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
