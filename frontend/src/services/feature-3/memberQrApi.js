import { apiGet } from "./apiClient";

export const fetchMemberQrUrl = async ({ memberId, communityId }) => {
  const data = await apiGet(`/api/qr/${memberId}/${communityId}`);
  return data.data?.qrUrl || "";
};
