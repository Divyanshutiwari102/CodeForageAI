"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Sidebar } from "@/features/dashboard/sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0a0f" }}>
      {/* Pass mobileOpen state down — Sidebar reads from a shared store or prop */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-12 flex-shrink-0 items-center gap-3 border-b border-white/[0.05] px-4 md:hidden">
          <motion.button
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            whileTap={{ scale: 0.9 }}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </motion.button>
          <span className="text-sm font-semibold text-white/70">
            CodeForage<span className="text-violet-400">AI</span>
          </span>
        </div>

        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
