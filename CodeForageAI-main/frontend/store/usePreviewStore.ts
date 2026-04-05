"use client";

import { create } from "zustand";
import { getLatestPreview, startPreview } from "@/services/previews";
import { getErrorMessage } from "@/services/errors";

const PREVIEW_LOADING_STATUSES = new Set(["queued", "starting", "building", "running"]);
const PREVIEW_POLL_INTERVAL_MILLISECONDS = 5000;

interface PreviewStore {
  previewUrl: string | null;
  status: string | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  load: (projectId: string) => Promise<void>;
  refresh: (projectId: string) => Promise<void>;
  poll: (projectId: string) => Promise<void>;
}

function shouldPoll(status: string | null, previewUrl: string | null): boolean {
  if (previewUrl) return false;
  if (!status) return true;
  return PREVIEW_LOADING_STATUSES.has(status.toLowerCase());
}

async function resolveLatestPreview(projectId: string) {
  const latest = await getLatestPreview(projectId);
  if (latest.previewUrl) return latest;
  return startPreview(projectId);
}

export const usePreviewStore = create<PreviewStore>((set, get) => ({
  previewUrl: null,
  status: null,
  message: null,
  loading: false,
  error: null,
  load: async (projectId) => {
    set({ loading: true, error: null, message: "Loading preview..." });
    try {
      const preview = await resolveLatestPreview(projectId);
      set({
        previewUrl: preview.previewUrl,
        status: preview.status,
        message: preview.message,
        loading: false,
      });
      if (shouldPoll(preview.status, preview.previewUrl)) {
        await get().poll(projectId);
      }
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to load preview") });
    }
  },
  refresh: async (projectId) => {
    set({ loading: true, error: null, message: "Refreshing preview..." });
    try {
      const preview = await resolveLatestPreview(projectId);
      set({
        previewUrl: preview.previewUrl,
        status: preview.status,
        message: preview.message,
        loading: false,
      });
      if (shouldPoll(preview.status, preview.previewUrl)) {
        await get().poll(projectId);
      }
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to refresh preview") });
    }
  },
  poll: async (projectId) => {
    let attempts = 0;
    while (attempts < 12) {
      await new Promise((resolve) => setTimeout(resolve, PREVIEW_POLL_INTERVAL_MILLISECONDS));
      attempts += 1;
      try {
        const latest = await getLatestPreview(projectId);
        set({
          previewUrl: latest.previewUrl,
          status: latest.status,
          message: latest.message,
          loading: false,
          error: null,
        });
        if (!shouldPoll(latest.status, latest.previewUrl)) return;
      } catch (error) {
        set({ loading: false, error: getErrorMessage(error, "Failed to refresh preview status") });
        return;
      }
    }
  },
}));
