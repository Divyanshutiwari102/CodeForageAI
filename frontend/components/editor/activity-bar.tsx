"use client";

import { Files, MessageSquare, Eye, GitBranch } from "lucide-react";

const items = [Files, MessageSquare, Eye, GitBranch];

export function ActivityBar() {
  return (
    <aside className="flex w-12 flex-col items-center gap-3 border-r border-white/10 bg-slate-950/90 py-3">
      {items.map((Icon, i) => (
        <button
          key={i}
          className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
          aria-label="activity"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </aside>
  );
}
