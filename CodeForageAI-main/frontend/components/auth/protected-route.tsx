"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    void Promise.resolve()
      .then(() => useAuthStore.getState().init())
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  useEffect(() => {
    function onUnauthorized() {
      router.replace("/login");
    }

    window.addEventListener("auth:unauthorized", onUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", onUnauthorized);
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
