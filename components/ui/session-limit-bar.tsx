"use client";

import { motion } from "framer-motion";
import { Zap, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useSessionLimitStore, selectSessionStatus, FREE_DAILY_LIMIT } from "@/store/useSessionLimitStore";

interface Props { variant?: "compact" | "full"; }

export function SessionLimitBar({ variant = "compact" }: Props) {
  const used     = useSessionLimitStore((s) => s.used);
  const limit    = useSessionLimitStore((s) => s.limit);
  const resetsAt = useSessionLimitStore((s) => s.resetsAt);
  const { unlimited, remaining, pct, nearLimit } = useSessionLimitStore(selectSessionStatus);

  if (unlimited) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-violet-500/10 px-2.5 py-1 text-[10px] font-medium text-violet-400">
        <Zap className="h-3 w-3" />Pro — Unlimited
      </div>
    );
  }

  const resetTime = new Date(resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (variant === "compact") {
    return (
      <div
        className="flex items-center gap-2 rounded-full px-2.5 py-1 text-[10px]"
        style={{
          background: nearLimit ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${nearLimit ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.07)"}`,
          color: nearLimit ? "#fbbf24" : "rgba(255,255,255,0.4)",
        }}
      >
        <MessageSquare className="h-3 w-3 flex-shrink-0" />
        <span>{remaining} left today</span>
        {nearLimit && (
          <Link href="/dashboard#pricing"
            className="ml-1 rounded-full bg-amber-500 px-1.5 py-0.5 text-[9px] font-bold text-black hover:bg-amber-400">
            Upgrade
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Daily messages</span>
        </div>
        <span className={`text-xs font-semibold ${nearLimit ? "text-amber-400" : "text-white/50"}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <motion.div className="h-full rounded-full"
          style={{ background: nearLimit ? "#f59e0b" : "#7c3aed" }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[10px] text-white/25">Resets at {resetTime} UTC</p>
        {nearLimit && (
          <Link href="/dashboard#pricing" className="flex items-center gap-1 text-[10px] font-medium text-violet-400 hover:text-violet-300">
            <Zap className="h-3 w-3" />Go Pro
          </Link>
        )}
      </div>
    </div>
  );
}
