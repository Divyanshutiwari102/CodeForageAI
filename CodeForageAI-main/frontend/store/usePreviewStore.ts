"use client";

import { create } from "zustand";
import { createPreviewLiveSocket, getLatestPreview, startPreview, type PreviewStatus } from "@/services/previews";
import { getErrorMessage } from "@/services/errors";

const PREVIEW_POLL_INTERVAL_MS = 10000;
const SOCKET_OPEN_GRACE_MS = 3000;
const RECONNECT_BASE_DELAY_MS = 2000;
const RECONNECT_MAX_DELAY_MS = 15000;

const PREVIEW_LOADING_STATUSES = new Set<PreviewStatus>(["queued", "starting", "building", "running"]);
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
    const startPolling = () => setInterval(() => void get().refresh(projectId), PREVIEW_POLL_INTERVAL_MS);
    let pollingTimer: ReturnType<typeof setInterval> | null = startPolling();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let openTimeout: ReturnType<typeof setTimeout> | null = null;
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;
    let stopped = false;

    const scheduleReconnect = () => {
      if (stopped || reconnectTimer) return;
      const delay = Math.min(RECONNECT_BASE_DELAY_MS * Math.pow(2, reconnectAttempts), RECONNECT_MAX_DELAY_MS);
      reconnectAttempts += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connectWebSocket();
      }, delay);
    };

    const clearOpenTimeout = () => {
      if (openTimeout) {
        clearTimeout(openTimeout);
        openTimeout = null;
      }
    };

    const ensurePolling = () => {
      if (!pollingTimer) pollingTimer = startPolling();
    };

    const stopPolling = () => {
      if (pollingTimer) {
        clearInterval(pollingTimer);
        pollingTimer = null;
      }
    };

    const connectWebSocket = () => {
      if (stopped) return;
      const nextSocket = createPreviewLiveSocket(projectId);
      if (!nextSocket) {
        ensurePolling();
        scheduleReconnect();
        return;
      }

      socket = nextSocket;
      openTimeout = setTimeout(() => {
        ensurePolling();
      }, SOCKET_OPEN_GRACE_MS);

      nextSocket.onopen = () => {
        reconnectAttempts = 0;
        clearOpenTimeout();
        stopPolling();
      };
      nextSocket.onmessage = () => {
        void get().refresh(projectId);
      };
      nextSocket.onerror = () => {
        ensurePolling();
      };
      nextSocket.onclose = () => {
        ensurePolling();
        clearOpenTimeout();
        scheduleReconnect();
      };
    };

    connectWebSocket();

    return () => {
      stopped = true;
      activePollRun += 1;
      if (socket) socket.close();
      clearOpenTimeout();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pollingTimer) clearInterval(pollingTimer);
    };
  },
}));
