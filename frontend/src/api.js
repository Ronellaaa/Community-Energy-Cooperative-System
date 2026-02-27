import axios from "axios";


const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export async function apiRequest(path, { method = "GET", body, token, isFormData = false } = {}) {
  const headers = {};

  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  // Try to read JSON. Some errors might return empty.
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