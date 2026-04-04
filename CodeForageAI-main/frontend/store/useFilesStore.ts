"use client";

import { create } from "zustand";
import type { EditorTab, FileNode } from "@/types";
import { getProjectTree } from "@/services/files";

interface FilesState {
  tree: FileNode[];
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  tabs: EditorTab[];
  loading: boolean;
  loadTree: () => Promise<void>;
  toggleFolder: (id: string) => void;
  openFile: (node: FileNode) => void;
  setActiveFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  tree: [],
  expanded: { src: true, "src-app": true },
  activeFileId: null,
  tabs: [],
  loading: false,
  loadTree: async () => {
    set({ loading: true });
    const tree = await getProjectTree();
    set({ tree, loading: false });
  },
  toggleFolder: (id) => set((state) => ({ expanded: { ...state.expanded, [id]: !state.expanded[id] } })),
  openFile: (node) => {
    if (node.type !== "file") return;
    const { tabs } = get();
    const exists = tabs.find((t) => t.fileId === node.id);
    if (exists) {
      set({ activeFileId: node.id });
      return;
    }
    set({
      tabs: [...tabs, { id: `tab-${node.id}`, fileId: node.id, title: node.name, language: node.language ?? "typescript" }],
      activeFileId: node.id,
    });
  },
  setActiveFile: (fileId) => set({ activeFileId: fileId }),
  closeTab: (fileId) => {
    const { tabs, activeFileId } = get();
    const nextTabs = tabs.filter((t) => t.fileId !== fileId);
    set({
      tabs: nextTabs,
      activeFileId: activeFileId === fileId ? (nextTabs.at(-1)?.fileId ?? null) : activeFileId,
    });
  },
}));
