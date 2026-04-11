import { apiGet, apiSend } from "./apiClient";

const sendPaymentSlipMultipartRequest = async (path, method, paymentSlipData) =>
  apiSend(path, {
    method,
    body: paymentSlipData,
  });

export const fetchMemberConsumptionRecords = async ({
  memberId,
  communityId,
}) => {
  const data = await apiGet(
    `/api/readings/member/${encodeURIComponent(memberId)}/community/${encodeURIComponent(communityId)}`,
  );

  return data.data || [];
};

export const fetchConsumptionRecord = async (consumptionId) => {
  const data = await apiGet(`/api/readings/${consumptionId}`);
  return data.data;
};

export const submitPaymentSlip = async (paymentSlipData) => {
  const data = await sendPaymentSlipMultipartRequest(
    "/api/member-payment-slips",
    "POST",
    paymentSlipData,
  );

  return data;
};
/*old one--------------------------------*/
export const updatePaymentSlip = async (id, paymentSlipData) => {
  const data = await sendPaymentSlipMultipartRequest(
    `/api/member-payment-slips/${id}`,
    "PUT",
    paymentSlipData,
  );

  return data;
};

/*export const updatePaymentSlip = async (id, paymentSlipData) => {
  const response = await sendPaymentSlipMultipartRequest(
    `/api/member-payment-slips/${id}`,
    "PUT",
    paymentSlipData,
  );

  return response.data; // ✅ Return only the slip object
};*/

export const deletePaymentSlip = async (id) => {
  const data = await apiSend(`/api/member-payment-slips/${id}`, {
    method: "DELETE",
  });

  return data;
};

export const getPaymentSlip = async (id) => {
  const data = await apiGet(`/api/member-payment-slips/${id}`);
  return data;
};

/*export const submitPaymentSlip = async (paymentSlipData) => {
  const response = await sendPaymentSlipMultipartRequest(
    "/api/member-payment-slips",
    "POST",
    paymentSlipData,
  );

  return response.data; // ✅ Return only the slip object
};

export const updatePaymentSlip = async (id, paymentSlipData) => {
  const response = await sendPaymentSlipMultipartRequest(
    `/api/member-payment-slips/${id}`,
    "PUT",
    paymentSlipData,
  );

  return response.data; // ✅ Return only the slip object
};

export const deletePaymentSlip = async (id) => {
  const response = await apiSend(`/api/member-payment-slips/${id}`, {
    method: "DELETE",
  });

  return response.data; // ✅ Return only the slip object
};

export const getPaymentSlip = async (id) => {
  const response = await apiGet(`/api/member-payment-slips/${id}`);
  return response.data; // ✅ Return only the slip object
};*/
