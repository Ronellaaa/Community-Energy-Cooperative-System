import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import DeleteConfirmModal from "../../components/finance-payments/DeleteConfirmModal";
import FinanceCard from "../../components/finance-payments/FinanceCard";
import FinanceForm from "../../components/finance-payments/FinanceForm";
import FinancePagination from "../../components/finance-payments/FinancePagination";
import FinanceTable from "../../components/finance-payments/FinanceTable";
import {
  financePaymentsApi,
  loadFinanceProjects,
  paginateItems,
} from "./services/financeModuleApi";
import { formatCurrency, formatDate } from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-payments.css";

const createInitialForm = (projectId = "") => ({
  projectId,
  amount: "",
  category: "REPAIR",
  date: new Date().toISOString().slice(0, 10),
  description: "",
});

export default function MaintenancePage() {
  const [projects, setProjects] = useState([]);
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

  const loadRecords = async (projectId) => {
    const res = await financePaymentsApi.getMaintenanceRecords(projectId);
    setRecords(res?.data || []);
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const projectList = await loadFinanceProjects();
        if (ignore) return;
        setProjects(projectList);
        const firstProjectId = projectList[0]?._id || "";
        setSelectedProjectId(firstProjectId);
        setForm(createInitialForm(firstProjectId));
        if (firstProjectId) {
          await loadRecords(firstProjectId);
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

  const handleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "projectId") setSelectedProjectId(value);
  };

  const resetForm = () => {
    setEditingId("");
    setForm(createInitialForm(selectedProjectId));
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      projectId: item.projectId?._id || item.projectId || selectedProjectId,
      amount: item.amount || "",
      category: item.category || "REPAIR",
      date: item.date ? String(item.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      description: item.description || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = { ...form, amount: Number(form.amount) };

      if (editingId) {
        await financePaymentsApi.updateMaintenanceRecord(editingId, payload);
        toast.success("Maintenance record updated.");
      } else {
        await financePaymentsApi.createMaintenanceRecord(payload);
        toast.success("Maintenance record added.");
      }

      await loadRecords(form.projectId);
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to save maintenance record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setDeleting(true);
      await financePaymentsApi.deleteMaintenanceRecord(deleteItem._id);
      toast.success("Maintenance record deleted.");
      setDeleteItem(null);
      await loadRecords(selectedProjectId);
      if (editingId === deleteItem._id) resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to delete maintenance record.");
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
            <h1 className="fp-title">Maintenance</h1>
            <p className="fp-subtitle">Project-related maintenance spending records.</p>
          </div>
          <Link className="fp-button fp-button--secondary" to="/finance-payments/dashboard">
            Back
          </Link>
        </div>

        {loading ? <div className="fp-message fp-message--loading">Loading maintenance records...</div> : null}
        {!loading && error ? <div className="fp-message fp-message--error">{error}</div> : null}

        {!loading && !error ? (
          <div className="fp-layout">
            <FinanceCard
              title="Maintenance List"
              subtitle="Select a project to view maintenance entries."
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
                emptyText="No maintenance records found."
                columns={[
                  { key: "date", label: "Date", render: (item) => formatDate(item.date) },
                  { key: "category", label: "Category" },
                  { key: "amount", label: "Amount", render: (item) => formatCurrency(item.amount) },
                  { key: "description", label: "Description" },
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

            <FinanceCard title={editingId ? "Edit Maintenance" : "Add Maintenance"} subtitle="Save maintenance expense details.">
              <FinanceForm
                fields={fields}
                values={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitLabel={saving ? "Saving..." : editingId ? "Update Maintenance" : "Add Maintenance"}
                onCancel={editingId ? resetForm : undefined}
              />
            </FinanceCard>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        open={Boolean(deleteItem)}
        title="Delete Maintenance Record"
        message="Are you sure you want to delete this maintenance record?"
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
