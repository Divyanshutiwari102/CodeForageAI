"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void error;
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center">
        <h1 className="text-xl font-semibold text-rose-100">Something went wrong</h1>
        <p className="mt-2 text-sm text-rose-200/90">An unexpected error occurred. Please try again.</p>
        <Button className="mt-5 w-full" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
