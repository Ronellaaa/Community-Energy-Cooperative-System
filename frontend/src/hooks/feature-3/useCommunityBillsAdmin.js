import { useEffect, useMemo, useState } from "react";
import {
  distributeCommunityBill,
  fetchCommunityBills,
  fetchPaymentSlips,
  updateCommunityPaymentSlipStatus,
} from "../../services/feature-3/communityBillsAdminApi";

export const useCommunityBillsAdmin = () => {
  const [activeView, setActiveView] = useState("community-bills");
  const [bills, setBills] = useState([]);
  const [paymentSlips, setPaymentSlips] = useState([]);
  const [expandedBillId, setExpandedBillId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeBillId, setActiveBillId] = useState("");
  const [activeSlipId, setActiveSlipId] = useState("");
  const [distributionFilter, setDistributionFilter] = useState("all");
  const [paymentSlipFilter, setPaymentSlipFilter] = useState("pending");

  const visibleCount = useMemo(
    () =>
      activeView === "community-bills" ? bills.length : paymentSlips.length,
    [activeView, bills.length, paymentSlips.length],
  );

  const billCollectionTotals = useMemo(
    () =>
      bills.reduce(
        (totals, bill) => {
          const summary = bill.collectionSummary;

          if (!summary) {
            return totals;
          }

          return {
            totalPaidAmount:
              totals.totalPaidAmount + Number(summary.totalPaidAmount || 0),
            totalRemainingAmount:
              totals.totalRemainingAmount +
              Number(summary.totalRemainingAmount || 0),
            paidMembersCount:
              totals.paidMembersCount + Number(summary.paidMembersCount || 0),
            unpaidMembersCount:
              totals.unpaidMembersCount +
              Number(summary.unpaidMembersCount || 0),
          };
        },
        {
          totalPaidAmount: 0,
          totalRemainingAmount: 0,
          paidMembersCount: 0,
          unpaidMembersCount: 0,
        },
      ),
    [bills],
  );

  const loadBills = async (statusFilter = distributionFilter) => {
    setLoading(true);
    setError("");

    try {
      setBills(await fetchCommunityBills(statusFilter));
    } catch (requestError) {
      setError(requestError.message || "Failed to load community bills");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentSlips = async (statusFilter = paymentSlipFilter) => {
    setLoading(true);
    setError("");

    try {
      setPaymentSlips(await fetchPaymentSlips(statusFilter));
    } catch (requestError) {
      setError(requestError.message || "Failed to load payment slips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "community-bills") {
      loadBills();
      return;
    }

    loadPaymentSlips();
  }, [activeView]);

  const handleBillFilterChange = async (nextFilter) => {
    setDistributionFilter(nextFilter);
    setExpandedBillId("");
    await loadBills(nextFilter);
  };

  const handlePaymentSlipFilterChange = async (nextFilter) => {
    setPaymentSlipFilter(nextFilter);
    await loadPaymentSlips(nextFilter);
  };

  const handleDistribute = async (billId) => {
    setActiveBillId(billId);
    setError("");
    setNotice("");

    try {
      setNotice(await distributeCommunityBill(billId));
      setExpandedBillId(billId);
      await loadBills();
    } catch (requestError) {
      setError(requestError.message || "Failed to distribute community bill");
    } finally {
      setActiveBillId("");
    }
  };

  const handlePaymentSlipStatusUpdate = async ({
    paymentSlipId,
    status,
    rejectionReason,
  }) => {
    setActiveSlipId(paymentSlipId);
    setError("");
    setNotice("");

    try {
      setNotice(
        await updateCommunityPaymentSlipStatus({
          paymentSlipId,
          status,
          rejectionReason,
        }),
      );
      await loadPaymentSlips();
      if (activeView === "community-bills") {
        await loadBills();
      }
    } catch (requestError) {
      setError(requestError.message || "Failed to update payment slip status");
    } finally {
      setActiveSlipId("");
    }
  };

  return {
    activeView,
    setActiveView,
    bills,
    paymentSlips,
    expandedBillId,
    setExpandedBillId,
    loading,
    error,
    notice,
    activeBillId,
    activeSlipId,
    distributionFilter,
    paymentSlipFilter,
    visibleCount,
    billCollectionTotals,
    loadBills,
    loadPaymentSlips,
    handleBillFilterChange,
    handlePaymentSlipFilterChange,
    handleDistribute,
    handlePaymentSlipStatusUpdate,
  };
};
