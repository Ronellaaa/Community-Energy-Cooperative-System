import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, HandCoins, Landmark, Save, Wrench } from "lucide-react";
import { apiRequest } from "../../api";
import "../../styles/finance-payments/edit.css";

const fieldThemes = {
  green: "finance-edit__label finance-edit__label--green",
  blue: "finance-edit__label finance-edit__label--blue",
  gold: "finance-edit__label finance-edit__label--gold",
  red: "finance-edit__label finance-edit__label--red",
  purple: "finance-edit__label finance-edit__label--purple",
};

const entityMeta = {
  source: {
  title: "Edit Funding Source",
  subtitle: "Update the details of this funding source.",
  icon: Landmark,
},
record: {
  title: "Edit Funding Record",
  subtitle: "Make changes to this funding record and keep everything up to date.",
  icon: HandCoins,
},
payment: {
  title: "Edit Member Payment",
  subtitle: "Update this payment while keeping it linked to the member.",
  icon: CreditCard,
},
expense: {
  title: "Edit Maintenance Expense",
  subtitle: "Edit the maintenance expense details for this project.",
  icon: Wrench,
},
};

const normalizeDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const normalizeMonth = (value) => {
  if (!value) return "";
  return String(value).slice(0, 7);
};

export default function FinanceEditItemPage() {
  const navigate = useNavigate();
  const { entity, projectId, id } = useParams();
  const token = localStorage.getItem("token");

  const [project, setProject] = useState(null);
  const [fundingSources, setFundingSources] = useState([]);
  const [record, setRecord] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const meta = entityMeta[entity];

  const request = (path, options) =>
    apiRequest(path, {
      ...options,
      token,
    });

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
  }, [navigate, token]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!meta) {
          throw new Error("Unknown edit type");
        }

        const projectData = await request(`/api/projects/${projectId}`);
        if (ignore) return;
        setProject(projectData);

        if (entity === "source") {
          const sourcesRes = await request("/api/funding-sources");
          const source = (sourcesRes.data || []).find((item) => item._id === id);
          if (!source) throw new Error("Funding source not found");
          if (ignore) return;
          setRecord(source);
          setForm({
            fundName: source.fundName || "",
            fundType: source.fundType || "GRANT",
            description: source.description || "",
            contactPhone: source.contactPhone || "",
            isActive: Boolean(source.isActive),
          });
        }

        if (entity === "record") {
          const [sourcesRes, recordsRes] = await Promise.all([
            request("/api/funding-sources"),
            request(`/api/funding-records/project/${projectId}`),
          ]);
          const currentRecord = (recordsRes.data || []).find((item) => item._id === id);
          if (!currentRecord) throw new Error("Funding record not found");
          if (ignore) return;
          setFundingSources(sourcesRes.data || []);
          setRecord(currentRecord);
          setForm({
            sourceId: currentRecord.sourceId?._id || currentRecord.sourceId || "",
            amount: currentRecord.amount || "",
            status: currentRecord.status || "PENDING",
            date: normalizeDate(currentRecord.date),
            note: currentRecord.note || "",
          });
        }

        if (entity === "payment") {
          const paymentsRes = await request(`/api/member-payments/project/${projectId}`);
          const currentPayment = (paymentsRes.data || []).find((item) => item._id === id);
          if (!currentPayment) throw new Error("Member payment not found");
          if (ignore) return;
          setRecord(currentPayment);
          setForm({
            memberId: currentPayment.memberId?._id || currentPayment.memberId || "",
            paymentType: currentPayment.paymentType || "JOINING",
            method: currentPayment.method || "CASH",
            amount: currentPayment.amount || "",
            month: normalizeMonth(currentPayment.month),
            date: normalizeDate(currentPayment.date),
            note: currentPayment.note || "",
          });
        }

        if (entity === "expense") {
          const expensesRes = await request(`/api/maintenance-expenses/project/${projectId}`);
          const currentExpense = (expensesRes.data || []).find((item) => item._id === id);
          if (!currentExpense) throw new Error("Maintenance expense not found");
          if (ignore) return;
          setRecord(currentExpense);
          setForm({
            amount: currentExpense.amount || "",
            category: currentExpense.category || "REPAIR",
            date: normalizeDate(currentExpense.date),
            description: currentExpense.description || "",
          });
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [entity, id, meta, projectId, token]);

  const memberOptions = useMemo(() => project?.assignedMembers || [], [project]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (entity === "source") {
        await request(`/api/funding-sources/${id}`, {
          method: "PUT",
          body: {
            ...form,
            isActive: Boolean(form.isActive),
          },
        });
      }

      if (entity === "record") {
        await request(`/api/funding-records/${id}`, {
          method: "PUT",
          body: {
            ...form,
            amount: Number(form.amount),
            projectId,
          },
        });
      }

      if (entity === "payment") {
        await request(`/api/member-payments/${id}`, {
          method: "PUT",
          body: {
            ...form,
            amount: Number(form.amount),
            projectId,
          },
        });
      }

      if (entity === "expense") {
        await request(`/api/maintenance-expenses/${id}`, {
          method: "PUT",
          body: {
            ...form,
            amount: Number(form.amount),
            projectId,
          },
        });
      }

      navigate(`/finance-payments/dashboard/${projectId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="finance-edit">
        <div className="finance-edit__shell">
          <div className="finance-edit__status">Loading editor...</div>
        </div>
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="finance-edit">
        <div className="finance-edit__shell">
          <div className="finance-edit__status finance-edit__status--error">{error}</div>
        </div>
      </div>
    );
  }

  const Icon = meta?.icon || Landmark;

  return (
    <div className="finance-edit">
      <motion.div
        className="finance-edit__shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="finance-edit__header">
          <div>
            <div className="finance-edit__breadcrumb">
              Finance & Payments / {project?.name || "Project"} / Edit
            </div>
            <h1>{meta.title}</h1>
            <p>{meta.subtitle}</p>
          </div>

          <button
            type="button"
            className="finance-edit__back"
            onClick={() => navigate(`/finance-payments/dashboard/${projectId}`)}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <form className="finance-edit__form" onSubmit={handleSubmit}>
          <div className="finance-edit__hero">
            <div className="finance-edit__hero-icon">
              <Icon size={22} />
            </div>
            <div>
              <strong>{meta.title}</strong>
              <span>Current values are prefilled below. Update what you need and save.</span>
            </div>
          </div>

          {error ? <div className="finance-edit__inline-error">{error}</div> : null}

          {entity === "source" ? (
            <div className="finance-edit__grid">
              <label>
                <span className={fieldThemes.green}>Fund name</span>
                <input value={form.fundName || ""} onChange={(e) => setField("fundName", e.target.value)} required />
              </label>
              <label>
                <span className={fieldThemes.gold}>Fund type</span>
                <select value={form.fundType || "GRANT"} onChange={(e) => setField("fundType", e.target.value)}>
                  {["GRANT", "LOAN", "COMMUNITY FUND", "DONATION", "OTHER"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldThemes.blue}>Contact phone</span>
                <input value={form.contactPhone || ""} onChange={(e) => setField("contactPhone", e.target.value)} />
              </label>
              <label className="finance-edit__checkbox">
                <input type="checkbox" checked={Boolean(form.isActive)} onChange={(e) => setField("isActive", e.target.checked)} />
                Active funding source
              </label>
              <label className="finance-edit__full">
                <span className={fieldThemes.purple}>Description</span>
                <textarea rows={5} value={form.description || ""} onChange={(e) => setField("description", e.target.value)} />
              </label>
            </div>
          ) : null}

          {entity === "record" ? (
            <div className="finance-edit__grid">
              <label>
                <span className={fieldThemes.green}>Funding source</span>
                <select value={form.sourceId || ""} onChange={(e) => setField("sourceId", e.target.value)} required>
                  {fundingSources.map((source) => (
                    <option key={source._id} value={source._id}>{source.fundName}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldThemes.red}>Amount</span>
                <input type="number" min="0" value={form.amount || ""} onChange={(e) => setField("amount", e.target.value)} required />
              </label>
              <label>
                <span className={fieldThemes.blue}>Status</span>
                <select value={form.status || "PENDING"} onChange={(e) => setField("status", e.target.value)}>
                  {["PENDING", "RECEIVED", "REJECTED"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldThemes.gold}>Date</span>
                <input type="date" value={form.date || ""} onChange={(e) => setField("date", e.target.value)} required />
              </label>
              <label className="finance-edit__full">
                <span className={fieldThemes.purple}>Note</span>
                <textarea rows={5} value={form.note || ""} onChange={(e) => setField("note", e.target.value)} />
              </label>
            </div>
          ) : null}

          {entity === "payment" ? (
            <div className="finance-edit__grid">
              <label>
                <span className={fieldThemes.green}>Member</span>
                <select value={form.memberId || ""} onChange={(e) => setField("memberId", e.target.value)} required>
                  {memberOptions.map((member) => (
                    <option key={member._id} value={member._id}>{member.name || member.email || member._id}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldThemes.gold}>Payment type</span>
                <select value={form.paymentType || "JOINING"} onChange={(e) => setField("paymentType", e.target.value)}>
                  {["JOINING", "MONTHLY_MAINTENANCE", "OTHER"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldThemes.blue}>Method</span>
                <select value={form.method || "CASH"} onChange={(e) => setField("method", e.target.value)}>
                  {["CASH", "BANK", "TRANSFER"].map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldThemes.red}>Amount</span>
                <input type="number" min="0" value={form.amount || ""} onChange={(e) => setField("amount", e.target.value)} required />
              </label>
              <label>
                <span className={fieldThemes.purple}>Month</span>
                <input type="month" value={form.month || ""} onChange={(e) => setField("month", e.target.value)} />
              </label>
              <label>
                <span className={fieldThemes.gold}>Date</span>
                <input type="date" value={form.date || ""} onChange={(e) => setField("date", e.target.value)} required />
              </label>
              <label className="finance-edit__full">
                <span className={fieldThemes.blue}>Note</span>
                <textarea rows={5} value={form.note || ""} onChange={(e) => setField("note", e.target.value)} />
              </label>
            </div>
          ) : null}

          {entity === "expense" ? (
            <div className="finance-edit__grid">
              <label>
                <span className={fieldThemes.red}>Amount</span>
                <input type="number" min="0" value={form.amount || ""} onChange={(e) => setField("amount", e.target.value)} required />
              </label>
              <label>
                <span className={fieldThemes.gold}>Category</span>
                <select value={form.category || "REPAIR"} onChange={(e) => setField("category", e.target.value)}>
                  {["REPAIR", "SERVICE", "REPLACEMENT", "OTHER"].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldThemes.blue}>Date</span>
                <input type="date" value={form.date || ""} onChange={(e) => setField("date", e.target.value)} required />
              </label>
              <label className="finance-edit__full">
                <span className={fieldThemes.green}>Description</span>
                <textarea rows={5} value={form.description || ""} onChange={(e) => setField("description", e.target.value)} required />
              </label>
            </div>
          ) : null}

          <div className="finance-edit__actions">
            <button type="button" className="finance-edit__secondary" onClick={() => navigate(`/finance-payments/dashboard/${projectId}`)}>
              Cancel
            </button>
            <button type="submit" className="finance-edit__primary" disabled={saving}>
              <Save size={16} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
