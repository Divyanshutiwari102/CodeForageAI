"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading, init } = useAuthStore();

  useEffect(() => {
    void init().finally(() => setIsReady(true));
  }, [init]);

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
