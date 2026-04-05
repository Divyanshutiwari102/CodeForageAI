import axios from "axios";
import { clearAuthToken, getAuthToken } from "@/services/token";
import { AUTH_UNAUTHORIZED_EVENT } from "@/services/auth-events";
import { getApiBaseUrl } from "@/services/config";

const TRACE_ID_KEY = "cfai-trace-id";

function getOrCreateTraceId(): string {
  if (typeof window === "undefined") return "server-trace";
  const existing = window.sessionStorage.getItem(TRACE_ID_KEY);
  if (existing) return existing;

  let generated = `${Date.now()}-${Math.floor(Math.random() * 1_000_000_000)}`;
  const webCrypto = window.crypto;
  if (webCrypto?.randomUUID) {
    generated = webCrypto.randomUUID();
  } else if (webCrypto?.getRandomValues) {
    const bytes = new Uint8Array(8);
    webCrypto.getRandomValues(bytes);
    generated = `${Date.now()}-${Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
  }

  window.sessionStorage.setItem(TRACE_ID_KEY, generated);
  return generated;
}

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
  config.headers["X-Trace-Id"] = getOrCreateTraceId();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
      }
    }
    return Promise.reject(error);
  },
);
