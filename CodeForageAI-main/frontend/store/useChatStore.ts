"use client";

import { create } from "zustand";
import type { ChatMessage } from "@/types";
import { getChatHistory, getOrCreateChatSession, streamMessage } from "@/services/chat";

interface ChatState {
  projectId: string | null;
  sessionId: number | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  boot: (projectId: string) => Promise<void>;
  send: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  projectId: null,
  sessionId: null,
  messages: [],
  loading: false,
  error: null,
  boot: async (projectId) => {
    set({ loading: true, error: null, projectId });
    try {
      const sessionId = await getOrCreateChatSession(projectId);
      const messages = await getChatHistory(sessionId);
      set({ sessionId, messages, loading: false });
    } catch {
      set({ loading: false, error: "Failed to load chat history" });
    }
  },
  send: async (content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const { projectId } = get();
    if (!projectId) return;

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

    set({
      sessionId: currentSessionId,
      messages: [...get().messages, userMessage, assistantPlaceholder],
      loading: true,
      error: null,
    });

    try {
      await streamMessage(
        { projectId, sessionId: currentSessionId, prompt: trimmed },
        {
          onToken: (token) => {
            set((state) => ({
              messages: state.messages.map((message) =>
                message.id === assistantMessageId
                  ? { ...message, content: `${message.content}${token}` }
                  : message,
              ),
            }));
          },
          onError: (message) => {
            set((state) => ({
              loading: false,
              error: message,
              messages: state.messages.map((item) =>
                item.id === assistantMessageId ? { ...item, isStreaming: false } : item,
              ),
            }));
          },
          onDone: () => {
            set((state) => ({
              loading: false,
              messages: state.messages.map((message) =>
                message.id === assistantMessageId ? { ...message, isStreaming: false } : message,
              ),
            }));
          },
        },
      );
    } catch {
      set((state) => ({
        loading: false,
        error: "Failed to stream response",
        messages: state.messages.map((item) =>
          item.id === assistantMessageId ? { ...item, isStreaming: false } : item,
        ),
      }));
    }
  },
}));
