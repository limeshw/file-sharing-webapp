import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const isLocalBackend = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(rawBaseUrl);

export const API_BASE_URL =
  import.meta.env.DEV && isLocalBackend ? "" : rawBaseUrl.replace(/\/$/, "");

export const BACKEND_PUBLIC_BASE_URL = rawBaseUrl.replace(/\/$/, "");

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export function buildBackendUrl(pathname = "") {
  return API_BASE_URL ? `${API_BASE_URL}${pathname}` : pathname;
}
