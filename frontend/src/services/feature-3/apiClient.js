const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const parseJson = async (response) => {
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

const getAuthHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  
  console.log("Auth Debug - User from localStorage:", user);
  console.log("Auth Debug - Token from localStorage:", token);
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("Auth Debug - Using Bearer token");
  } else if (user.id) {
    headers["X-User-ID"] = user.id;
    console.log("Auth Debug - Using X-User-ID:", user.id);
  } else {
    console.log("Auth Debug - No authentication available");
  }
  
  console.log("Auth Debug - Final headers:", headers);
  return headers;
};

export const apiGet = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders(),
  });
  return parseJson(response);
};

export const apiSend = async (path, options = {}) => {
  const headers = getAuthHeaders();
  
  // Let the browser generate the multipart boundary for FormData uploads.
  if (options.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  const normalizedOptionHeaders = { ...(options.headers || {}) };

  if (options.body instanceof FormData) {
    delete normalizedOptionHeaders["Content-Type"];
  }
  
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...normalizedOptionHeaders,
    },
  });
  return parseJson(response);
};

export const apiBaseUrl = API_BASE_URL;
