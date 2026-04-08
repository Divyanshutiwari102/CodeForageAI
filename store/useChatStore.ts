"use client";

import { create } from "zustand";
import type { ChatMessage } from "@/types";
import { getChatHistory, getOrCreateChatSession, streamMessage } from "@/services/chat";
import { getErrorMessage } from "@/services/errors";
import { useSessionLimitStore } from "@/store/useSessionLimitStore";

interface ChatState {
  projectId: string | null;
  sessionId: number | null;
  messageIds: string[];
  messagesById: Record<string, ChatMessage>;
  loading: boolean;
  error: string | null;
  boot: (projectId: string) => Promise<void>;
  send: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  projectId: null,
  sessionId: null,
  messageIds: [],
  messagesById: {},
  loading: false,
  error: null,

  boot: async (projectId) => {
    set({ loading: true, error: null, projectId, sessionId: null, messageIds: [], messagesById: {} });
    try {
      const sessionId = await getOrCreateChatSession(projectId);
      if (get().projectId !== projectId) return;
      const messages = await getChatHistory(sessionId);
      if (get().projectId !== projectId) return;
      const messageIds = messages.map((m) => m.id);
      const messagesById = Object.fromEntries(messages.map((m) => [m.id, m]));
      set({ sessionId, messageIds, messagesById, loading: false });
    } catch (error) {
      if (get().projectId !== projectId) return;
      set({ loading: false, error: getErrorMessage(error, "Failed to load chat history") });
    }
  },

  send: async (content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const { projectId, loading } = get();
    if (!projectId || loading) return;

    // ── Session limit gate ─────────────────────────────────────────────────
    const allowed = useSessionLimitStore.getState().consumeMessage();
    if (!allowed) return; // paywall modal shown by consumeMessage
    // ───────────────────────────────────────────────────────────────────────

    const currentSessionId =
      get().sessionId ?? (await getOrCreateChatSession(projectId, trimmed));
    if (get().projectId !== projectId) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    set((s) => ({
      sessionId: currentSessionId,
      messageIds: [...s.messageIds, userMsg.id, assistantId],
      messagesById: { ...s.messagesById, [userMsg.id]: userMsg, [assistantId]: assistantPlaceholder },
      loading: true,
      error: null,
    }));

    try {
      await streamMessage(
        { projectId, sessionId: currentSessionId, prompt: trimmed },
        {
          onToken: (token) => {
            set((s) => {
              const cur = s.messagesById[assistantId];
              if (!cur) return s;
              return { messagesById: { ...s.messagesById, [assistantId]: { ...cur, content: cur.content + token } } };
            });
          },
          onError: (message) => {
            set((s) => {
              const cur = s.messagesById[assistantId];
              return {
                loading: false, error: message,
                messagesById: cur ? { ...s.messagesById, [assistantId]: { ...cur, isStreaming: false } } : s.messagesById,
              };
            });
          },
          onDone: () => {
            set((s) => {
              const cur = s.messagesById[assistantId];
              return {
                loading: false,
                messagesById: cur ? { ...s.messagesById, [assistantId]: { ...cur, isStreaming: false } } : s.messagesById,
              };
            });
          },
        },
      );
    } catch (error) {
      set((s) => {
        const cur = s.messagesById[assistantId];
        return {
          loading: false,
          error: getErrorMessage(error, "Failed to stream response"),
          messagesById: cur ? { ...s.messagesById, [assistantId]: { ...cur, isStreaming: false } } : s.messagesById,
        };
      });
    }
  },
}));
