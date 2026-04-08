"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getFileIcon } from "@/utils/file-icons";
import type { EditorTab } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  tabs: EditorTab[];
  activeFileId: string | null;
  onActivate: (fileId: string) => void;
  onClose: (fileId: string) => void;
}

function TabFileIcon({ title }: { title: string }) {
  const icon = getFileIcon(title, false);
  if (icon.symbol.length > 1) {
    return (
      <span
        className="flex-shrink-0 rounded font-mono text-[7px] font-bold leading-none"
        style={{ color: icon.color, background: `${icon.color}18`, padding: "1px 2px", minWidth: 14, textAlign: "center", display: "inline-block" }}
      >
        {icon.symbol.slice(0, 3)}
      </span>
    );
  }
  return <span className="flex-shrink-0 text-[11px] leading-none" style={{ color: icon.color }}>{icon.symbol}</span>;
}

export function EditorTabs({ tabs, activeFileId, onActivate, onClose }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (!activeFileId || !scrollRef.current) return;
    const el = scrollRef.current.querySelector(`[data-fileid="${activeFileId}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeFileId]);

  if (tabs.length === 0) {
    return (
      <div
        className="flex h-11 items-center border-b px-4"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0d0d14" }}
      >
        <span className="text-xs text-white/20 select-none">No files open</span>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex h-11 items-stretch overflow-x-auto border-b"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0d0d14", scrollbarWidth: "none" }}
      role="tablist"
      aria-label="Open files"
    >
      <AnimatePresence initial={false}>
        {tabs.map((tab) => {
          const isActive = tab.fileId === activeFileId;
          return (
            <motion.div
              key={tab.id}
              data-fileid={tab.fileId}
              layout
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="relative flex flex-shrink-0 items-stretch"
              role="tab"
              aria-selected={isActive}
            >
              {/* Active tab indicator — bottom border */}
              {isActive && (
                <motion.div
                  layoutId="tab-active-line"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                  style={{ background: "#7c3aed" }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}

              <button
                onClick={() => onActivate(tab.fileId)}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 text-xs outline-none transition-colors duration-100",
                  "focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-violet-500/60",
                  isActive
                    ? "text-white"
                    : "text-white/35 hover:text-white/65",
                )}
                style={isActive ? { background: "rgba(255,255,255,0.04)" } : {}}
                aria-label={`${tab.title}${tab.isDirty ? " (unsaved)" : ""}`}
              >
                <TabFileIcon title={tab.title} />
                <span className="truncate max-w-[120px]">{tab.title}</span>
                {/* Unsaved dot */}
                {tab.isDirty && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400/80"
                    aria-label="Unsaved changes"
                  />
                )}
              </button>

              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); onClose(tab.fileId); }}
                className={cn(
                  "flex items-center justify-center px-1.5 text-white/20 transition-colors",
                  "hover:text-white/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/60",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                )}
                style={{ background: "transparent" }}
                aria-label={`Close ${tab.title}`}
              >
                <X className="h-3 w-3" />
              </button>

              {/* Separator */}
              {!isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-px" style={{ background: "rgba(255,255,255,0.05)" }} />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
