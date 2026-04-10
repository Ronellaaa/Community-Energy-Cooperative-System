import { apiGet, apiSend } from "./apiClient";

export const fetchMemberConsumptionRecords = async ({ memberId, communityId }) => {
  const data = await apiGet(
    `/api/readings/member/${encodeURIComponent(memberId)}/community/${encodeURIComponent(communityId)}`,
  );

  return data.data || [];
};

export const fetchConsumptionRecord = async (consumptionId) => {
  const data = await apiGet(`/api/readings/${consumptionId}`);
  return data.data;
};

export const submitPaymentSlip = async (formData) => {
  const data = await apiSend("/api/bills/payment-slips", {
    method: "POST",
    body: formData,
  });

  return data.message || "Payment slip uploaded successfully";
};
