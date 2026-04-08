"use client";

import { motion } from "framer-motion";
import type { Stats } from "@/types";

export function StatsCard({ item, index = 0 }: { item: Stats; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="rounded-2xl border p-4 transition-all hover:-translate-y-0.5"
      style={{ background: "#0f0f18", borderColor: "rgba(255,255,255,0.07)" }}
    >
      <p className="text-xs text-white/40">{item.label}</p>
      <p className="mt-2 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
        {item.value}
      </p>
      <p className="mt-1 text-xs text-violet-400">{item.delta}</p>
    </motion.div>
  );
}
