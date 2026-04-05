"use client";

import { create } from "zustand";
import { getLatestPreview, startPreview } from "@/services/previews";

interface PreviewStore {
  previewUrl: string | null;
  status: string | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  load: (projectId: string) => Promise<void>;
  refresh: (projectId: string) => Promise<void>;
}

export const usePreviewStore = create<PreviewStore>((set) => ({
  previewUrl: null,
  status: null,
  message: null,
  loading: false,
  error: null,
  load: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const preview = await getLatestPreview(projectId);
      if (preview.previewUrl) {
        set({ previewUrl: preview.previewUrl, status: preview.status, message: preview.message, loading: false });
        return;
      }
      const started = await startPreview(projectId);
      set({ previewUrl: started.previewUrl, status: started.status, message: started.message, loading: false });
    } catch {
      set({ loading: false, error: "Failed to load preview" });
    }
  },
  refresh: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const latest = await getLatestPreview(projectId);
      if (latest.previewUrl) {
        set({ previewUrl: latest.previewUrl, status: latest.status, message: latest.message, loading: false });
        return;
      }
      const started = await startPreview(projectId);
      set({ previewUrl: started.previewUrl, status: started.status, message: started.message, loading: false });
    } catch {
      set({ loading: false, error: "Failed to refresh preview" });
    }
  },
}));
