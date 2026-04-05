const AUTH_TOKEN_KEY = "auth_token";
const LEGACY_AUTH_TOKEN_KEY = "auth_token_legacy";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LEGACY_AUTH_TOKEN_KEY) ?? localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  void token;
  if (typeof window === "undefined") return;
  // Preferred auth path is httpOnly cookie from backend; do not persist JWT in localStorage.
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
