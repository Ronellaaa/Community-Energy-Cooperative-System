import { apiBaseUrl } from "./apiClient";

export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("No token available");
  }

  const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Failed to load current user");
  }

  return {
    id: data.id || "",
    memberId: data.memberId || data.id || "",
    name: data.name || "",
    email: data.email || "",
    role: data.role || "",
    communityId: data.communityId || "",
  };
};
