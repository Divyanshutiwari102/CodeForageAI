"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { setAuthToken } from "@/services/token";
import { useAuthStore } from "@/store/useAuthStore";

function OAuthCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = params.get("token");
    const error = params.get("error");

    if (error || !token) {
      router.replace(`/login?error=${error ?? "oauth_failed"}`);
      return;
    }

    setAuthToken(token);
    useAuthStore
      .getState()
      .loadUser()
      .then(() => {
        router.replace("/dashboard");
      })
      .catch(() => {
        router.replace("/login?error=load_user_failed");
      });
  }, [params, router]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-4"
      style={{ background: "#0a0a0f" }}
    >
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
      <p className="text-sm text-white/40">Signing you in…</p>
    </div>
  );
}

export default function OAuthCallback() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: "#0a0a0f" }}
        >
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  );
}
