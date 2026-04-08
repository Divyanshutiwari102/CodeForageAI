"use client";

import { memo } from "react";
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

interface RowProps {
  node: FileNode;
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  onToggle: (id: string) => void;
  onOpen: (node: FileNode) => void;
  level: number;
}

const FileTreeRow = memo(function FileTreeRow({ node, expanded, activeFileId, onToggle, onOpen, level }: RowProps) {
  const isFolder = node.type === "folder";
  const open = Boolean(expanded[node.id]);
  const isActiveFile = activeFileId === node.id;

  return (
    <li>
      <button
        type="button"
        onClick={() => (isFolder ? onToggle(node.id) : onOpen(node))}
        className={cn(
          "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-all duration-150",
          isActiveFile
            ? "bg-sky-400/[0.12] font-medium text-sky-200"
            : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200",
        )}
        style={{ paddingLeft: 8 + level * 16 }}
      >
        {isFolder ? (
          <>
            <ChevronRight className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform duration-200", open && "rotate-90")} />
            <Folder className={cn("h-3.5 w-3.5 transition-colors", open ? "text-sky-300" : "text-zinc-500 group-hover:text-zinc-300")} />
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <File className={cn("h-3.5 w-3.5 transition-colors", isActiveFile ? "text-sky-300" : "text-zinc-500 group-hover:text-zinc-300")} />
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
});

function FileTreeComponent({ nodes, expanded, activeFileId, onToggle, onOpen, level = 0 }: Props) {
  if (nodes.length === 0) {
    return <div className="rounded-md border border-white/10 bg-white/5 p-2 text-xs text-zinc-400">No files found.</div>;
  }

  return (
    <ul className={cn("space-y-1", level > 0 && "border-l border-white/[0.04] pl-1")}> 
      {nodes.map((node) => (
        <FileTreeRow
          key={node.id}
          node={node}
          expanded={expanded}
          activeFileId={activeFileId}
          onToggle={onToggle}
          onOpen={onOpen}
          level={level}
        />
      ))}
    </ul>
  );
}

export const FileTree = memo(FileTreeComponent);
