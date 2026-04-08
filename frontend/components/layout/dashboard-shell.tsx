"use client";

import { Sidebar } from "@/features/dashboard/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-zinc-950 text-zinc-100 md:grid-cols-[240px_1fr]">
      <Sidebar />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
