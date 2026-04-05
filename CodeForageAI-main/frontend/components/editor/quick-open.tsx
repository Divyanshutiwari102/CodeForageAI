"use client";

import { useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import Fuse from "fuse.js";
import type { FuseResultMatch } from "fuse.js";
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

  function renderHighlighted(text: string, ranges: readonly [number, number][]) {
    if (!ranges.length) return <>{text}</>;
    const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
    const parts: ReactNode[] = [];
    let cursor = 0;
    for (const [start, end] of sorted) {
      if (start > cursor) parts.push(<span key={`plain-${cursor}`}>{text.slice(cursor, start)}</span>);
      parts.push(
        <span key={`hl-${start}-${end}`} className="rounded bg-cyan-500/20 px-0.5 text-cyan-200">
          {text.slice(start, end + 1)}
        </span>,
      );
      cursor = end + 1;
    }
    if (cursor < text.length) parts.push(<span key={`plain-end-${cursor}`}>{text.slice(cursor)}</span>);
    return <>{parts}</>;
  }

  useEffect(() => {
    if (!open) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 p-4" onClick={onClose}>
      <div className="mx-auto mt-20 w-full max-w-2xl rounded-xl border border-white/10 bg-slate-900/95 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-white/10 p-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Type a file name (Ctrl/Cmd+P)"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 outline-none ring-cyan-400 transition focus:ring-2"
          />
        </div>
        <ul className="max-h-[420px] overflow-auto p-2">
          {results.length === 0 ? (
            <li className="rounded-md px-3 py-2 text-xs text-slate-400">No matching files</li>
          ) : (
            results.map((result) => {
              const file = result.item;
              const idMatches = (result.matches ?? []).find((match) => match.key === "id")?.indices ?? [];
              const nameMatches = (result.matches ?? []).find((match) => match.key === "name")?.indices ?? [];
              return (
                <li key={file.id}>
                <button
                  type="button"
                  onClick={() => onSelect(file)}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <span className="block truncate">{renderHighlighted(file.name, nameMatches)}</span>
                  <span className="block truncate text-xs text-slate-400">{renderHighlighted(file.id, idMatches)}</span>
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
