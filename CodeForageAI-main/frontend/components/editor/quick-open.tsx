"use client";

import { useEffect, useMemo } from "react";
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
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () => (q ? fileList.filter((f) => f.id.toLowerCase().includes(q) || f.name.toLowerCase().includes(q)) : fileList).slice(0, 20),
    [fileList, q],
  );

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
          {filtered.length === 0 ? (
            <li className="rounded-md px-3 py-2 text-xs text-slate-400">No matching files</li>
          ) : (
            filtered.map((file) => (
              <li key={file.id}>
                <button
                  type="button"
                  onClick={() => onSelect(file)}
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10"
                >
                  <span className="block truncate">{file.name}</span>
                  <span className="block truncate text-xs text-slate-400">{file.id}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
