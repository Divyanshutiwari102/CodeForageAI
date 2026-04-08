"use client";

import { Search, Bell } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  return (
    <div
      className="sticky top-0 z-20 flex h-14 flex-shrink-0 items-center justify-between border-b px-4 sm:px-6"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(10,10,15,0.85)", backdropFilter: "blur(16px)" }}
    >
      <div
        className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2 text-sm text-white/35 transition-colors hover:border-white/10 hover:text-white/55 cursor-text"
        role="button" tabIndex={0}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search projects…</span>
        <kbd className="ml-4 rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/20">⌘K</kbd>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/30 transition-colors hover:bg-white/[0.07] hover:text-white/60"
          aria-label="Notifications"
        >
          <Bell className="h-3.5 w-3.5" />
        </button>
        {user && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-xs font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        )}
      </div>
    </div>
  );
}
export { Topbar as DashboardTopbar };
