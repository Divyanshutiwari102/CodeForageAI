"use client";

import { create } from "zustand";
import type { ChatMessage } from "@/types";
import { seedChat, sendMessage } from "@/services/chat";

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  boot: () => Promise<void>;
  send: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  loading: false,
  boot: async () => {
    const messages = await seedChat();
    set({ messages });
  },
  send: async (content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    set({ messages: [...get().messages, userMessage], loading: true });
    const reply = await sendMessage(trimmed);
    set({ messages: [...get().messages, reply], loading: false });
  },
}));
