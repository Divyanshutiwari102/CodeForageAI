import Link from "next/link";
import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`}>
      <Card className="h-full p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">{project.name}</h3>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase text-slate-300">{project.status}</span>
        </div>
        <p className="mt-2 line-clamp-2 text-sm text-slate-400">{project.description}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>{project.framework}</span>
          <span>{project.updatedAt}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-amber-300"><Star className="h-3.5 w-3.5" />{project.stars}</div>
      </Card>
    </Link>
  );
}
