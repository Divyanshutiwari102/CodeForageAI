"use client";

import { Bell, Search, Sparkles } from "lucide-react";

export function Topbar() {
  return (
    <div className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.06] bg-zinc-950/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-[220px] items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-zinc-300 focus-within:border-sky-400/40 focus-within:ring-2 focus-within:ring-sky-400/15">
        <Search className="h-4 w-4" />
        <span>Search projects...</span>
        <kbd className="ml-auto rounded border border-white/[0.1] px-1.5 py-0.5 text-[10px] text-zinc-500">⌘K</kbd>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-200 transition hover:bg-white/[0.08]">
          <Sparkles className="h-3.5 w-3.5 text-sky-300" />
          New project
        </button>
        <button className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-zinc-200 transition hover:bg-white/[0.08]">
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
