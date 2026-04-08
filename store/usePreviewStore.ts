"use client";

import { create } from "zustand";
import { getLatestPreview, startPreview, type PreviewStatus } from "@/services/previews";
import { getErrorMessage } from "@/services/errors";

const PREVIEW_POLL_INTERVAL_MS = 10000;

const PREVIEW_LOADING_STATUSES = new Set<PreviewStatus>(["creating", "running"]);
const PREVIEW_POLL_MAX_ATTEMPTS = 12;
let activePollRun = 0;

interface PreviewStore {
  previewUrl: string | null;
  status: PreviewStatus | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  load: (projectId: string) => Promise<void>;
  refresh: (projectId: string) => Promise<void>;
  subscribeLive: (projectId: string) => () => void;
  poll: (projectId: string) => Promise<void>;
}

function shouldPoll(status: PreviewStatus | null, previewUrl: string | null): boolean {
  if (previewUrl) return false;
  if (!status) return true;
  return PREVIEW_LOADING_STATUSES.has(status);
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
    set({ loading: true, error: null });
    const runId = ++activePollRun;
    let attempts = 0;
    while (attempts < PREVIEW_POLL_MAX_ATTEMPTS) {
      if (runId !== activePollRun) return;
      try {
        const latest = await getLatestPreview(projectId);
        if (runId !== activePollRun) return;
        set({
          previewUrl: latest.previewUrl,
          status: latest.status,
          message: latest.message,
          loading: false,
          error: null,
        });
        if (!shouldPoll(latest.status, latest.previewUrl)) return;
      } catch (error) {
        if (runId !== activePollRun) return;
        set({ loading: false, error: getErrorMessage(error, "Failed to refresh preview status") });
        return;
      }
      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, PREVIEW_POLL_INTERVAL_MS));
      if (runId !== activePollRun) return;
    }
    if (runId !== activePollRun) return;
    set({ loading: false, error: "Preview startup timed out after maximum polling attempts" });
  },
  subscribeLive: (projectId) => {
    const pollingTimer = setInterval(() => void get().refresh(projectId), PREVIEW_POLL_INTERVAL_MS);

    return () => {
      activePollRun += 1;
      clearInterval(pollingTimer);
    };
  },
}));
