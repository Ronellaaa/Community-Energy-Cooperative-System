const API_BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:5001";

const parseJson = async (response) => {
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || "Request failed");
  }

  return data;
};

export const apiGet = async (path) => {
  const response = await fetch(`${API_BASE_URL}${path}`);
  return parseJson(response);
};

export const apiSend = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  return parseJson(response);
};

export const apiBaseUrl = API_BASE_URL;
