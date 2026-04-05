"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center">
          <h1 className="text-xl font-semibold text-rose-100">Application error</h1>
          <p className="mt-2 text-sm text-rose-200/90">A critical error occurred. Please retry.</p>
          <Button className="mt-5 w-full" onClick={reset}>
            Reload app
          </Button>
        </div>
      </body>
    </html>
  );
}
