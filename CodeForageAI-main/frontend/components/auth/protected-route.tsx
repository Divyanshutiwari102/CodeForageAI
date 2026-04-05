"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { AUTH_UNAUTHORIZED_EVENT } from "@/services/auth-events";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    useAuthStore
      .getState()
      .init()
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setIsReady(true));
  }, [router]);

  useEffect(() => {
    function onUnauthorized() {
      router.replace("/login");
    }

    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, onUnauthorized);
  }, [router]);

  useEffect(() => {
    if (isReady && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isReady, isLoading, isAuthenticated, router]);

  if (!isReady || isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-400">Checking session...</div>;
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
