const API_URL_FALLBACK = "http://localhost:8080/api";

export function getApiBaseUrl(): string {
  const envValue = process.env.NEXT_PUBLIC_API_URL?.trim();
  const normalized = envValue && envValue.length > 0 ? envValue : API_URL_FALLBACK;
  return normalized.replace(/\/$/, "");
}
