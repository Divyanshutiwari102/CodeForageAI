"use client";

import { create } from "zustand";
import type { EditorTab, FileNode } from "@/types";
import { getFileContent, getProjectTree } from "@/services/files";

interface FilesState {
  projectId: string | null;
  tree: FileNode[];
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  tabs: EditorTab[];
  loading: boolean;
  error: string | null;
  loadTree: (projectId: string) => Promise<void>;
  toggleFolder: (id: string) => void;
  openFile: (node: FileNode) => Promise<void>;
  setActiveFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  projectId: null,
  tree: [],
  expanded: {},
  activeFileId: null,
  tabs: [],
  loading: false,
  error: null,
  loadTree: async (projectId) => {
    set({ loading: true, error: null, projectId, tabs: [], activeFileId: null });
    try {
      const tree = await getProjectTree(projectId);
      set({ tree, loading: false });
    } catch {
      set({ loading: false, error: "Failed to load project files" });
    }
  },
  toggleFolder: (id) => set((state) => ({ expanded: { ...state.expanded, [id]: !state.expanded[id] } })),
  openFile: async (node) => {
    if (node.type !== "file") return;
    const { tabs, projectId } = get();
    if (!projectId) return;
    const exists = tabs.find((t) => t.fileId === node.id);
    if (exists) {
      set({ activeFileId: node.id });
      return;
    }

    set({ loading: true, error: null });
    try {
      const content = await getFileContent(projectId, node.id);
      set({
        tabs: [
          ...tabs,
          {
            id: `tab-${node.id}`,
            fileId: node.id,
            title: node.name,
            language: node.language ?? "plaintext",
            content,
          } as EditorTab & { content: string },
        ],
        activeFileId: node.id,
        loading: false,
      });
    } catch {
      set({ loading: false, error: "Failed to load file content" });
    }
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
