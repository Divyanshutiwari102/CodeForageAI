import axios from "axios";

export const API_ERROR_EVENT = "api:error";

export interface ApiErrorEventDetail {
  message: string;
  statusCode?: number;
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (!axios.isAxiosError(error)) return fallback;
  const data = error.response?.data as { message?: unknown } | undefined;
  const message = data?.message;
  return typeof message === "string" && message.trim().length > 0 ? message.trim() : fallback;
}

export function emitApiError(detail: ApiErrorEventDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ApiErrorEventDetail>(API_ERROR_EVENT, { detail }));
}
