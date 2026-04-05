"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Download, Search } from "lucide-react";
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
import type { FileNode } from "@/types";

const HEADER_HEIGHT = 48; // Must match header `h-12` Tailwind class.
const ChatPanel = dynamic(() => import("@/components/editor/chat-panel").then((m) => m.ChatPanel), { ssr: false });
const MemoizedFileTree = memo(FileTree);

export function EditorPage({ projectId }: { projectId: string }) {
  const { tree, expanded, activeFileId, tabs, loading, error, loadTree, toggleFolder, openFile, setActiveFile, closeTab } =
    useFilesStore();
  const { messages, loading: chatLoading, error: chatError, boot, send } = useChatStore();
  const [quickOpenVisible, setQuickOpenVisible] = useState(false);
  const [quickOpenQuery, setQuickOpenQuery] = useState("");

  const activeTab = useMemo(() => tabs.find((tab) => tab.fileId === activeFileId) ?? null, [tabs, activeFileId]);

  useEffect(() => {
    void loadTree(projectId);
    void boot(projectId);
  }, [loadTree, boot, projectId]);

  const handleExport = useCallback(async () => {
    const toastId = toast.loading("Preparing ZIP export...");
    try {
      const { filename, blob } = await exportProjectZip(projectId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Project exported", { id: toastId });
    } catch {
      toast.error("Failed to export project", { id: toastId });
    }
  }, [projectId]);

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
        void handleExport();
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => window.removeEventListener("keydown", onKeydown);
  }, [handleExport]);

  const handleQuickOpenSelect = useCallback(async (file: FileNode) => {
    await openFile(file);
    setQuickOpenVisible(false);
    setQuickOpenQuery("");
  }, [openFile]);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex h-12 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 text-sm backdrop-blur-xl">
        <span className="font-medium">Project #{projectId}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuickOpenVisible(true)}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 transition hover:bg-white/10"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
          <button
            type="button"
            onClick={() => void handleExport()}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 transition hover:bg-white/10"
          >
            <Download className="h-3.5 w-3.5" />
            Export ZIP
          </button>
          <span className="text-xs text-slate-400">Realtime IDE • Preview • AI Chat</span>
        </div>
      </header>

      <div className="grid grid-cols-[48px_260px_1fr] xl:grid-cols-[48px_280px_1fr_340px_360px]" style={{ height: `calc(100vh - ${HEADER_HEIGHT}px)` }}>
        <ActivityBar />

        <aside className="overflow-auto border-r border-white/10 bg-slate-950/70 p-2">
          <p className="px-2 py-1 text-xs font-medium tracking-wide text-slate-400">Explorer</p>
          {loading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-6 animate-pulse rounded bg-white/10" />
              ))}
            </div>
          ) : null}
          {!loading && error ? <div className="rounded-md border border-rose-400/30 bg-rose-500/10 p-2 text-xs text-rose-200">{error}</div> : null}
          {!loading && !error && tree.length > 0 ? (
            <MemoizedFileTree
              nodes={tree}
              expanded={expanded}
              activeFileId={activeFileId}
              onToggle={toggleFolder}
              onOpen={(node) => void openFile(node)}
            />
          ) : null}
        </aside>

        <main className="min-w-0 bg-slate-900/40">
          <EditorTabs tabs={tabs} activeFileId={activeFileId} onActivate={setActiveFile} onClose={closeTab} />
          <div className="h-[calc(100%-44px)]">
            <CodeEditor
              key={activeTab?.fileId ?? "empty"}
              defaultValue={activeTab?.content ?? "// Open a file to start coding"}
              language={activeTab?.language ?? "typescript"}
            />
          </div>
        </main>

        <div className="hidden xl:block">
          <ChatPanel messages={messages} loading={chatLoading} error={chatError} onSend={send} />
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
    </div>
  );
}
