"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/types";
import { cn } from "@/utils/cn";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  error?: string | null;
  onSend: (message: string) => Promise<void>;
}

export function ChatPanel({ messages, loading, error, onSend }: Props) {
  const THINKING_LABEL = "Thinking...";
  const [input, setInput] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = listRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  function renderMessageContent(message: ChatMessage) {
    if (message.content) return message.content;
    if (message.isStreaming) return <span className={cn("text-slate-400", !reduceMotion && "animate-pulse")}>{THINKING_LABEL}</span>;
    return null;
  }

  return (
    <section className="flex h-full flex-col border-l border-white/10 bg-slate-950/75">
      <header className="border-b border-white/10 px-3 py-2 text-sm font-medium">AI Copilot</header>
      <div ref={listRef} className="flex-1 space-y-3 overflow-auto p-3">
        {messages.length === 0 && !loading ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-400">
            Start a conversation to generate code and edits.
          </div>
        ) : null}
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          return (
            <div
              key={msg.id}
              className={cn(
                "max-w-[90%] rounded-xl p-2 text-xs",
                isAssistant ? "bg-white/10 text-slate-200" : "ml-auto bg-cyan-500/20 text-cyan-100",
              )}
            >
              {renderMessageContent(msg)}
            </div>
          );
        })}
        {loading && !messages.some((message) => message.isStreaming) ? (
          <div className={cn("w-fit rounded-xl bg-white/10 px-3 py-2 text-xs text-slate-400", !reduceMotion && "animate-pulse")}>{THINKING_LABEL}</div>
        ) : null}
        {error ? <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-2 text-xs text-rose-200">{error}</div> : null}
      </div>
      <form
        className="flex items-center gap-2 border-t border-white/10 p-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const value = input.trim();
          if (!value) return;
          setInput("");
          await onSend(value);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs outline-none ring-cyan-400 transition focus:ring-2"
        />
        <button className="rounded-lg bg-cyan-400 p-2 text-slate-950 transition hover:bg-cyan-300" type="submit">
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </section>
  );
}
