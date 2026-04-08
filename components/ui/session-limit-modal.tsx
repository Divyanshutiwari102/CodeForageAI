"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, MessageSquare, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useSessionLimitStore, FREE_DAILY_LIMIT } from "@/store/useSessionLimitStore";

export function SessionLimitModal() {
  const showPaywall    = useSessionLimitStore((s) => s.showPaywall);
  const resetsAt       = useSessionLimitStore((s) => s.resetsAt);
  const dismissPaywall = useSessionLimitStore((s) => s.dismissPaywall);

  const resetTime = new Date(resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <AnimatePresence>
      {showPaywall && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl"
            style={{ background: "#13131c", borderColor: "rgba(255,255,255,0.1)" }}>
            <button onClick={dismissPaywall}
              className="absolute right-4 top-4 rounded-lg p-1 text-white/30 transition hover:bg-white/5 hover:text-white/60">
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex flex-col items-center gap-3 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15">
                <MessageSquare className="h-7 w-7 text-violet-400" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black">!</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Daily limit reached</h2>
                <p className="mt-1 text-sm text-white/40">Free plan: {FREE_DAILY_LIMIT} messages / day</p>
              </div>
            </div>

            <div className="mb-5 flex items-center gap-3 rounded-xl p-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <RotateCcw className="h-4 w-4 flex-shrink-0 text-white/30" />
              <p className="text-xs text-white/50">
                Resets at <span className="font-medium text-white/70">{resetTime}</span> (midnight UTC)
              </p>
            </div>

            <div className="mb-5 rounded-xl p-4"
              style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(59,130,246,0.1))", border: "1px solid rgba(124,58,237,0.25)" }}>
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">Upgrade to Pro</span>
              </div>
              <ul className="space-y-1.5">
                {["Unlimited messages — no daily cap","Unlimited tokens per month","5 concurrent live previews","Priority AI responses","Team collaboration"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-white/60">
                    <span className="text-violet-400">✓</span>{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/dashboard#pricing" onClick={dismissPaywall}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95">
                <Zap className="h-4 w-4" />Upgrade to Pro — ₹999/mo
              </Link>
              <button onClick={dismissPaywall} className="w-full rounded-xl py-2 text-sm text-white/40 transition hover:text-white/60">
                Wait until {resetTime}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
