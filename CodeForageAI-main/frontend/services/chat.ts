import { api } from "@/services/api";
import { getAuthToken } from "@/services/token";
import type { ChatMessage } from "@/types";

interface ChatSessionResponse {
  id: number;
  title: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessageResponse {
  id: number;
  content: string;
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
  createdAt: string;
}

interface ChatStreamEvent {
  type: "token" | "file_saved" | "done" | "error";
  content: string | null;
}

function mapRole(role: ChatMessageResponse["role"]): "user" | "assistant" {
  return role === "USER" ? "user" : "assistant";
}

function toTitle(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "New chat";
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
}

function parseSseChunk(buffer: string): { events: ChatStreamEvent[]; rest: string } {
  const parts = buffer.split("\n\n");
  const rest = parts.pop() ?? "";
  const events: ChatStreamEvent[] = [];

  for (const block of parts) {
    const line = block
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.startsWith("data:"));
    if (!line) continue;
    const raw = line.slice(5).trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as ChatStreamEvent;
      events.push(parsed);
    } catch {
      continue;
    }
  }

  return { events, rest };
}

export async function getOrCreateChatSession(projectId: string, fallbackPrompt = "New chat"): Promise<number> {
  const { data: sessions } = await api.get<ChatSessionResponse[]>(`/projects/${projectId}/chat-sessions`);
  if (sessions.length > 0) return sessions[0].id;
  const { data } = await api.post<ChatSessionResponse>(`/projects/${projectId}/chat-sessions`, {
    title: toTitle(fallbackPrompt),
  });
  return data.id;
}

export async function getChatHistory(sessionId: number): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessageResponse[]>(`/chat/sessions/${sessionId}/messages`);
  return data.map((message) => ({
    id: String(message.id),
    role: mapRole(message.role),
    content: message.content,
    createdAt: message.createdAt,
  }));
}

export async function streamMessage(
  params: {
    projectId: string;
    sessionId: number;
    prompt: string;
  },
  handlers: {
    onToken: (token: string) => void;
    onDone: () => void;
    onError: (message: string) => void;
    onFileSaved?: (path: string) => void;
  },
): Promise<void> {
  const CHAT_STREAM_TIMEOUT_MS = 60000;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
  const token = getAuthToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_STREAM_TIMEOUT_MS);

  try {
    const response = await fetch(`${base}/chat/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        sessionId: params.sessionId,
        projectId: Number(params.projectId),
        prompt: params.prompt,
      }),
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      throw new Error(text || "Failed to stream chat response");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const parsed = parseSseChunk(buffer);
      buffer = parsed.rest;

      for (const event of parsed.events) {
        if (event.type === "token" && event.content) handlers.onToken(event.content);
        if (event.type === "file_saved" && event.content) handlers.onFileSaved?.(event.content);
        if (event.type === "error") handlers.onError(event.content ?? "Streaming failed");
        if (event.type === "done") handlers.onDone();
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
