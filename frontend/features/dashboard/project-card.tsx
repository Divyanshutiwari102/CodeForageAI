import Link from "next/link";
import { ArrowUpRight, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { Project } from "@/types";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: "Active", cls: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  draft: { label: "Draft", cls: "bg-sky-400/10 text-sky-400 border-sky-400/20" },
  archived: { label: "Archived", cls: "bg-zinc-400/10 text-zinc-400 border-zinc-400/20" },
};

export function ProjectCard({ project }: { project: Project }) {
  const status = STATUS_MAP[project.status?.toLowerCase()] ?? STATUS_MAP.archived;

  return (
    <Link href={`/project/${project.id}`} className="group block">
      <Card variant="interactive" className="h-full p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-zinc-100 transition-colors group-hover:text-white">{project.name}</h3>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", status.cls)}>
              {status.label}
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-sky-400" />
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-zinc-500">{project.description || "No description provided."}</p>

        {project.framework ? (
          <div className="mt-3">
            <span className="rounded-md border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-zinc-400">
              {project.framework}
            </span>
          </div>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.05] pt-3 text-xs text-zinc-600">
          <span className="flex items-center gap-1 text-amber-400/80">
            <Star className="h-3 w-3" /> {project.stars ?? 0}
          </span>
          <span className="ml-auto flex items-center gap-1">
            <Clock className="h-3 w-3" /> {project.updatedAt}
          </span>
        </div>
      </Card>
    </Link>
  );
}
