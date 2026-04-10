import { apiGet, apiSend } from "./apiClient";

export const fetchCommunityBills = async (distributionStatus = "all") => {
  const query =
    distributionStatus && distributionStatus !== "all"
      ? `?distributionStatus=${encodeURIComponent(distributionStatus)}`
      : "";

  const data = await apiGet(`/api/admin/community-bills${query}`);
  return data.data || [];
};

export const fetchPaymentSlips = async (status = "all") => {
  const query =
    status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";

  const data = await apiGet(`/api/admin/payment-slips${query}`);
  return data.data || [];
};

export const distributeCommunityBill = async (billId) => {
  const data = await apiSend(`/api/admin/community-bills/${billId}/distribute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ distributedBy: "admin" }),
  });

  return data.message || "Community bill distributed successfully.";
};

export const updateCommunityPaymentSlipStatus = async ({
  paymentSlipId,
  status,
  rejectionReason,
}) => {
  const data = await apiSend(`/api/admin/payment-slips/${paymentSlipId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status,
      rejectionReason,
      reviewedBy: "admin",
    }),
  });

  return data.message || "Payment slip updated successfully.";
};
