"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Search, Share2, Wand2, X, ChevronRight, PanelRight, PanelLeft } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast } from "sonner";
import { ActivityBar } from "@/components/editor/activity-bar";
import { FileTree } from "@/components/editor/file-tree";
import { EditorTabs } from "@/components/editor/editor-tabs";
import { CodeEditor } from "@/components/editor/code-editor";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { QuickOpen } from "@/components/editor/quick-open";
import { useFilesStore } from "@/store/useFilesStore";
import { useChatStore } from "@/store/useChatStore";
import { exportProjectZip } from "@/services/files";
import { aiEditFile, saveChatAsCommit } from "@/services/chat";
import { shareProject } from "@/services/projects";
import type { FileNode } from "@/types";
import { selectMessages, selectTabs } from "@/store/selectors";
import { useResizable } from "@/hooks/useResizable";
import { SessionLimitModal } from "@/components/ui/session-limit-modal";
import { cn } from "@/utils/cn";

const HEADER_H = 48;

// Lazy-load heavy panels
const ChatPanel = dynamic(
  () => import("@/components/editor/chat-panel").then((m) => m.ChatPanel),
  { ssr: false, loading: () => <div style={{ background: "#0d0d14" }} className="h-full" /> },
);

// ─── Resize handle ────────────────────────────────────────────────────────────
function ResizeHandle({
  onMouseDown,
  isDragging,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
  isDragging: boolean;
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      className={cn(
        "group relative w-1 flex-shrink-0 cursor-col-resize transition-colors",
        isDragging ? "bg-violet-500/60" : "bg-white/[0.04] hover:bg-violet-500/40",
      )}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize panel"
    >
      <div
        className="absolute inset-y-4 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-white/0 transition-colors group-hover:bg-violet-400/50"
        style={isDragging ? { background: "rgba(167,139,250,0.7)" } : {}}
      />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function EditorPage({ projectId }: { projectId: string }) {
  const prefersReducedMotion = useReducedMotion();
  // Files state
  const tree = useFilesStore((s) => s.tree);
  const expanded = useFilesStore((s) => s.expanded);
  const activeFileId = useFilesStore((s) => s.activeFileId);
  const openTabIds = useFilesStore((s) => s.openTabIds);
  const tabsByFileId = useFilesStore((s) => s.tabsByFileId);
  const filesLoading = useFilesStore((s) => s.loading);
  const filesError = useFilesStore((s) => s.error);
  const loadTree = useFilesStore((s) => s.loadTree);
  const toggleFolder = useFilesStore((s) => s.toggleFolder);
  const openFile = useFilesStore((s) => s.openFile);
  const setActiveFile = useFilesStore((s) => s.setActiveFile);
  const closeTab = useFilesStore((s) => s.closeTab);
  const updateTabContent = useFilesStore((s) => s.updateTabContent);

  // Chat state
  const sessionId = useChatStore((s) => s.sessionId);
  const messageIds = useChatStore((s) => s.messageIds);
  const messagesById = useChatStore((s) => s.messagesById);
  const chatLoading = useChatStore((s) => s.loading);
  const chatError = useChatStore((s) => s.error);
  const boot = useChatStore((s) => s.boot);
  const send = useChatStore((s) => s.send);

  // Derived
  const tabs = useMemo(() => selectTabs(openTabIds, tabsByFileId), [openTabIds, tabsByFileId]);
  const messages = useMemo(() => selectMessages(messageIds, messagesById), [messageIds, messagesById]);
  const activeTab = useMemo(() => activeFileId ? tabsByFileId[activeFileId] ?? null : null, [tabsByFileId, activeFileId]);
  const allFiles = useMemo(() => {
    const stack = [...tree]; const files: FileNode[] = [];
    while (stack.length) { const n = stack.pop()!; if (n.type === "file") files.push(n); else if (n.children?.length) stack.push(...n.children); }
    return files.sort((a, b) => a.id.localeCompare(b.id));
  }, [tree]);

  // UI state
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [aiInstruction, setAiInstruction] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [exportTemplate, setExportTemplate] = useState(false);
  const [exportPaths, setExportPaths] = useState<string[]>([]);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 300, damping: 35 };
  const modalTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 400, damping: 35 };

  // Resizable panels
  const sidebar = useResizable({ initialSize: 256, minSize: 140, maxSize: 460, storageKey: "cfai-sidebar-w" });
  const chat    = useResizable({ initialSize: 320, minSize: 200, maxSize: 500, storageKey: "cfai-chat-w" });
  const preview = useResizable({ initialSize: 340, minSize: 200, maxSize: 560, storageKey: "cfai-preview-w" });

  // Boot
  useEffect(() => {
    void loadTree(projectId);
    void boot(projectId);
  }, [loadTree, boot, projectId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "p") { e.preventDefault(); setQuickOpen(true); }
      if (mod && e.shiftKey && e.key.toLowerCase() === "e") { e.preventDefault(); setShowExport(true); }
      if (mod && e.key === "\\") { e.preventDefault(); setShowChat((v) => !v); }
      if (e.key === "Escape") { setShowAiEdit(false); setShowExport(false); setQuickOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Handlers
  const handleExport = useCallback(async () => {
    const id = toast.loading("Preparing ZIP…"); setExportProgress(0);
    try {
      const { filename, blob } = await exportProjectZip(projectId, {
        asTemplate: exportTemplate,
        paths: exportPaths.length > 0 ? exportPaths : undefined,
        onProgress: (p) => setExportProgress(p),
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = filename;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast.success("Exported", { id }); setShowExport(false); setExportProgress(null);
    } catch { toast.error("Export failed", { id }); setExportProgress(null); }
  }, [exportTemplate, projectId, exportPaths]);

  const handleShare = useCallback(async () => {
    setShareLoading(true);
    try {
      const token = await shareProject(projectId);
      await navigator.clipboard.writeText(`${window.location.origin}/project/share/${token}`);
      toast.success("Share link copied!");
    } catch { toast.error("Failed to share"); } finally { setShareLoading(false); }
  }, [projectId]);

  const handleSaveCommit = useCallback(async () => {
    if (!sessionId) { toast.error("Chat not ready"); return; }
    setCommitLoading(true);
    try {
      const r = await saveChatAsCommit(sessionId);
      await loadTree(projectId);
      toast.success(`${r.message} (${r.filesCommitted} files)`);
    } catch { toast.error("Failed to save commit"); } finally { setCommitLoading(false); }
  }, [sessionId, loadTree, projectId]);

  const handleAiEdit = useCallback(async () => {
    if (!activeTab) { toast.error("Open a file first"); return; }
    const instr = aiInstruction.trim(); if (!instr) return;
    setAiEditLoading(true);
    try {
      const r = await aiEditFile(projectId, activeTab.fileId, instr);
      updateTabContent(activeTab.fileId, r.content);
      toast.success(`AI updated ${r.path}`);
      await loadTree(projectId);
      setShowAiEdit(false); setAiInstruction("");
    } catch { toast.error("AI edit failed"); } finally { setAiEditLoading(false); }
  }, [activeTab, aiInstruction, projectId, updateTabContent, loadTree]);

  // Toolbar buttons config
  const toolbarButtons = [
    { icon: Search,  label: "Search",  shortcut: "⌘P", onClick: () => setQuickOpen(true) },
    { icon: Wand2,   label: "AI Edit", onClick: () => { if (!activeTab) { toast.error("Open a file first"); return; } setShowAiEdit(true); }, busy: aiEditLoading },
    { icon: Share2,  label: "Share",   onClick: () => void handleShare(), busy: shareLoading },
    { icon: Download,label: "Export",  onClick: () => setShowExport(true) },
  ];

  return (
    <div className="h-screen overflow-hidden select-none" style={{ background: "#0a0a0f", color: "#f1f1f5" }}>
      {/* ── Top header ── */}
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b px-4"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0d0d15" }}>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/30 text-xs">Projects</span>
          <ChevronRight className="h-3.5 w-3.5 text-white/15" />
          <span className="font-medium text-white/70 text-xs">#{projectId}</span>
        </div>

        <div className="flex items-center gap-1">
          {toolbarButtons.map(({ icon: Icon, label, onClick, shortcut, busy }) => (
            <button key={label} type="button" onClick={onClick} disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-white/50 transition-colors hover:bg-white/[0.07] hover:text-white/75 disabled:opacity-40">
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
              {shortcut && <span className="text-white/20">{shortcut}</span>}
            </button>
          ))}

          <div className="mx-1 h-4 w-px bg-white/10" />

          {/* Panel toggles */}
          <button onClick={() => setShowChat((v) => !v)} title="Toggle chat (⌘\)"
            className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
              showChat ? "border-violet-500/30 bg-violet-500/10 text-violet-400" : "border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/60")}>
            <PanelRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowPreview((v) => !v)} title="Toggle preview"
            className={cn("flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
              showPreview ? "border-violet-500/30 bg-violet-500/10 text-violet-400" : "border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/60")}>
            <PanelLeft className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex overflow-hidden" style={{ height: `calc(100vh - ${HEADER_H}px)` }}>
        {/* Activity bar */}
        <ActivityBar />

        {/* Sidebar — file explorer (resizable) */}
        <div
          style={{ width: sidebar.size, flexShrink: 0, borderRight: "1px solid rgba(255,255,255,0.05)", background: "#0d0d14" }}
          className="flex flex-col overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 flex-shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/20 select-none">Explorer</p>
              <span className="text-[10px] text-white/15">{allFiles.length} files</span>
            </div>
            <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4 px-1">
              {filesLoading && (
                <div className="space-y-1.5 px-2 py-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-5 animate-pulse rounded bg-white/[0.05]" style={{ width: `${50 + (i * 31 + 7) % 45}%` }} />
                  ))}
                </div>
              )}
              {!filesLoading && filesError && (
                <div className="mx-2 rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-xs text-red-400">{filesError}</div>
              )}
              {!filesLoading && !filesError && tree.length === 0 && (
                <p className="px-3 py-4 text-xs text-white/25">No files in project</p>
              )}
              {!filesLoading && !filesError && tree.length > 0 && (
                <FileTree nodes={tree} expanded={expanded} activeFileId={activeFileId} onToggle={toggleFolder} onOpen={openFile} />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar resize handle */}
        <ResizeHandle onMouseDown={sidebar.handleMouseDown} isDragging={sidebar.isDragging} />

        {/* Editor — center */}
        <div className="flex min-w-0 flex-1 flex-col" style={{ background: "#0f0f18" }}>
          <EditorTabs tabs={tabs} activeFileId={activeFileId} onActivate={setActiveFile} onClose={closeTab} />
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              key={activeTab?.fileId ?? "empty"}
              value={activeTab?.content ?? "// Select a file from the explorer to start editing"}
              language={activeTab?.language ?? "typescript"}
              onChange={(v) => { if (activeTab?.fileId) updateTabContent(activeTab.fileId, v); }}
            />
          </div>
        </div>

        {/* Chat panel (resizable, toggleable) */}
        <AnimatePresence initial={false}>
          {showChat && (
            <>
              <ResizeHandle onMouseDown={chat.handleMouseDown} isDragging={chat.isDragging} />
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: chat.size, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={panelTransition}
                  style={{ flexShrink: 0, overflow: "hidden" }}
                >
                <div style={{ width: chat.size, height: "100%" }}>
                  <ChatPanel
                    messages={messages}
                    loading={chatLoading}
                    error={chatError}
                    onSend={send}
                    onSaveAsCommit={handleSaveCommit}
                    commitLoading={commitLoading}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Preview panel (resizable, toggleable) */}
        <AnimatePresence initial={false}>
          {showPreview && (
            <>
              <ResizeHandle onMouseDown={preview.handleMouseDown} isDragging={preview.isDragging} />
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: preview.size, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={panelTransition}
                  style={{ flexShrink: 0, overflow: "hidden" }}
                >
                <div style={{ width: preview.size, height: "100%" }}>
                  <PreviewPanel projectId={projectId} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick Open ── */}
      <QuickOpen open={quickOpen} query={quickQuery} files={tree}
        onQueryChange={setQuickQuery}
        onClose={() => { setQuickOpen(false); setQuickQuery(""); }}
        onSelect={(f) => { void openFile(f); setQuickOpen(false); setQuickQuery(""); }}
      />

      {/* ── AI Edit Modal ── */}
      <AnimatePresence>
        {showAiEdit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowAiEdit(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={modalTransition}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-xl overflow-hidden rounded-2xl border shadow-2xl"
              style={{ background: "#15151f", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
                <Wand2 className="h-4 w-4 text-violet-400" />
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Edit File</h3>
                  {activeTab && <p className="text-[11px] text-white/35">{activeTab.title}</p>}
                </div>
                <button onClick={() => setShowAiEdit(false)} className="ml-auto rounded-lg p-1.5 text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/60">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-5">
                <textarea autoFocus value={aiInstruction} onChange={(e) => setAiInstruction(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleAiEdit(); }}
                  placeholder="Describe the change to apply to this file…"
                  className="h-32 w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] p-3.5 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20"
                />
                <p className="mt-2 text-[10px] text-white/20">⌘Enter to apply</p>
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setShowAiEdit(false)} className="rounded-xl px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70">Cancel</button>
                  <button disabled={aiEditLoading || !aiInstruction.trim()} onClick={() => void handleAiEdit()}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-50">
                    {aiEditLoading ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/20 border-t-white" /> : <Wand2 className="h-3.5 w-3.5" />}
                    Apply Edit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Export Modal ── */}
      <AnimatePresence>
        {showExport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24"
            style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowExport(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl"
              style={{ background: "#15151f", borderColor: "rgba(255,255,255,0.1)" }}>
              <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
                <Download className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-semibold text-white">Export Project</h3>
                <button onClick={() => setShowExport(false)} className="ml-auto rounded-lg p-1.5 text-white/25 transition-colors hover:bg-white/[0.06] hover:text-white/60">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="p-5">
                <label className="mb-4 flex cursor-pointer items-center gap-2.5 text-sm text-white/65">
                  <input type="checkbox" checked={exportTemplate} onChange={(e) => setExportTemplate(e.target.checked)} className="accent-violet-500" />
                  Export as template (strips personal data)
                </label>
                <div className="max-h-48 overflow-auto rounded-xl border border-white/[0.07] bg-white/[0.02] p-2">
                  <p className="mb-2 px-1 text-[10px] text-white/25">Select files (empty = full project)</p>
                  {allFiles.map((file) => (
                    <label key={file.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-white/55 hover:bg-white/[0.04]">
                      <input type="checkbox" checked={exportPaths.includes(file.id)}
                        onChange={(e) => setExportPaths((p) => e.target.checked ? [...p, file.id] : p.filter((x) => x !== file.id))}
                        className="accent-violet-500" />
                      <span className="truncate font-mono">{file.id}</span>
                    </label>
                  ))}
                </div>
                {exportProgress !== null && (
                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div className="h-full rounded-full bg-violet-500" animate={{ width: `${exportProgress}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-white/30">{exportProgress}%</p>
                  </div>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={() => setShowExport(false)} className="rounded-xl px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70">Cancel</button>
                  <button onClick={() => void handleExport()}
                    className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500">
                    <Download className="h-3.5 w-3.5" />
                    Download ZIP
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session limit paywall */}
      <SessionLimitModal />
    </div>
  );
}
