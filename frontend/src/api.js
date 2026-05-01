const API_URL = "/api";

export const authToken = () => localStorage.getItem("ttm_token");
export const authUser = () => JSON.parse(localStorage.getItem("ttm_user") || "null");

export default function fetchJson(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = authToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${path}`, { ...options, headers }).then(async (res) => {
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data || { detail: "Request failed" };
    return data;
  });
}
