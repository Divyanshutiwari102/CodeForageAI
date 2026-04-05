"use client";

import { create } from "zustand";
import type { ChatMessage } from "@/types";
import { getChatHistory, getOrCreateChatSession, streamMessage } from "@/services/chat";
import { getErrorMessage } from "@/services/errors";

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
    set({ loading: true, error: null, projectId });
    try {
      const sessionId = await getOrCreateChatSession(projectId);
      const messages = await getChatHistory(sessionId);
      const messageIds = messages.map((message) => message.id);
      const messagesById = Object.fromEntries(messages.map((message) => [message.id, message]));
      set({ sessionId, messageIds, messagesById, loading: false });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error, "Failed to load chat history") });
    }
  },
  send: async (content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const { projectId, loading } = get();
    if (!projectId) return;
    if (loading) return;

    const currentSessionId = get().sessionId ?? (await getOrCreateChatSession(projectId, trimmed));
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const assistantMessageId = crypto.randomUUID();
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    set((state) => ({
      sessionId: currentSessionId,
      messageIds: [...state.messageIds, userMessage.id, assistantMessageId],
      messagesById: {
        ...state.messagesById,
        [userMessage.id]: userMessage,
        [assistantMessageId]: assistantPlaceholder,
      },
      loading: true,
      error: null,
    }));

    try {
      await streamMessage(
        { projectId, sessionId: currentSessionId, prompt: trimmed },
        {
          onToken: (token) => {
            set((state) => ({
              messagesById: (() => {
                const current = state.messagesById[assistantMessageId];
                if (!current) return state.messagesById;
                return {
                  ...state.messagesById,
                  [assistantMessageId]: {
                    ...current,
                    content: `${current.content}${token}`,
                  },
                };
              })(),
            }));
          },
          onError: (message) => {
            set((state) => ({
              loading: false,
              error: message,
              messagesById: (() => {
                const current = state.messagesById[assistantMessageId];
                if (!current) return state.messagesById;
                return {
                  ...state.messagesById,
                  [assistantMessageId]: { ...current, isStreaming: false },
                };
              })(),
            }));
          },
          onDone: () => {
            set((state) => ({
              loading: false,
              messagesById: (() => {
                const current = state.messagesById[assistantMessageId];
                if (!current) return state.messagesById;
                return {
                  ...state.messagesById,
                  [assistantMessageId]: { ...current, isStreaming: false },
                };
              })(),
            }));
          },
        },
      );
    } catch (error) {
      set((state) => ({
        loading: false,
        error: getErrorMessage(error, "Failed to stream response"),
        messagesById: (() => {
          const current = state.messagesById[assistantMessageId];
          if (!current) return state.messagesById;
          return {
            ...state.messagesById,
            [assistantMessageId]: { ...current, isStreaming: false },
          };
        })(),
      }));
    }
  },
}));
