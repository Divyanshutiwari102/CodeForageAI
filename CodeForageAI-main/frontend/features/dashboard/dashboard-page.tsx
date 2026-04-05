"use client";

import { useEffect } from "react";
import { shallow } from "zustand/shallow";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjectsStore } from "@/store/useProjectsStore";
import { StatsCard } from "@/features/dashboard/stats-card";
import { ProjectCard } from "@/features/dashboard/project-card";

export function DashboardPage() {
  const { projects, stats, loading, loadDashboard } = useProjectsStore(
    (state) => ({
      projects: state.projects,
      stats: state.stats,
      loading: state.loading,
      loadDashboard: state.loadDashboard,
    }),
    shallow,
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <DashboardShell>
      <DashboardTopbar />
      <main className="space-y-6 p-4 sm:p-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />) : stats.map((item) => <StatsCard key={item.label} item={item} />)}
        </section>
        <section>
          <h2 className="mb-3 text-lg font-semibold text-white">Projects</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44" />) : projects.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
        </section>
      </main>
    </DashboardShell>
  );
}
