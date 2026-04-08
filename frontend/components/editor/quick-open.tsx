"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Fuse from "fuse.js";
import type { FuseResultMatch } from "fuse.js";
import { cn } from "@/utils/cn";
import type { FileNode } from "@/types";

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
    if (node.type === "file") {
      files.push(node);
      continue;
    }
    if (node.children?.length) {
      files.push(...flattenFiles(node.children));
    }
  }
  return files;
}

export function QuickOpen({ open, query, files, onQueryChange, onClose, onSelect }: Props) {
  const fileList = useMemo(() => flattenFiles(files), [files]);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [recentFileIds, setRecentFileIds] = useState<string[]>([]);

  const fuse = useMemo(
    () =>
      new Fuse(fileList, {
        includeMatches: true,
        threshold: 0.4,
        keys: [
          { name: "name", weight: 0.7 },
          { name: "id", weight: 0.3 },
        ],
      }),
    [fileList],
  );

  const queryTrimmed = query.trim();
  const results = useMemo(() => {
    if (!queryTrimmed) {
      return fileList.slice(0, 20).map((file) => ({ item: file, matches: [] as FuseResultMatch[] }));
    }
    return fuse.search(queryTrimmed, { limit: 20 });
  }, [fileList, fuse, queryTrimmed]);

  const recentResults = useMemo(
    () => recentFileIds.map((id) => fileList.find((file) => file.id === id)).filter((file): file is FileNode => Boolean(file)).slice(0, 5),
    [fileList, recentFileIds],
  );

  const visibleItems = useMemo(() => results.map((result) => result.item), [results]);

  const selectFile = useCallback(
    (file: FileNode) => {
      setRecentFileIds((prev) => [file.id, ...prev.filter((id) => id !== file.id)].slice(0, 10));
      onSelect(file);
    },
    [onSelect],
  );

  function renderHighlighted(text: string, ranges: readonly [number, number][]) {
    if (!ranges.length) return <>{text}</>;
    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
    const parts: ReactNode[] = [];
    let cursor = 0;
    for (const [start, end] of sorted) {
      if (start > cursor) {
        parts.push(<span key={`plain-${cursor}`}>{text.slice(cursor, start)}</span>);
      }
      parts.push(
        <span key={`hl-${start}-${end}`} className="rounded bg-sky-500/20 px-0.5 text-sky-200">
          {text.slice(start, end + 1)}
        </span>,
      );
      cursor = end + 1;
    }
    if (cursor < text.length) {
      parts.push(<span key={`plain-end-${cursor}`}>{text.slice(cursor)}</span>);
    }
    return <>{parts}</>;
  }

  useEffect(() => {
    if (!open) return;

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const size = Math.max(visibleItems.length, 1);
          return (prev + 1) % size;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((prev) => {
          const maxIndex = Math.max(visibleItems.length - 1, 0);
          if (prev > maxIndex) return maxIndex;
          return Math.max(prev - 1, 0);
        });
        return;
      }

      if (event.key === "Enter") {
        if (!visibleItems.length) return;
        event.preventDefault();
        selectFile(visibleItems[Math.min(highlightedIndex, visibleItems.length - 1)]);
      }
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [highlightedIndex, onClose, open, selectFile, visibleItems]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-20 w-full max-w-2xl overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-900/95 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-white/[0.08] p-3">
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Type a file name (Ctrl/Cmd+P)"
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
          />
        </div>

        {!queryTrimmed && recentResults.length > 0 ? (
          <div className="border-b border-white/[0.08] px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Recent</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {recentResults.map((file) => (
                <button
                  key={`recent-${file.id}`}
                  type="button"
                  onClick={() => selectFile(file)}
                  className="rounded border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300 transition hover:bg-white/[0.08]"
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <ul className="max-h-[420px] overflow-auto p-2">
          {results.length === 0 ? (
            <li className="rounded-md px-3 py-2 text-xs text-zinc-500">No matching files</li>
          ) : (
            results.map((result, index) => {
              const file = result.item;
              const idMatches = (result.matches ?? []).find((match) => match.key === "id")?.indices ?? [];
              const nameMatches = (result.matches ?? []).find((match) => match.key === "name")?.indices ?? [];
              return (
                <li key={file.id}>
                  <button
                    type="button"
                    onClick={() => selectFile(file)}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm text-zinc-200 transition hover:bg-white/[0.08]",
                      index === highlightedIndex && "bg-white/[0.08]",
                    )}
                  >
                    <span className="block truncate">{renderHighlighted(file.name, nameMatches)}</span>
                    <span className="block truncate text-xs text-zinc-500">{renderHighlighted(file.id, idMatches)}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
