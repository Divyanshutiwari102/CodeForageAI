"use client";

import { memo, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FolderOpen, Folder } from "lucide-react";
import { cn } from "@/utils/cn";
import { getFileIcon } from "@/utils/file-icons";
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

function FileIconBadge({ name, isFolder, isOpen }: { name: string; isFolder: boolean; isOpen?: boolean }) {
  const icon = getFileIcon(name, isFolder);
  if (isFolder) {
    return isOpen
      ? <FolderOpen className="h-3.5 w-3.5 flex-shrink-0" style={{ color: icon.color }} />
      : <Folder className="h-3.5 w-3.5 flex-shrink-0" style={{ color: icon.color }} />;
  }
  const isText = icon.symbol.length > 1;
  if (isText) {
    return (
      <span
        className="flex-shrink-0 rounded font-mono text-[8px] font-bold leading-none tracking-tight"
        style={{
          color: icon.color, background: `${icon.color}18`,
          padding: "2px 2px", minWidth: 16, textAlign: "center", display: "inline-block",
        }}
      >
        {icon.symbol.slice(0, 3)}
      </span>
    );
  }
  return <span className="flex-shrink-0 text-[13px] leading-none" style={{ color: icon.color }}>{icon.symbol}</span>;
}

interface ContextMenuProps { x: number; y: number; node: FileNode; onClose: () => void; }
function ContextMenu({ x, y, node, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("mousedown", handler); window.removeEventListener("keydown", onKey); };
  }, [onClose]);

  const items = [
    { label: "Copy path", action: () => { void navigator.clipboard.writeText(node.id); onClose(); } },
    { label: "Copy name", action: () => { void navigator.clipboard.writeText(node.name); onClose(); } },
    ...(node.type === "file" ? [{ label: "Open in new tab", action: onClose }] : []),
  ];

  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.94, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[200] min-w-[160px] overflow-hidden rounded-xl border py-1 shadow-2xl"
      style={{ left: x, top: y, background: "#1a1a26", borderColor: "rgba(255,255,255,0.1)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}
    >
      <p className="border-b border-white/[0.06] px-3 py-1.5 text-[10px] text-white/30 truncate max-w-[180px]">{node.name}</p>
      {items.map((item) => (
        <button key={item.label} onClick={item.action}
          className="flex w-full px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white/90">
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

const FileTreeRow = memo(function FileTreeRow({ node, expanded, activeFileId, onToggle, onOpen, level }: RowProps) {
  const isFolder = node.type === "folder";
  const isOpen = Boolean(expanded[node.id]);
  const isActive = activeFileId === node.id;
  const [ctx, setCtx] = useState<{ x: number; y: number } | null>(null);

  const handleCtx = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCtx({ x: e.clientX, y: e.clientY });
  }, []);

  const handleClick = useCallback(() => {
    if (isFolder) onToggle(node.id); else onOpen(node);
  }, [isFolder, node, onToggle, onOpen]);

  return (
    <li>
      <button type="button" onClick={handleClick} onContextMenu={handleCtx}
        className={cn(
          "group relative flex w-full items-center gap-1.5 rounded-md py-[5px] pr-2 text-left text-xs outline-none",
          "transition-colors duration-100 focus-visible:ring-1 focus-visible:ring-violet-500/60",
          isActive ? "text-white" : "text-white/45 hover:text-white/80",
        )}
        style={{ paddingLeft: 8 + level * 14 }}
      >
        {isActive && (
          <motion.span layoutId="file-active-bg" className="absolute inset-0 rounded-md"
            style={{ background: "rgba(139,92,246,0.11)", border: "1px solid rgba(139,92,246,0.18)" }}
            transition={{ type: "spring", stiffness: 500, damping: 40 }} />
        )}
        {!isActive && (
          <span className="absolute inset-0 rounded-md bg-transparent transition-colors group-hover:bg-white/[0.04]" />
        )}
        <span className="relative z-10 flex-shrink-0" style={{ width: 14 }}>
          {isFolder && (
            <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.14 }} className="flex items-center">
              <ChevronRight className="h-3 w-3 text-white/20 group-hover:text-white/40" />
            </motion.span>
          )}
        </span>
        <span className="relative z-10 flex items-center justify-center" style={{ minWidth: 18 }}>
          <FileIconBadge name={node.name} isFolder={isFolder} isOpen={isOpen} />
        </span>
        <span className="relative z-10 flex-1 truncate leading-none">{node.name}</span>
        {!isFolder && isActive && (
          <span className="relative z-10 ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400/60" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isFolder && isOpen && node.children?.length ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.17, ease: "easeInOut" }} style={{ overflow: "hidden" }}
          >
            <div className="relative">
              <div className="absolute bottom-0 top-0 w-px"
                style={{ left: 8 + level * 14 + 15, background: "rgba(255,255,255,0.05)" }} />
              <FileTreeInner nodes={node.children} expanded={expanded} activeFileId={activeFileId}
                onToggle={onToggle} onOpen={onOpen} level={level + 1} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {ctx && <ContextMenu x={ctx.x} y={ctx.y} node={node} onClose={() => setCtx(null)} />}
      </AnimatePresence>
    </li>
  );
});

function FileTreeInner({ nodes, expanded, activeFileId, onToggle, onOpen, level = 0 }: Props) {
  if (!nodes.length) return <div className="px-3 py-2 text-[11px] text-white/20">Empty</div>;
  const sorted = [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return (
    <ul className="space-y-0" role="tree">
      {sorted.map((node) => (
        <FileTreeRow key={node.id} node={node} expanded={expanded} activeFileId={activeFileId}
          onToggle={onToggle} onOpen={onOpen} level={level} />
      ))}
    </ul>
  );
}

export const FileTree = memo(FileTreeInner);
