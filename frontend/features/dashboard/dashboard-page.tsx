"use client";

import { useEffect } from "react";
import { FolderOpen } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectsStore } from "@/store/useProjectsStore";
import { StatsCard } from "@/features/dashboard/stats-card";
import { ProjectCard } from "@/features/dashboard/project-card";

export function DashboardPage() {
  const projects = useProjectsStore((state) => state.projects);
  const stats = useProjectsStore((state) => state.stats);
  const loading = useProjectsStore((state) => state.loading);
  const loadDashboard = useProjectsStore((state) => state.loadDashboard);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <DashboardShell>
      <DashboardTopbar />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28" />)
            : stats.map((item) => <StatsCard key={item.label} item={item} />)}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Projects</h2>
            {!loading ? <p className="text-xs text-zinc-500">{projects.length} total</p> : null}
          </div>

          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-44" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="grid place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] py-12 text-center">
              <div>
                <FolderOpen className="mx-auto h-6 w-6 text-zinc-500" />
                <p className="mt-3 text-sm text-zinc-300">No projects yet</p>
                <p className="mt-1 text-xs text-zinc-500">Create your first workspace to start shipping.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </DashboardShell>
  );
}
