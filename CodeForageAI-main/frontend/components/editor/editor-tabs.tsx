"use client";

import { X } from "lucide-react";
import type { EditorTab } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  tabs: EditorTab[];
  activeFileId: string | null;
  onActivate: (fileId: string) => void;
  onClose: (fileId: string) => void;
}

export function EditorTabs({ tabs, activeFileId, onActivate, onClose }: Props) {
  return (
    <div className="flex h-11 items-center gap-1 overflow-x-auto border-b border-white/10 bg-slate-900/70 px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onActivate(tab.fileId)}
          className={cn(
            "group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition",
            activeFileId === tab.fileId ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
          )}
        >
          {tab.title}
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClose(tab.fileId);
            }}
            className="rounded p-0.5 opacity-70 transition hover:bg-white/10 hover:opacity-100"
          >
            <X className="h-3 w-3" />
          </span>
        </button>
      ))}
    </div>
  );
}
