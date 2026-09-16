import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const ASSET_URL = import.meta.env.VITE_ASSET_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("dairyfeed_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let onUnauthorized = null;
export const registerUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const message =
      error?.response?.data?.message ||
      (status === 500
        ? "Something went wrong on our end. Please try again."
        : "Network error. Please check your connection.");

    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${ASSET_URL}${path}`;
};

export default api;
