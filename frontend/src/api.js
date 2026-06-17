import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export async function apiRequest(
  path,
  { method = "GET", body, isFormData = false } = {}
) {
  const headers = {};

  if (!isFormData) headers["Content-Type"] = "application/json";

  // 🔥 FIXED: ALWAYS GET TOKEN FROM LOCAL STORAGE
  const storedToken = localStorage.getItem("token");

  console.log("TOKEN BEING SENT:", storedToken); // DEBUG

  if (storedToken) {
    headers["Authorization"] = `Bearer ${storedToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    const msg = data?.message || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

// Project APIs
export const projectApi = {
  getAll: () => apiRequest("/api/projects"),
  getOne: (id) => apiRequest(`/api/projects/${id}`),
  getMyProjects: () => apiRequest("/api/projects/my-projects"),  
  getByCommunity: (communityId) => apiRequest(`/api/projects/community/${communityId}`),
  create: (data) => apiRequest("/api/projects", { method: "POST", body: data }),
  update: (id, data) => apiRequest(`/api/projects/${id}`, { method: "PUT", body: data }),
  delete: (id) => apiRequest(`/api/projects/${id}`, { method: "DELETE" }),
  approve: (id) => apiRequest(`/api/projects/${id}/approve`, { method: "PATCH" }),
  reject: (id) => apiRequest(`/api/projects/${id}/reject`, { method: "PATCH" }),
  activate: (id) => apiRequest(`/api/projects/${id}/activate`, { method: "PATCH" }),
};

// Community APIs
export const communityApi = {
  getAll: () => apiRequest("/api/communities"),

  getApproved: () => apiRequest("/api/communities/approved"),
};