import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Project } from "@/types";

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

const STATUS_STYLES: Record<string, { bg: string; color: string; dot: string }> = {
  active: { bg: "rgba(34,197,94,0.1)", color: "#86efac", dot: "#4ade80" },
  draft:  { bg: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)", dot: "rgba(255,255,255,0.2)" },
  archived: { bg: "rgba(239,68,68,0.08)", color: "rgba(252,165,165,0.7)", dot: "rgba(252,165,165,0.5)" },
};

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

export function ProjectCard({ project }: { project: Project }) {
  const statusStyle = STATUS_STYLES[project.status] ?? STATUS_STYLES.draft;

  return (
    <Link href={`/project/${project.id}`} className="group block outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-xl">
      <motion.div
        className="relative overflow-hidden rounded-xl border border-white/[0.07] transition-colors duration-200 hover:border-white/[0.14]"
        style={{ background: "#0f0f18" }}
        whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.1)" }}
        whileTap={{ scale: 0.98 }}
        transition={spring}
      >
        {/* Gradient accent bar */}
        <div
          className="h-[2px] w-full opacity-60 transition-opacity group-hover:opacity-90"
          style={{ background: "linear-gradient(90deg, #7c3aed 0%, #db2777 50%, #ea580c 100%)" }}
        />

        {/* Hover glow overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.06), transparent)" }}
          aria-hidden="true"
        />

        <div className="relative p-4">
          <div className="mb-2.5 flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-sm font-semibold text-white/85 transition-colors group-hover:text-white">
              {project.name}
            </h3>
            <motion.div
              className="flex-shrink-0 text-white/20 opacity-0 transition-opacity group-hover:opacity-100"
              whileHover={{ scale: 1.1 }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </motion.div>
          </div>

          <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-white/35">
            {project.description || "No description yet"}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: statusStyle.dot }} />
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize"
                style={{ background: statusStyle.bg, color: statusStyle.color }}
              >
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/20">
              <Clock className="h-3 w-3" />
              <span>{formatRelativeTime(project.updatedAt)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
