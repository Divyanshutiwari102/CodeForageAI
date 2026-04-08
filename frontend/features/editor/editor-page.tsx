"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Search, Share2, Wand2 } from "lucide-react";
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

const HEADER_HEIGHT = 48;
const ChatPanel = dynamic(() => import("@/components/editor/chat-panel").then((module) => module.ChatPanel), {
  ssr: false,
});

export function EditorPage({ projectId }: { projectId: string }) {
  const tree = useFilesStore((state) => state.tree);
  const expanded = useFilesStore((state) => state.expanded);
  const activeFileId = useFilesStore((state) => state.activeFileId);
  const openTabIds = useFilesStore((state) => state.openTabIds);
  const tabsByFileId = useFilesStore((state) => state.tabsByFileId);
  const loading = useFilesStore((state) => state.loading);
  const error = useFilesStore((state) => state.error);
  const loadTree = useFilesStore((state) => state.loadTree);
  const toggleFolder = useFilesStore((state) => state.toggleFolder);
  const openFile = useFilesStore((state) => state.openFile);
  const setActiveFile = useFilesStore((state) => state.setActiveFile);
  const closeTab = useFilesStore((state) => state.closeTab);
  const updateTabContent = useFilesStore((state) => state.updateTabContent);

  const sessionId = useChatStore((state) => state.sessionId);
  const messageIds = useChatStore((state) => state.messageIds);
  const messagesById = useChatStore((state) => state.messagesById);
  const chatLoading = useChatStore((state) => state.loading);
  const chatError = useChatStore((state) => state.error);
  const boot = useChatStore((state) => state.boot);
  const send = useChatStore((state) => state.send);

  const [quickOpenVisible, setQuickOpenVisible] = useState(false);
  const [quickOpenQuery, setQuickOpenQuery] = useState("");
  const [exportTemplate, setExportTemplate] = useState(false);
  const [selectedExportPaths, setSelectedExportPaths] = useState<string[]>([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [commitLoading, setCommitLoading] = useState(false);
  const [aiEditLoading, setAiEditLoading] = useState(false);
  const [showAiEditDialog, setShowAiEditDialog] = useState(false);
  const [aiEditInstruction, setAiEditInstruction] = useState("");

  const tabs = useMemo(() => selectTabs(openTabIds, tabsByFileId), [openTabIds, tabsByFileId]);
  const messages = useMemo(() => selectMessages(messageIds, messagesById), [messageIds, messagesById]);
  const activeTab = useMemo(() => (activeFileId ? tabsByFileId[activeFileId] ?? null : null), [tabsByFileId, activeFileId]);

  const allFiles = useMemo(() => {
    const stack = [...tree];
    const files: FileNode[] = [];

    while (stack.length > 0) {
      const node = stack.pop();
      if (!node) continue;

      if (node.type === "file") {
        files.push(node);
      } else if (node.children?.length) {
        stack.push(...node.children);
      }
    }

    return files.sort((a, b) => a.id.localeCompare(b.id));
  }, [tree]);

  useEffect(() => {
    void loadTree(projectId);
    void boot(projectId);
  }, [boot, loadTree, projectId]);

  const handleExport = useCallback(async () => {
    const toastId = toast.loading("Preparing ZIP export...");
    setExportProgress(0);

    try {
      const { filename, blob } = await exportProjectZip(projectId, {
        asTemplate: exportTemplate,
        paths: selectedExportPaths.length > 0 ? selectedExportPaths : undefined,
        onProgress: (progress) => setExportProgress(progress),
      });

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast.success("Project exported", { id: toastId });
      setShowExportOptions(false);
      setExportProgress(null);
    } catch {
      toast.error("Failed to export project", { id: toastId });
      setExportProgress(null);
    }
  }, [exportTemplate, projectId, selectedExportPaths]);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const ctrlOrMeta = event.ctrlKey || event.metaKey;

      if (ctrlOrMeta && event.key.toLowerCase() === "p") {
        event.preventDefault();
        setQuickOpenVisible(true);
        return;
      }

      if (ctrlOrMeta && event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        setShowExportOptions(true);
        return;
      }

      if (event.key === "Escape") {
        setShowAiEditDialog(false);
        setShowExportOptions(false);
      }
    };

    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, []);

  const handleQuickOpenSelect = useCallback(
    async (file: FileNode) => {
      await openFile(file);
      setQuickOpenVisible(false);
      setQuickOpenQuery("");
    },
    [openFile],
  );

  const handleShareProject = useCallback(async () => {
    setShareLoading(true);
    try {
      const token = await shareProject(projectId);
      const url = `${window.location.origin}/project/share/${token}`;
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied");
    } catch {
      toast.error("Failed to generate share link");
    } finally {
      setShareLoading(false);
    }
  }, [projectId]);

  const handleSaveChatAsCommit = useCallback(async () => {
    if (!sessionId) {
      toast.error("Chat session not ready yet");
      return;
    }

    setCommitLoading(true);
    try {
      const result = await saveChatAsCommit(sessionId);
      await loadTree(projectId);
      toast.success(`${result.message} (${result.filesCommitted} files)`);
    } catch {
      toast.error("Failed to save chat as commit");
    } finally {
      setCommitLoading(false);
    }
  }, [loadTree, projectId, sessionId]);

  const handleAiEditCurrentFile = useCallback(async () => {
    if (!activeTab) {
      toast.error("Open a file first");
      return;
    }

    const instruction = aiEditInstruction.trim();
    if (!instruction) return;

    setAiEditLoading(true);
    try {
      const response = await aiEditFile(projectId, activeTab.fileId, instruction);
      updateTabContent(activeTab.fileId, response.content);
      toast.success(`AI updated ${response.path}`);
      await loadTree(projectId);
      setShowAiEditDialog(false);
      setAiEditInstruction("");
    } catch {
      toast.error("AI edit failed");
    } finally {
      setAiEditLoading(false);
    }
  }, [activeTab, aiEditInstruction, loadTree, projectId, updateTabContent]);

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <header className="flex h-12 items-center justify-between border-b border-white/[0.06] bg-zinc-950/90 px-4 text-sm backdrop-blur-xl">
        <span className="font-medium text-zinc-100">Project #{projectId}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickOpenVisible(true)}
            className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-zinc-200 transition hover:bg-white/[0.08]"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              if (!activeTab) {
                toast.error("Open a file first");
                return;
              }
              setShowAiEditDialog(true);
            }}
            disabled={aiEditLoading}
            className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-60"
          >
            <Wand2 className="h-3.5 w-3.5" />
            AI Edit File
          </button>
          <button
            type="button"
            onClick={() => void handleShareProject()}
            disabled={shareLoading}
            className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-zinc-200 transition hover:bg-white/[0.08] disabled:opacity-60"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
          <button
            type="button"
            onClick={() => setShowExportOptions((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-zinc-200 transition hover:bg-white/[0.08]"
          >
            <Download className="h-3.5 w-3.5" />
            Export ZIP
          </button>
          <span className="text-xs text-zinc-500">Realtime IDE • Preview • AI Chat</span>
        </div>
      </header>

      <div
        className="grid grid-cols-[48px_260px_1fr] xl:grid-cols-[48px_280px_1fr_340px_360px]"
        style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}
      >
        <ActivityBar />

        <aside className="overflow-auto border-r border-white/[0.06] bg-zinc-950/70 p-2">
          <p className="px-2 py-1 text-xs font-medium tracking-wide text-zinc-500">Explorer</p>
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-6 animate-pulse rounded bg-white/[0.08]" />
              ))}
            </div>
          ) : null}

          {!loading && error ? (
            <div className="rounded-md border border-rose-400/30 bg-rose-500/10 p-2 text-xs text-rose-200">{error}</div>
          ) : null}

          {!loading && !error && tree.length > 0 ? (
            <FileTree
              nodes={tree}
              expanded={expanded}
              activeFileId={activeFileId}
              onToggle={toggleFolder}
              onOpen={openFile}
            />
          ) : null}
        </aside>

        <main className="min-w-0 bg-zinc-900/30">
          <EditorTabs tabs={tabs} activeFileId={activeFileId} onActivate={setActiveFile} onClose={closeTab} />
          <div className="h-[calc(100%-44px)]">
            <CodeEditor
              key={activeTab?.fileId ?? "empty"}
              value={activeTab?.content ?? "// Open a file to start coding"}
              language={activeTab?.language ?? "typescript"}
              onChange={(value) => {
                if (!activeTab?.fileId) return;
                updateTabContent(activeTab.fileId, value);
              }}
            />
          </div>
        </main>

        <div className="hidden xl:block">
          <ChatPanel
            messages={messages}
            loading={chatLoading}
            error={chatError}
            onSend={send}
            onSaveAsCommit={handleSaveChatAsCommit}
            commitLoading={commitLoading}
          />
        </div>

        <div className="hidden xl:block">
          <PreviewPanel projectId={projectId} />
        </div>
      </div>

      <QuickOpen
        open={quickOpenVisible}
        query={quickOpenQuery}
        files={tree}
        onQueryChange={setQuickOpenQuery}
        onClose={() => {
          setQuickOpenVisible(false);
          setQuickOpenQuery("");
        }}
        onSelect={(file) => void handleQuickOpenSelect(file)}
      />

      {showAiEditDialog ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowAiEditDialog(false)}>
          <div
            className="mx-auto mt-20 w-full max-w-xl rounded-xl border border-white/[0.08] bg-zinc-900/95 p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-100">AI Edit File</h3>
              <button
                type="button"
                onClick={() => setShowAiEditDialog(false)}
                className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>
            <textarea
              value={aiEditInstruction}
              onChange={(event) => setAiEditInstruction(event.target.value)}
              placeholder="Describe the change to apply to the current file..."
              className="h-28 w-full rounded-md border border-white/[0.08] bg-white/[0.04] p-2 text-xs text-zinc-100 outline-none focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                disabled={aiEditLoading || !aiEditInstruction.trim()}
                onClick={() => void handleAiEditCurrentFile()}
                className="inline-flex items-center gap-1 rounded-md border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-100 transition hover:bg-sky-400/20 disabled:opacity-60"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Apply AI Edit
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showExportOptions ? (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowExportOptions(false)}>
          <div
            className="mx-auto mt-20 w-full max-w-2xl rounded-xl border border-white/[0.08] bg-zinc-900/95 p-3 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-100">Export project</h3>
              <button
                type="button"
                onClick={() => setShowExportOptions(false)}
                className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-xs text-zinc-300 transition hover:bg-white/[0.08]"
              >
                Close
              </button>
            </div>

            <label className="mb-3 flex items-center gap-2 text-xs text-zinc-300">
              <input type="checkbox" checked={exportTemplate} onChange={(event) => setExportTemplate(event.target.checked)} />
              Export as template
            </label>

            <div className="max-h-64 space-y-1 overflow-auto rounded-md border border-white/[0.08] bg-white/[0.04] p-2">
              {allFiles.map((file) => {
                const checked = selectedExportPaths.includes(file.id);
                return (
                  <label key={file.id} className="flex items-center gap-2 rounded px-1 py-1 text-xs text-zinc-200 hover:bg-white/[0.08]">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        setSelectedExportPaths((prev) =>
                          event.target.checked ? [...prev, file.id] : prev.filter((path) => path !== file.id),
                        )
                      }
                    />
                    <span className="truncate">{file.id}</span>
                  </label>
                );
              })}
            </div>

            <p className="mt-2 text-[11px] text-zinc-500">Leave all unchecked to export full project.</p>

            {exportProgress !== null ? (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded bg-white/[0.08]">
                  <div className="h-full bg-sky-400 transition-all" style={{ width: `${exportProgress}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">Download progress: {exportProgress}%</p>
              </div>
            ) : null}

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => void handleExport()}
                className="inline-flex items-center gap-1 rounded-md border border-sky-400/40 bg-sky-400/10 px-3 py-1.5 text-xs font-medium text-sky-100 transition hover:bg-sky-400/20"
              >
                <Download className="h-3.5 w-3.5" />
                Export ZIP
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
