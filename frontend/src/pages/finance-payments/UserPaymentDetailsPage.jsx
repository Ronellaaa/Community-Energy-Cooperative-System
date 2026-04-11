import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import FinanceCard from "../../components/finance-payments/FinanceCard";
import FinancePagination from "../../components/finance-payments/FinancePagination";
import FinanceTable from "../../components/finance-payments/FinanceTable";
import StatusBadge from "../../components/finance-payments/StatusBadge";
import {
  getStoredFinanceUser,
  loadFinanceProjects,
  loadProjectFinanceBundle,
  paginateItems,
} from "./services/financeModuleApi";
import {
  filterProjectsForUser,
  formatCurrency,
  formatDate,
} from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-payments.css";

export default function UserPaymentDetailsPage() {
  const user = getStoredFinanceUser();
  const [payments, setPayments] = useState([]);
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
        const visibleProjects = filterProjectsForUser(allProjects, user?.id);
        const bundles = await Promise.all(
          visibleProjects.map((project) => loadProjectFinanceBundle(project._id)),
        );

        const ownPayments = bundles.flatMap((bundle) =>
          (bundle.contributions || [])
            .filter((item) => (item.memberId?._id || item.memberId) === user?.id)
            .map((item) => ({
              ...item,
              projectName: bundle.project?.name || "Project",
            })),
        );

        if (!ignore) {
          setPayments(ownPayments);
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
  }, [user?.id]);

  const paginated = useMemo(() => paginateItems(payments, page, 8), [page, payments]);

  return (
    <div className="fp-page">
      <div className="fp-container">
        <div className="fp-header">
          <div>
            <h1 className="fp-title">My Payment Details</h1>
            <p className="fp-subtitle">All of your member contributions across your visible projects.</p>
          </div>
          <Link className="fp-button fp-button--secondary" to="/finance-payments/dashboard">
            Back
          </Link>
        </div>

        {loading ? <div className="fp-message fp-message--loading">Loading your payment details...</div> : null}
        {!loading && error ? <div className="fp-message fp-message--error">{error}</div> : null}

        {!loading && !error ? (
          <FinanceCard title="Payment History" subtitle="Only your own payments are shown here.">
            <FinanceTable
              rows={paginated.items}
              emptyText="You do not have payment records yet."
              columns={[
                { key: "date", label: "Date", render: (item) => formatDate(item.date) },
                { key: "projectName", label: "Project" },
                { key: "paymentType", label: "Payment Type" },
                { key: "method", label: "Method" },
                { key: "amount", label: "Amount", render: (item) => formatCurrency(item.amount) },
                {
                  key: "status",
                  label: "Status",
                  render: () => <StatusBadge text="Received" />,
                },
              ]}
            />
            <FinancePagination page={paginated.page} totalPages={paginated.totalPages} onPageChange={setPage} />
          </FinanceCard>
        ) : null}
      </div>
    </div>
  );
}
