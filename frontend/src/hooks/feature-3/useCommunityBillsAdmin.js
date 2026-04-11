import { useEffect, useMemo, useState } from "react";
import {
  distributeCommunityBill,
  fetchCommunityBills,
  fetchPaymentSlipDetails,
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
  const [selectedPaymentSlip, setSelectedPaymentSlip] = useState(null);
  const [isSlipDetailsOpen, setIsSlipDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [rejectDialogState, setRejectDialogState] = useState({
    isOpen: false,
    paymentSlipId: "",
    rejectionReason: "",
  });

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
      return true;
    } catch (requestError) {
      setError(requestError.message || "Failed to update payment slip status");
      return false;
    } finally {
      setActiveSlipId("");
    }
  };

  const openPaymentSlipDetails = async (paymentSlipId) => {
    setIsSlipDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedPaymentSlip(null);
    setDetailsError("");

    try {
      setSelectedPaymentSlip(await fetchPaymentSlipDetails(paymentSlipId));
    } catch (requestError) {
      setDetailsError(requestError.message || "Failed to load payment slip details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closePaymentSlipDetails = () => {
    setIsSlipDetailsOpen(false);
    setSelectedPaymentSlip(null);
    setDetailsLoading(false);
    setDetailsError("");
  };

  const openRejectDialog = (paymentSlipId) => {
    setRejectDialogState({
      isOpen: true,
      paymentSlipId,
      rejectionReason: "",
    });
  };

  const closeRejectDialog = () => {
    setRejectDialogState({
      isOpen: false,
      paymentSlipId: "",
      rejectionReason: "",
    });
  };

  const setRejectReason = (rejectionReason) => {
    setRejectDialogState((currentState) => ({
      ...currentState,
      rejectionReason,
    }));
  };

  const submitRejectDialog = async () => {
    if (!rejectDialogState.paymentSlipId || !rejectDialogState.rejectionReason.trim()) {
      return;
    }

    const wasSuccessful = await handlePaymentSlipStatusUpdate({
      paymentSlipId: rejectDialogState.paymentSlipId,
      status: "rejected",
      rejectionReason: rejectDialogState.rejectionReason.trim(),
    });

    if (wasSuccessful) {
      closeRejectDialog();
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
    selectedPaymentSlip,
    isSlipDetailsOpen,
    detailsLoading,
    detailsError,
    openPaymentSlipDetails,
    closePaymentSlipDetails,
    rejectDialogState,
    openRejectDialog,
    closeRejectDialog,
    setRejectReason,
    submitRejectDialog,
  };
};
