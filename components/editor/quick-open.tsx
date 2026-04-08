"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import type { FuseResultMatch } from "fuse.js";
import { Search, Clock, X } from "lucide-react";
import { getFileIcon } from "@/utils/file-icons";
import type { FileNode } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  open: boolean;
  query: string;
  files: FileNode[];
  onQueryChange: (value: string) => void;
  onClose: () => void;
  onSelect: (file: FileNode) => void;
}

function flattenFiles(nodes: FileNode[]): FileNode[] {
  const files: FileNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") files.push(node);
    else if (node.children?.length) files.push(...flattenFiles(node.children));
  }
  return files;
}

function FileResultIcon({ name }: { name: string }) {
  const icon = getFileIcon(name, false);
  if (icon.symbol.length > 1) {
    return (
      <span className="flex-shrink-0 rounded font-mono text-[8px] font-bold"
        style={{ color: icon.color, background: `${icon.color}18`, padding: "2px 3px", minWidth: 18, textAlign: "center", display: "inline-block" }}>
        {icon.symbol.slice(0, 3)}
      </span>
    );
  }
  return <span className="flex-shrink-0 text-sm" style={{ color: icon.color }}>{icon.symbol}</span>;
}

function renderHighlighted(text: string, ranges: readonly [number, number][]): ReactNode {
  if (!ranges.length) return <>{text}</>;
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const [start, end] of sorted) {
    if (start > cursor) parts.push(<span key={`p-${cursor}`}>{text.slice(cursor, start)}</span>);
    parts.push(
      <span key={`h-${start}`} className="rounded bg-violet-500/20 text-violet-200 px-0.5">
        {text.slice(start, end + 1)}
      </span>
    );
    cursor = end + 1;
  }
  if (cursor < text.length) parts.push(<span key={`p-end`}>{text.slice(cursor)}</span>);
  return <>{parts}</>;
}

export function QuickOpen({ open, query, files, onQueryChange, onClose, onSelect }: Props) {
  const fileList = useMemo(() => flattenFiles(files), [files]);
  const [highlighted, setHighlighted] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const fuse = useMemo(
    () => new Fuse(fileList, {
      includeMatches: true, threshold: 0.4,
      keys: [{ name: "name", weight: 0.7 }, { name: "id", weight: 0.3 }],
    }),
    [fileList],
  );

  const trimmed = query.trim();
  const results = useMemo(() => {
    if (!trimmed) return fileList.slice(0, 20).map((item) => ({ item, matches: [] as FuseResultMatch[] }));
    return fuse.search(trimmed, { limit: 20 });
  }, [fileList, fuse, trimmed]);

  const items = useMemo(() => results.map((r) => r.item), [results]);
  const recentFiles = useMemo(() =>
    recent.map((id) => fileList.find((f) => f.id === id)).filter(Boolean).slice(0, 5) as FileNode[],
    [fileList, recent],
  );

  const selectFile = useCallback((file: FileNode) => {
    setRecent((prev) => [file.id, ...prev.filter((id) => id !== file.id)].slice(0, 10));
    onSelect(file);
  }, [onSelect]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => (h + 1) % Math.max(items.length, 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); return; }
      if (e.key === "Enter" && items.length > 0) { e.preventDefault(); selectFile(items[Math.min(highlighted, items.length - 1)]); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, items, highlighted, selectFile]);

  useEffect(() => { setHighlighted(0); }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50" style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
            onClick={onClose} aria-hidden="true" />

          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" role="dialog" aria-label="Quick open file">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -12 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl"
              style={{ background: "#14141e", borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 32px 80px rgba(0,0,0,0.7)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
                <Search className="h-4 w-4 flex-shrink-0 text-white/30" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search files…"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
                  aria-label="File search"
                />
                <div className="flex items-center gap-2">
                  <kbd className="rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/25">ESC</kbd>
                  <button onClick={onClose} className="text-white/25 transition-colors hover:text-white/50">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Recents (when no query) */}
              {!trimmed && recentFiles.length > 0 && (
                <div className="border-b border-white/[0.05] px-3 py-2">
                  <div className="mb-1.5 flex items-center gap-1.5 px-1">
                    <Clock className="h-3 w-3 text-white/20" />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/20">Recent</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {recentFiles.map((f) => (
                      <button key={f.id} onClick={() => selectFile(f)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-xs text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/80">
                        <FileResultIcon name={f.name} />
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Results list */}
              <ul className="max-h-80 overflow-auto py-1.5" role="listbox">
                {results.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-white/25">No files match "{trimmed}"</li>
                ) : (
                  results.map((result, i) => {
                    const file = result.item;
                    const nameRanges = (result.matches ?? []).find((m) => m.key === "name")?.indices ?? [];
                    const pathRanges = (result.matches ?? []).find((m) => m.key === "id")?.indices ?? [];
                    const isHighlighted = i === highlighted;
                    return (
                      <li key={file.id} role="option" aria-selected={isHighlighted}>
                        <motion.button
                          type="button"
                          onClick={() => selectFile(file)}
                          onMouseEnter={() => setHighlighted(i)}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75",
                            isHighlighted ? "bg-white/[0.06]" : "hover:bg-white/[0.04]",
                          )}
                          whileTap={{ scale: 0.99 }}
                        >
                          <FileResultIcon name={file.name} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm text-white/80">
                              {renderHighlighted(file.name, nameRanges)}
                            </p>
                            <p className="truncate text-[11px] text-white/30 font-mono">
                              {renderHighlighted(file.id, pathRanges)}
                            </p>
                          </div>
                          {isHighlighted && (
                            <kbd className="flex-shrink-0 rounded border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-white/25">↵</kbd>
                          )}
                        </motion.button>
                      </li>
                    );
                  })
                )}
              </ul>

              {/* Footer */}
              <div className="border-t border-white/[0.05] px-4 py-2 flex items-center gap-4 text-[10px] text-white/20">
                <span><kbd className="rounded border border-white/[0.08] px-1">↑↓</kbd> navigate</span>
                <span><kbd className="rounded border border-white/[0.08] px-1">↵</kbd> open</span>
                <span><kbd className="rounded border border-white/[0.08] px-1">ESC</kbd> close</span>
                <span className="ml-auto">{results.length} files</span>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
