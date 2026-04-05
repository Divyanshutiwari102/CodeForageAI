"use client";

import { create } from "zustand";
import type { EditorTab, FileNode } from "@/types";
import { DEFAULT_EDITOR_LANGUAGE, getFileContent, getProjectTree } from "@/services/files";
import { getErrorMessage } from "@/services/errors";

interface FilesState {
  projectId: string | null;
  tree: FileNode[];
  expanded: Record<string, boolean>;
  activeFileId: string | null;
  openTabIds: string[];
  tabsByFileId: Record<string, EditorTab>;
  loading: boolean;
  error: string | null;
  loadTree: (projectId: string) => Promise<void>;
  toggleFolder: (id: string) => void;
  openFile: (node: FileNode) => Promise<void>;
  setActiveFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  updateTabContent: (fileId: string, content: string) => void;
}

export const useFilesStore = create<FilesState>((set, get) => ({
  projectId: null,
  tree: [],
  expanded: {},
  activeFileId: null,
  openTabIds: [],
  tabsByFileId: {},
  loading: false,
  error: null,
  loadTree: async (projectId) => {
    set({ loading: true, error: null, projectId });
    try {
      const tree = await getProjectTree(projectId);
      if (get().projectId !== projectId) return;
      set({ tree, loading: false, openTabIds: [], tabsByFileId: {}, activeFileId: null });
    } catch (error) {
      if (get().projectId !== projectId) return;
      set({ loading: false, error: getErrorMessage(error, "Failed to load project files") });
    }
  },
  toggleFolder: (id) => set((state) => ({ expanded: { ...state.expanded, [id]: !state.expanded[id] } })),
  openFile: async (node) => {
    if (node.type !== "file") return;
    const { openTabIds, tabsByFileId, projectId } = get();
    if (!projectId) return;
    if (tabsByFileId[node.id]) {
      set({ activeFileId: node.id });
      return;
    }

    set({ loading: true, error: null });
    try {
      const content = await getFileContent(projectId, node.id);
      const tab: EditorTab = {
        id: `tab-${node.id}`,
        fileId: node.id,
        title: node.name,
        language: node.language ?? DEFAULT_EDITOR_LANGUAGE,
        content,
      };
      set({
        openTabIds: [...openTabIds, node.id],
        tabsByFileId: { ...tabsByFileId, [node.id]: tab },
        activeFileId: node.id,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to load file content") });
    }
  },
  setActiveFile: (fileId) => set({ activeFileId: fileId }),
  closeTab: (fileId) => {
    const { openTabIds, tabsByFileId, activeFileId } = get();
    const nextOpenTabIds = openTabIds.filter((id) => id !== fileId);
    const nextTabsByFileId = { ...tabsByFileId };
    delete nextTabsByFileId[fileId];
    set({
      openTabIds: nextOpenTabIds,
      tabsByFileId: nextTabsByFileId,
      activeFileId: activeFileId === fileId ? (nextOpenTabIds.at(-1) ?? null) : activeFileId,
    });
  },
  updateTabContent: (fileId, content) =>
    set((state) => ({
      tabsByFileId: state.tabsByFileId[fileId]
        ? {
            ...state.tabsByFileId,
            [fileId]: { ...state.tabsByFileId[fileId], content, isDirty: true },
          }
        : state.tabsByFileId,
    })),
}));
