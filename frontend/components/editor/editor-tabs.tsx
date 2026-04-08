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
    <div className="flex h-11 items-center overflow-x-auto border-b border-white/[0.06] bg-zinc-950/80">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onActivate(tab.fileId)}
          className={cn(
            "group inline-flex h-full items-center gap-2 border-r border-white/[0.05] px-4 text-[12.5px] transition-all duration-150",
            activeFileId === tab.fileId
              ? "-mt-px border-t-2 border-t-sky-400 bg-zinc-900 text-white"
              : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
          )}
        >
          <span className="truncate">{tab.title}</span>
          {tab.isDirty ? <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sky-300" /> : null}
          <span
            onClick={(event) => {
              event.stopPropagation();
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
