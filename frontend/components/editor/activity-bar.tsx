"use client";

import { useState } from "react";
import { Eye, Files, GitBranch, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";

const items = [
  { icon: Files, label: "Explorer" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Eye, label: "Preview" },
  { icon: GitBranch, label: "Source Control" },
];

export function ActivityBar() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <aside className="flex w-12 flex-col items-center gap-2 border-r border-white/[0.06] bg-zinc-950 py-3">
      {items.map(({ icon: Icon, label }, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={label}
            type="button"
            aria-label={label}
            title={label}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative rounded-lg p-2 text-zinc-500 transition-all",
              active ? "bg-white/[0.06] text-zinc-100" : "hover:bg-white/[0.04] hover:text-zinc-300",
            )}
          >
            {active ? <span className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-sky-400" /> : null}
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </aside>
  );
}
