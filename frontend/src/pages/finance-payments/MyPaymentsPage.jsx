import React, { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/finance-payments/EmptyState";
import PaginationBar from "../../components/finance-payments/PaginationBar";
import SectionHeader from "../../components/finance-payments/SectionHeader";
import { buildProjectBundle, getCurrentAuthUser, loadFinanceProjects, paginateItems } from "./services/financeModuleApi";
import { formatDate, formatLKR } from "./utils/financeModuleUtils";
import "../../styles/finance-payments/finance-module.css";

export default function MyPaymentsPage() {
  const user = getCurrentAuthUser();
  const isManager = user?.role === "ADMIN" || user?.role === "OFFICER";
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
        const projects = await loadFinanceProjects();
        const visibleProjects = projects.filter((project) =>
          (project.assignedMembers || []).some((member) => (member._id || member.id || member) === user?.id),
        );
        const bundles = await Promise.all(visibleProjects.map((project) => buildProjectBundle(project.id)));
        const ownPayments = bundles.flatMap((bundle) =>
          bundle.memberPayments
            .filter((payment) => (payment.memberId?._id || payment.memberId) === user?.id)
            .map((payment) => ({
              ...payment,
              projectName: bundle.project.name,
            })),
        );
        if (!ignore) {
          setPayments(
            ownPayments.sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()),
          );
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

  if (isManager) {
    return (
      <div className="fp-page">
        <div className="fp-shell">
          <EmptyState
            title="Member payment view only"
            description="Admins and officers should use the finance dashboard for full payment management."
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
            <h1 className="fp-title">My Payments</h1>
            <p className="fp-subtitle">
              User-only payment history. This page only shows the logged-in member's own
              contributions from the backend.
            </p>
          </div>
        </div>

        <div className="fp-card fp-card--pad fp-stack">
          <SectionHeader
            title="My Payment Log"
            subtitle="No other members' contributions are included."
          />

          {loading ? <EmptyState title="Loading payments" description="Fetching your own payment records from the backend." /> : null}
          {!loading && error ? <EmptyState title="Unable to load payments" description={error} /> : null}
          {!loading && !error && payments.length === 0 ? (
            <EmptyState
              title="No payments recorded"
              description="Your payment history will appear here after submissions are recorded."
            />
          ) : null}

          {!loading && !error && paginated.items.length > 0 ? (
            <>
              <div className="fp-record-grid fp-record-grid--compact">
                {paginated.items.map((payment) => (
                  <article key={payment._id} className="fp-record-card">
                    <div className="fp-record-card__head">
                      <div>
                        <h3>{payment.projectName}</h3>
                        <p>{formatDate(payment.date)}</p>
                      </div>
                      <span className="fp-pill fp-pill--success">{payment.method}</span>
                    </div>
                    <div className="fp-record-card__grid">
                      <div className="fp-record-card__metric">
                        <span>Amount</span>
                        <strong>{formatLKR(payment.amount)}</strong>
                      </div>
                      <div className="fp-record-card__metric">
                        <span>Payment Type</span>
                        <strong>{payment.paymentType}</strong>
                      </div>
                      <div className="fp-record-card__metric fp-record-card__metric--wide">
                        <span>Note</span>
                        <strong>{payment.note || "No note added"}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <PaginationBar page={paginated.page} totalPages={paginated.totalPages} onPageChange={setPage} />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
