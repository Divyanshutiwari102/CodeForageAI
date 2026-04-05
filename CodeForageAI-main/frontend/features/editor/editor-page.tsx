"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { shallow } from "zustand/shallow";
import { ActivityBar } from "@/components/editor/activity-bar";
import { FileTree } from "@/components/editor/file-tree";
import { EditorTabs } from "@/components/editor/editor-tabs";
import { CodeEditor } from "@/components/editor/code-editor";
import { PreviewPanel } from "@/components/editor/preview-panel";
import { useFilesStore } from "@/store/useFilesStore";
import { useChatStore } from "@/store/useChatStore";
import { selectMessages, selectTabs } from "@/store/selectors";

const HEADER_HEIGHT = 48; // Must match header `h-12` Tailwind class.
const ChatPanel = dynamic(() => import("@/components/editor/chat-panel").then((m) => m.ChatPanel), { ssr: false });

export function EditorPage({ projectId }: { projectId: string }) {
  const { tree, expanded, activeFileId, openTabIds, tabsByFileId, loading, error, loadTree, toggleFolder, openFile, setActiveFile, closeTab } =
    useFilesStore(
      (state) => ({
        tree: state.tree,
        expanded: state.expanded,
        activeFileId: state.activeFileId,
        openTabIds: state.openTabIds,
        tabsByFileId: state.tabsByFileId,
        loading: state.loading,
        error: state.error,
        loadTree: state.loadTree,
        toggleFolder: state.toggleFolder,
        openFile: state.openFile,
        setActiveFile: state.setActiveFile,
        closeTab: state.closeTab,
      }),
      shallow,
    );
  const { messageIds, messagesById, loading: chatLoading, error: chatError, boot, send } = useChatStore(
    (state) => ({
      messageIds: state.messageIds,
      messagesById: state.messagesById,
      loading: state.loading,
      error: state.error,
      boot: state.boot,
      send: state.send,
    }),
    shallow,
  );

  const tabs = useMemo(() => selectTabs(openTabIds, tabsByFileId), [openTabIds, tabsByFileId]);
  const messages = useMemo(() => selectMessages(messageIds, messagesById), [messageIds, messagesById]);
  const activeTab = useMemo(() => (activeFileId ? tabsByFileId[activeFileId] ?? null : null), [tabsByFileId, activeFileId]);

  useEffect(() => {
    void loadTree(projectId);
    void boot(projectId);
  }, [loadTree, boot, projectId]);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-100">
      <header className="flex h-12 items-center justify-between border-b border-white/10 bg-slate-950/90 px-4 text-sm backdrop-blur-xl">
        <span className="font-medium">Project #{projectId}</span>
        <span className="text-xs text-slate-400">Realtime IDE • Preview • AI Chat</span>
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
            <FileTree
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
    </div>
  );
}
