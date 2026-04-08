"use client";

import { create } from "zustand";
import type { Project, Stats } from "@/types";
import { getProjects, getStats } from "@/services/projects";

interface ProjectsState {
  projects: Project[];
  stats: Stats[];
  loading: boolean;
  loadDashboard: () => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  projects: [],
  stats: [],
  loading: false,
  loadDashboard: async () => {
    set({ loading: true });
    const [projects, stats] = await Promise.all([getProjects(), getStats()]);
    set({ projects, stats, loading: false });
  },
}));
