"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { ChatMessage } from "@/types";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => Promise<void>;
}

export function ChatPanel({ messages, loading, onSend }: Props) {
  const [input, setInput] = useState("");

  return (
    <section className="flex h-full flex-col border-l border-white/10 bg-slate-950/75">
      <header className="border-b border-white/10 px-3 py-2 text-sm font-medium">AI Copilot</header>
      <div className="flex-1 space-y-3 overflow-auto p-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.role === "assistant" ? "rounded-xl bg-white/10 p-2 text-xs text-slate-200" : "ml-auto max-w-[90%] rounded-xl bg-cyan-500/20 p-2 text-xs text-cyan-100"}
          >
            {msg.content}
          </div>
        ))}
        {loading ? <div className="h-8 w-2/3 animate-pulse rounded-xl bg-white/10" /> : null}
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
