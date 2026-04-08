"use client";

import { create } from "zustand";
import type { Project, Stats } from "@/types";
import { createProject as createProjectApi, getProjects, getStats } from "@/services/projects";

interface ProjectsState {
projects: Project[];
stats: Stats[];
loading: boolean;
loadDashboard: () => Promise<void>;
  createProject: (name: string) => Promise<Project>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  stats: [],
  loading: false,
  loadDashboard: async () => {
    set({ loading: true });
    const [projects, stats] = await Promise.all([getProjects(), getStats()]);
    set({ projects, stats, loading: false });
  },
  createProject: async (name: string) => {
    const project = await createProjectApi(name);
    set({ projects: [project, ...get().projects] });
    return project;
  },
}));