"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Plus, Mic } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

const EXAMPLE_PROMPTS = [
  "Build a SaaS dashboard with analytics charts",
  "Create a food delivery app with map integration",
  "Build a project management tool like Trello",
  "Create an e-commerce store with cart and checkout",
];

export function HeroSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [placeholder, setPlaceholder] = useState("Ask CodeForageAI to build something...");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/signup");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPrompt(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* Gradient background — Lovable style */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(168,85,247,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 60%, rgba(59,130,246,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(239,68,68,0.2) 0%, transparent 60%), #0a0a0f",
        }}
      />
      {/* Noise texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Build something{" "}
          <span className="gradient-text">amazing</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="mb-10 text-lg text-white/60"
        >
          Create apps and websites by chatting with AI
        </motion.p>

        {/* Prompt input — Lovable style */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl">
            <div className="relative rounded-2xl bg-[#1a1a24] ring-1 ring-white/10 transition-all focus-within:ring-white/20">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                onFocus={() => setPlaceholder("")}
                onBlur={() => setPlaceholder("Ask CodeForageAI to build something...")}
                rows={2}
                className="w-full resize-none bg-transparent px-5 pt-5 pb-2 text-base text-white placeholder:text-white/30 focus:outline-none"
                style={{ minHeight: 80, maxHeight: 160 }}
              />
              <div className="flex items-center justify-between px-4 pb-3">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/40 transition hover:bg-white/5 hover:text-white/60"
                >
                  <Plus className="h-4 w-4" />
                  Attach
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white/60"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30 active:scale-95"
                    aria-label="Submit"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Example prompts */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setPrompt(ex);
                  textareaRef.current?.focus();
                }}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition hover:border-white/20 hover:bg-white/10 hover:text-white/80"
              >
                {ex}
              </button>
            ))}
          </div>
        </motion.div>

        {!isAuthenticated && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-sm text-white/30"
          >
            No credit card required.{" "}
            <Link href="/signup" className="text-white/50 underline-offset-2 hover:text-white/70 hover:underline">
              Sign up free
            </Link>
          </motion.p>
        )}
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-1 text-white/20">
          <div className="h-6 w-px bg-gradient-to-b from-transparent to-white/20" />
        </div>
      </motion.div>
    </section>
  );
}
