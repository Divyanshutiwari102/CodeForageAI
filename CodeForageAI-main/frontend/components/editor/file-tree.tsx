"use client";

import { ChevronRight, File, Folder } from "lucide-react";
import { cn } from "@/utils/cn";
import type { FileNode } from "@/types";

interface Props {
  nodes: FileNode[];
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  onToggle: (id: string) => void;
  onOpen: (node: FileNode) => void;
  level?: number;
}

export function FileTree({ nodes, expanded, activeFileId, onToggle, onOpen, level = 0 }: Props) {
  if (nodes.length === 0) {
    return <div className="rounded-md border border-white/10 bg-white/5 p-2 text-xs text-slate-400">No files found.</div>;
  }

  return (
    <ul className={cn("space-y-1", level > 0 && "border-l border-white/5 pl-1")}>
      {nodes.map((node) => {
        const isFolder = node.type === "folder";
        const open = Boolean(expanded[node.id]);
        const isActiveFile = activeFileId === node.id;

        return (
          <li key={node.id}>
            <button
              type="button"
              onClick={() => (isFolder ? onToggle(node.id) : onOpen(node))}
              className={cn(
                "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all duration-200",
                isActiveFile
                  ? "bg-cyan-500/20 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                  : "text-slate-300 hover:bg-white/10 hover:text-slate-100",
              )}
              style={{ paddingLeft: 8 + level * 14 }}
            >
              {isFolder ? (
                <>
                  <ChevronRight className={cn("h-3.5 w-3.5 text-slate-500 transition-transform duration-200", open && "rotate-90")} />
                  <Folder className={cn("h-3.5 w-3.5 transition-colors", open ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-300")} />
                </>
              ) : (
                <>
                  <span className="w-3.5" />
                  <File className={cn("h-3.5 w-3.5 transition-colors", isActiveFile ? "text-cyan-300" : "text-slate-400 group-hover:text-slate-200")} />
                </>
              )}
              <span className="truncate">{node.name}</span>
            </button>

            {isFolder && open && node.children?.length ? (
              <FileTree
                nodes={node.children}
                expanded={expanded}
                activeFileId={activeFileId}
                onToggle={onToggle}
                onOpen={onOpen}
                level={level + 1}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
