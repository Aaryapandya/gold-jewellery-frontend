/**
 * Axios instance pre-configured for the Gold Jewellery Rental API.
 *
 * Responsibilities:
 *  - Attaches the JWT Bearer token from cookie on every request.
 *  - Normalises API errors into a human-readable message string.
 *  - Redirects to /login on 401 (token expired / invalid).
 */

import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://alluring-embrace-production.up.railway.app/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ─── Request interceptor: attach token ───────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: normalise errors ───────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    const status = error.response?.status;

    // Token expired or invalid — clear session and redirect to login
    if (status === 401 && typeof window !== "undefined") {
      Cookies.remove("accessToken");
      Cookies.remove("userRole");
      Cookies.remove("userId");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Bubble up a readable message from the API envelope
    const serverMessage =
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred.";

    return Promise.reject(new Error(serverMessage));
  }
);

export default apiClient;
