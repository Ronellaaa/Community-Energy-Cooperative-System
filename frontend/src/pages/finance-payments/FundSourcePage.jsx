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
  paginateItems,
} from "./services/financeModuleApi";
import "../../styles/finance-payments/finance-payments.css";

const initialForm = {
  fundName: "",
  fundType: "GRANT",
  contactPhone: "",
  description: "",
  isActive: "true",
};

export default function FundSourcePage() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [page, setPage] = useState(1);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadSources = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await financePaymentsApi.getFundSources();
      setSources(res?.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const paginated = useMemo(() => paginateItems(sources, page, 6), [page, sources]);

  const fields = [
    { name: "fundName", label: "Fund Name", required: true },
    {
      name: "fundType",
      label: "Fund Type",
      type: "select",
      options: [
        { value: "GRANT", label: "Grant" },
        { value: "LOAN", label: "Loan" },
        { value: "COMMUNITY FUND", label: "Community Fund" },
        { value: "DONATION", label: "Donation" },
        { value: "OTHER", label: "Other" },
      ],
    },
    { name: "contactPhone", label: "Contact Phone" },
    {
      name: "isActive",
      label: "Active Status",
      type: "select",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    { name: "description", label: "Description", type: "textarea", fullWidth: true, rows: 3 },
  ];

  const handleChange = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      fundName: item.fundName || "",
      fundType: item.fundType || "GRANT",
      contactPhone: item.contactPhone || "",
      description: item.description || "",
      isActive: item.isActive ? "true" : "false",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const payload = {
        ...form,
        isActive: form.isActive === "true",
      };

      if (editingId) {
        await financePaymentsApi.updateFundSource(editingId, payload);
        toast.success("Fund source updated.");
      } else {
        await financePaymentsApi.createFundSource(payload);
        toast.success("Fund source created.");
      }

      await loadSources();
      resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to save fund source.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      setDeleting(true);
      await financePaymentsApi.deleteFundSource(deleteItem._id);
      toast.success("Fund source deleted.");
      setDeleteItem(null);
      await loadSources();
      if (editingId === deleteItem._id) resetForm();
    } catch (err) {
      toast.error(err.message || "Failed to delete fund source.");
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
            <h1 className="fp-title">Fund Sources</h1>
            <p className="fp-subtitle">General fund source records used across the finance module.</p>
          </div>
          <Link className="fp-button fp-button--secondary" to="/finance-payments/dashboard">
            Back
          </Link>
        </div>

        {loading ? <div className="fp-message fp-message--loading">Loading fund sources...</div> : null}
        {!loading && error ? <div className="fp-message fp-message--error">{error}</div> : null}

        {!loading && !error ? (
          <div className="fp-layout">
            <FinanceCard title="Fund Source List" subtitle="View all available funding sources.">
              <FinanceTable
                rows={paginated.items}
                emptyText="No fund sources found."
                columns={[
                  { key: "fundName", label: "Fund Name" },
                  { key: "fundType", label: "Fund Type" },
                  { key: "contactPhone", label: "Contact Phone" },
                  {
                    key: "status",
                    label: "Status",
                    render: (item) => <StatusBadge text={item.isActive ? "Active" : "Inactive"} />,
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

            <FinanceCard title={editingId ? "Edit Fund Source" : "Add Fund Source"} subtitle="Save or update fund source information.">
              <FinanceForm
                fields={fields}
                values={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitLabel={saving ? "Saving..." : editingId ? "Update Fund Source" : "Add Fund Source"}
                onCancel={editingId ? resetForm : undefined}
              />
            </FinanceCard>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        open={Boolean(deleteItem)}
        title="Delete Fund Source"
        message={`Are you sure you want to delete "${deleteItem?.fundName || ""}"?`}
        onCancel={() => setDeleteItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
