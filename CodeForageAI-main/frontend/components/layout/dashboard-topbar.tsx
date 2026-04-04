"use client";

import { Search, Bell } from "lucide-react";

export function DashboardTopbar() {
  return (
    <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-slate-950/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
        <Search className="h-4 w-4" />
        Search projects...
      </div>
      <button className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10">
        <Bell className="h-4 w-4" />
      </button>
    </div>
  );
}
