"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Files, MessageSquare, Eye, GitBranch, Settings } from "lucide-react";
import { cn } from "@/utils/cn";

type PanelId = "explorer" | "chat" | "preview" | "git" | "settings";

const ITEMS: { id: PanelId; icon: React.ElementType; label: string }[] = [
  { id: "explorer",  icon: Files,          label: "Explorer"  },
  { id: "chat",      icon: MessageSquare,  label: "AI Chat"   },
  { id: "preview",   icon: Eye,            label: "Preview"   },
  { id: "git",       icon: GitBranch,      label: "Git"       },
];

export function ActivityBar() {
  const [active, setActive] = useState<PanelId>("explorer");

  return (
    <aside
      className="flex w-12 flex-shrink-0 flex-col items-center gap-1 border-r py-3"
      style={{ borderColor: "rgba(255,255,255,0.05)", background: "#090910" }}
      aria-label="Activity bar"
    >
      {ITEMS.map(({ id, icon: Icon, label }) => {
        const isActive = active === id;
        return (
          <motion.button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60",
              isActive
                ? "text-white"
                : "text-white/25 hover:bg-white/[0.05] hover:text-white/55",
            )}
            whileTap={{ scale: 0.88 }}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
          >
            {isActive && (
              <>
                <motion.span
                  layoutId="activity-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: "rgba(139,92,246,0.15)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
                {/* Left accent */}
                <motion.span
                  layoutId="activity-accent"
                  className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-full"
                  style={{ background: "#7c3aed" }}
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              </>
            )}
            <Icon className="relative z-10 h-4 w-4" aria-hidden="true" />
          </motion.button>
        );
      })}

      {/* Bottom — settings */}
      <motion.button
        className="mt-auto flex h-9 w-9 items-center justify-center rounded-lg text-white/20 transition-colors hover:bg-white/[0.05] hover:text-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
        whileTap={{ scale: 0.88 }}
        aria-label="Settings"
      >
        <Settings className="h-4 w-4" />
      </motion.button>
    </aside>
  );
}
