"use client";

import { useEffect, useRef, useState } from "react";
import { Save, Send } from "lucide-react";
import type { ChatMessage } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  error?: string | null;
  onSend: (message: string) => Promise<void>;
  onSaveAsCommit?: () => Promise<void>;
  commitLoading?: boolean;
}

export function ChatPanel({ messages, loading, error, onSend, onSaveAsCommit, commitLoading = false }: Props) {
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages, loading]);

  function renderMessageContent(message: ChatMessage) {
    if (message.content) return message.content;
    if (message.isStreaming) return "Thinking…";
    return null;
  }

  return (
    <section className="flex h-full flex-col border-l border-white/[0.06] bg-zinc-950/80">
      <header className="border-b border-white/[0.06] px-3 py-2 text-sm font-medium text-zinc-100">AI Copilot</header>
      {onSaveAsCommit ? (
        <div className="border-b border-white/[0.06] px-3 py-2">
          <button
            type="button"
            disabled={commitLoading}
            onClick={() => void onSaveAsCommit()}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            Save chat as commit
          </button>
        </div>
      ) : null}

      <div ref={listRef} className="flex-1 space-y-3 overflow-auto p-3">
        {messages.length === 0 && !loading ? (
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-xs text-zinc-400">
            Start a conversation to generate code and edits.
          </div>
        ) : null}

        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={cn(
                "group relative max-w-[88%] rounded-2xl px-3.5 py-3 text-[13px] leading-relaxed",
                isAssistant
                  ? "self-start border border-white/[0.07] bg-white/[0.05] text-zinc-200"
                  : "ml-auto self-end border border-sky-400/20 bg-sky-500/15 text-sky-100",
              )}
            >
              {renderMessageContent(msg)}
            </div>
          );
        })}

        {loading && !messages.some((message) => message.isStreaming) ? (
          <div className="flex w-fit items-center gap-1.5 rounded-2xl border border-white/[0.07] bg-white/[0.05] px-3.5 py-3">
            <span className="thinking-dot" />
            <span className="thinking-dot" />
            <span className="thinking-dot" />
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.07] p-2.5 text-xs text-rose-300">{error}</div>
        ) : null}
      </div>

      <form
        className="flex items-end gap-2 border-t border-white/[0.07] p-3"
        onSubmit={async (event) => {
          event.preventDefault();
          const value = input.trim();
          if (!value) return;
          setInput("");
          await onSend(value);
        }}
      >
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={1}
          placeholder="Ask AI to build, fix, or explain anything…"
          className="flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-all focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/15"
        />
        <button
          className="rounded-xl bg-sky-500 p-2.5 text-white transition-all hover:bg-sky-400 hover:shadow-[0_0_16px_rgba(56,189,248,0.35)] active:scale-95"
          type="submit"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </section>
  );
}
