"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { AUTH_UNAUTHORIZED_EVENT } from "@/services/auth-events";

export function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "USER" | "ADMIN";
}) {
  const router = useRouter();
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading, user } = useAuthStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    useAuthStore
      .getState()
      .init()
      .catch(() => router.replace("/login"))
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
    if (!isReady || isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.replace("/dashboard");
    }
  }, [isReady, isLoading, isAuthenticated, requiredRole, user?.role, router]);

  if (!isReady || isLoading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4"
        style={{ background: "#0a0a0f" }}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-400/30 border-t-violet-400" />
        <p className="text-sm text-white/30">Loading…</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  return <>{children}</>;
}
