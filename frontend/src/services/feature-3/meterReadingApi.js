import { apiGet, apiSend } from "./apiClient";

export const lookupPreviousMeterReading = async ({
  memberId,
  communityId,
  month,
  year,
}) => {
  const data = await apiGet(
    `/api/readings/previous/${memberId}/${communityId}/${month}/${year}`,
  );

  return data.data;
};

export const createMeterReading = async (payload) => {
  const data = await apiSend("/api/readings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return {
    message: data.message || "Meter reading submitted successfully.",
    data: data.data,
  };
};

export const updateMeterReading = async (id, payload) => {
  const data = await apiSend(`/api/readings/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      previousReading: payload.previousReading,
      currentReading: payload.currentReading,
    }),
  });

  return {
    message: data.message || "Meter reading updated successfully.",
    data: data.data,
  };
};

export const deleteMeterReading = async (id) => {
  const data = await apiSend(`/api/readings/${id}`, {
    method: "DELETE",
  });

  return {
    message: data.message || "Meter reading deleted successfully.",
    data: data.data,
  };
};
