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
import type { FileNode } from "@/types";

function findFile(tree: FileNode[], fileId: string | null): FileNode | null {
  if (!fileId) return null;
  for (const node of tree) {
    if (node.id === fileId && node.type === "file") return node;
    if (node.children?.length) {
      const found = findFile(node.children, fileId);
      if (found) return found;
    }
  }
  return null;
}

export function EditorPage({ projectId }: { projectId: string }) {
  const { tree, expanded, activeFileId, tabs, loadTree, toggleFolder, openFile, setActiveFile, closeTab } = useFilesStore();
  const { messages, loading, boot, send } = useChatStore();

  const activeFile = useMemo(() => findFile(tree, activeFileId), [tree, activeFileId]);

  useEffect(() => {
    loadTree();
    boot();
  }, [loadTree, boot]);

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
          <FileTree nodes={tree} expanded={expanded} activeFileId={activeFileId} onToggle={toggleFolder} onOpen={openFile} />
        </aside>

        <main className="min-w-0 bg-slate-900/40">
          <EditorTabs tabs={tabs} activeFileId={activeFileId} onActivate={setActiveFile} onClose={closeTab} />
          <div className="h-[calc(100%-44px)]">
            <CodeEditor
              key={activeFile?.id ?? "empty"}
              defaultValue={activeFile?.content ?? "// Open a file to start coding"}
              language={activeFile?.language ?? "typescript"}
            />
          </div>
        </main>

        <div className="hidden lg:block"><ChatPanel messages={messages} loading={loading} onSend={send} /></div>
        <div className="hidden lg:block"><PreviewPanel /></div>
      </div>
    </div>
  );
}
