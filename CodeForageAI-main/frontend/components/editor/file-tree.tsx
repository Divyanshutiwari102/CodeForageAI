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
  return (
    <ul className="space-y-1">
      {nodes.map((node) => {
        const isFolder = node.type === "folder";
        const open = expanded[node.id];

        return (
          <li key={node.id}>
            <button
              onClick={() => (isFolder ? onToggle(node.id) : onOpen(node))}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition",
                activeFileId === node.id ? "bg-cyan-500/20 text-cyan-200" : "text-slate-300 hover:bg-white/10",
              )}
              style={{ paddingLeft: 8 + level * 12 }}
            >
              {isFolder ? (
                <>
                  <ChevronRight className={cn("h-3.5 w-3.5 transition", open && "rotate-90")} />
                  <Folder className="h-3.5 w-3.5 text-cyan-300" />
                </>
              ) : (
                <>
                  <span className="w-3.5" />
                  <File className="h-3.5 w-3.5 text-slate-400" />
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
