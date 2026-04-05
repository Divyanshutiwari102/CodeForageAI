const AUTH_TOKEN_KEY = "auth_token";
// NOTE: localStorage is used to satisfy current backend JWT flow requirements.
// This remains vulnerable to XSS token theft; migrate to secure httpOnly cookies when backend support is available.

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
