import { getApiBaseUrl } from "@/services/config";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

let csrfBootstrapPromise: Promise<void> | null = null;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function getCsrfHeaderName(): string {
  return CSRF_HEADER_NAME;
}

export function getCsrfToken(): string | null {
  return readCookie(CSRF_COOKIE_NAME);
}

export async function ensureCsrfToken(): Promise<void> {
  if (typeof window === "undefined") return;
  if (getCsrfToken()) return;
  if (!csrfBootstrapPromise) {
    const baseUrl = getApiBaseUrl();
    csrfBootstrapPromise = fetch(`${baseUrl}/auth/csrf`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    })
      .then(() => undefined)
      .finally(() => {
        csrfBootstrapPromise = null;
      });
  }
  await csrfBootstrapPromise;
}
