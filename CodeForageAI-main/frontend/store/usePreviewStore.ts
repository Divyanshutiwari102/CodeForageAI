"use client";

import { create } from "zustand";
import { createPreviewLiveSocket, getLatestPreview, startPreview } from "@/services/previews";

interface PreviewStore {
  previewUrl: string | null;
  status: string | null;
  message: string | null;
  loading: boolean;
  error: string | null;
  load: (projectId: string) => Promise<void>;
  refresh: (projectId: string) => Promise<void>;
  subscribeLive: (projectId: string) => () => void;
}

export const usePreviewStore = create<PreviewStore>((set, get) => ({
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
  subscribeLive: (projectId) => {
    const startPolling = () => setInterval(() => void get().refresh(projectId), 10000);
    let pollingTimer: ReturnType<typeof setInterval> | null = startPolling();
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let openTimeout: ReturnType<typeof setTimeout> | null = null;
    let socket: WebSocket | null = null;
    let reconnectAttempts = 0;
    let stopped = false;

    const scheduleReconnect = () => {
      if (stopped || reconnectTimer) return;
      const delay = Math.min(2000 * Math.max(1, reconnectAttempts + 1), 15000);
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
      }, 3000);

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
      if (socket) socket.close();
      clearOpenTimeout();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pollingTimer) clearInterval(pollingTimer);
    };
  },
}));
