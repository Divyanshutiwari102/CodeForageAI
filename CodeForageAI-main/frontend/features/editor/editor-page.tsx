"use client";

import { useEffect, useMemo } from "react";
import { ActivityBar } from "@/components/editor/activity-bar";
import { FileTree } from "@/components/editor/file-tree";
import { EditorTabs } from "@/components/editor/editor-tabs";
import { CodeEditor } from "@/components/editor/code-editor";
import { ChatPanel } from "@/components/editor/chat-panel";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { useFilesStore } from "@/store/useFilesStore";
import { useChatStore } from "@/store/useChatStore";
import { usePreviewStore } from "@/store/usePreviewStore";

export function EditorPage({ projectId }: { projectId: string }) {
  const { tree, expanded, activeFileId, tabs, loading, error, loadTree, toggleFolder, openFile, setActiveFile, closeTab } = useFilesStore();
  const { messages, loading: chatLoading, error: chatError, boot, send } = useChatStore();
  const { previewUrl, loading: previewLoading, error: previewError, message: previewMessage, load, refresh } = usePreviewStore();

  const activeTab = useMemo(() => tabs.find((tab) => tab.fileId === activeFileId) ?? null, [tabs, activeFileId]);

  useEffect(() => {
    void loadTree(projectId);
    void boot(projectId);
    void load(projectId);
  }, [loadTree, boot, load, projectId]);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex h-12 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 text-sm backdrop-blur-xl">
        <span className="font-medium">Project #{projectId}</span>
        <span className="text-xs text-slate-400">Realtime IDE • Preview • AI Chat</span>
      </header>

      <div className="grid h-[calc(100vh-48px)] grid-cols-[48px_240px_1fr] lg:grid-cols-[48px_260px_1fr_320px_320px]">
        <ActivityBar />

        <aside className="border-r border-white/10 bg-slate-950/70 p-2">
          <p className="px-2 py-1 text-xs font-medium text-slate-400">Explorer</p>
          {loading ? <div className="space-y-2 p-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-6 animate-pulse rounded bg-white/10" />)}</div> : null}
          {!loading && error ? <div className="rounded-md border border-rose-400/30 bg-rose-500/10 p-2 text-xs text-rose-200">{error}</div> : null}
          {!loading && !error && tree.length === 0 ? (
            <div className="rounded-md border border-white/10 bg-white/5 p-2 text-xs text-slate-400">No files found.</div>
          ) : null}
          {!loading && !error && tree.length > 0 ? (
            <FileTree nodes={tree} expanded={expanded} activeFileId={activeFileId} onToggle={toggleFolder} onOpen={(node) => void openFile(node)} />
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

        <div className="hidden lg:block"><ChatPanel messages={messages} loading={chatLoading} error={chatError} onSend={send} /></div>
        <div className="hidden lg:block">
          <PreviewPanel
            previewUrl={previewUrl}
            loading={previewLoading}
            error={previewError}
            message={previewMessage}
            onRefresh={async () => refresh(projectId)}
          />
        </div>
      </div>
    </div>
  );
}
