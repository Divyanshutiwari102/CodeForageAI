"use client";

import { useEffect, useRef, useState, memo, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Send, Save, RotateCw, Sparkles, ChevronDown, Bot, User, Copy, Check } from "lucide-react";
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

const spring = { type: "spring" as const, stiffness: 400, damping: 35 };

// ─── Thinking dots ─────────────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1" aria-label="AI is thinking">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-violet-400/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Copy button ───────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [text]);

  return (
    <motion.button
      onClick={handleCopy}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
        "text-white/20 hover:bg-white/[0.08] hover:text-white/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
      )}
      whileTap={{ scale: 0.85 }}
      title="Copy message"
      aria-label="Copy message"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check className="h-3 w-3 text-emerald-400" />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy className="h-3 w-3" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Message bubble ────────────────────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      initial={prefersReduced ? {} : { opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn("group flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {/* Avatar */}
      <div
        className={cn(
          "mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600"
            : "border border-violet-500/30 bg-violet-500/15",
        )}
        aria-hidden="true"
      >
        {isUser ? (
          <User className="h-3 w-3 text-white" />
        ) : (
          <Bot className="h-3 w-3 text-violet-400" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser && "items-end")}>
        <div
          className={cn(
            "relative rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-sm bg-violet-600 text-white shadow-lg shadow-violet-900/30"
              : "rounded-tl-sm text-white/80",
          )}
          style={!isUser ? { background: "rgba(28,28,42,0.9)", border: "1px solid rgba(255,255,255,0.06)" } : {}}
        >
          {message.isStreaming && !message.content ? (
            <ThinkingDots />
          ) : (
            <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
          )}
        </div>

        {/* Copy action — shows on hover */}
        {!message.isStreaming && message.content && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton text={message.content} />
          </div>
        )}
      </div>
    </motion.div>
  );
});

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-1 flex-col items-center justify-center py-10 text-center"
    >
      <motion.div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-5 w-5 text-violet-400" />
      </motion.div>
      <p className="text-sm font-medium text-white/50">AI Copilot is ready</p>
      <p className="mt-1 max-w-[160px] text-xs text-white/25 leading-relaxed">
        Describe what you want to build or modify
      </p>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ChatPanel({
  messages,
  loading,
  error,
  onSend,
  onSaveAsCommit,
  commitLoading = false,
}: Props) {
  const [input, setInput] = useState("");
  const [autoScrolling, setAutoScrolling] = useState(true);
  const [focused, setFocused] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!autoScrolling) return;
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: prefersReduced ? "instant" : "smooth" });
  }, [messages, loading, autoScrolling, prefersReduced]);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAutoScrolling(atBottom);
  }, []);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const val = input.trim();
      if (!val || loading) return;
      setInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      await onSend(val);
    },
    [input, loading, onSend],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit],
  );

  const scrollToBottom = useCallback(() => {
    setAutoScrolling(true);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  const canSend = input.trim().length > 0 && !loading;

  return (
    <section
      className="flex h-full flex-col"
      style={{ background: "#0d0d14", borderLeft: "1px solid rgba(255,255,255,0.05)" }}
      aria-label="AI chat panel"
    >
      {/* ── Header ── */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-white/[0.05] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg border border-violet-500/30 bg-violet-500/15">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-white/80">AI Copilot</span>
          {loading && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1.5"
            >
              <div className="h-1 w-1 rounded-full bg-violet-400 animate-pulse" />
              <span className="text-[10px] text-white/30">Generating</span>
            </motion.div>
          )}
        </div>

        {onSaveAsCommit && (
          <motion.button
            type="button"
            disabled={commitLoading}
            onClick={() => void onSaveAsCommit()}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5",
              "text-xs text-white/50 transition-colors hover:border-white/15 hover:bg-white/[0.08] hover:text-white/80",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
            whileTap={prefersReduced ? {} : { scale: 0.96 }}
            aria-label="Save as commit"
          >
            <Save className="h-3 w-3" aria-hidden="true" />
            {commitLoading ? "Saving…" : "Save commit"}
          </motion.button>
        )}
      </header>

      {/* ── Messages ── */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 && !loading && <EmptyState />}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </AnimatePresence>

        {/* Thinking indicator when no streaming message */}
        {loading && !messages.some((m) => m.isStreaming) && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/15">
              <Bot className="h-3 w-3 text-violet-400" />
            </div>
            <div
              className="rounded-2xl rounded-tl-sm px-3.5 py-2.5"
              style={{ background: "rgba(28,28,42,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <ThinkingDots />
            </div>
          </motion.div>
        )}

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-400"
              role="alert"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Scroll to bottom ── */}
      <AnimatePresence>
        {!autoScrolling && (
          <div className="relative h-0">
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={spring}
              onClick={scrollToBottom}
              className={cn(
                "absolute -top-10 right-4 flex h-7 w-7 items-center justify-center rounded-full",
                "border border-white/10 bg-[#1c1c2a] text-white/50 shadow-xl",
                "hover:border-white/20 hover:text-white/80 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
              )}
              aria-label="Scroll to bottom"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div className="flex-shrink-0 border-t border-white/[0.05] p-3">
        <motion.div
          animate={{
            boxShadow: focused
              ? "0 0 0 1px rgba(139,92,246,0.35), 0 4px 24px rgba(109,40,217,0.12)"
              : "0 0 0 1px rgba(255,255,255,0.07)",
          }}
          transition={{ duration: 0.2 }}
          className="flex gap-2 rounded-xl bg-white/[0.04] p-2"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Ask AI to build or modify..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-1 py-1 text-sm text-white placeholder:text-white/20 focus:outline-none"
            style={{ minHeight: 36, maxHeight: 120 }}
            aria-label="Chat input"
          />
          <motion.button
            type="button"
            disabled={!canSend}
            onClick={() => void handleSubmit()}
            className={cn(
              "flex h-8 w-8 flex-shrink-0 items-center justify-center self-end rounded-lg",
              "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
              canSend
                ? "bg-violet-600 text-white hover:bg-violet-500"
                : "bg-white/[0.06] text-white/25 cursor-not-allowed",
            )}
            whileTap={canSend && !prefersReduced ? { scale: 0.88 } : {}}
            animate={canSend ? { scale: 1 } : { scale: 0.95 }}
            transition={spring}
            aria-label="Send message"
          >
            {loading ? (
              <RotateCw className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </motion.button>
        </motion.div>
        <p className="mt-1.5 px-1 text-[10px] text-white/15 select-none">
          Enter to send · Shift+Enter for newline
        </p>
      </div>
    </section>
  );
}
