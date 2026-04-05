import axios from "axios";
import { clearAuthToken, getAuthToken } from "@/services/token";
import { AUTH_UNAUTHORIZED_EVENT } from "@/services/auth-events";
import { getApiBaseUrl } from "@/services/config";
import { emitApiError, getErrorMessage } from "@/services/errors";

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status;
    if (statusCode === 401) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
      }
    }
    emitApiError({
      message: getErrorMessage(error),
      statusCode,
    });
    return Promise.reject(error);
  },
);
