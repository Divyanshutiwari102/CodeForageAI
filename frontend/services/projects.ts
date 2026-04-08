import type { Analytics, Project, Stats } from "@/types";
import { api } from "@/services/api";

interface ApiProjectSummary {
  id: number;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  shareToken?: string | null;
}

interface ApiProjectDetail {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  shareToken?: string | null;
}

interface ProjectShareResponse {
  shareToken: string;
}

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<ApiProjectSummary[]>("/projects");
  return data.map((project) => ({
    id: String(project.id),
    name: project.projectName,
    framework: "Web",
    status: "active",
    updatedAt: project.updatedAt,
    stars: 0,
    description: "Project workspace",
    shareToken: project.shareToken ?? undefined,
  }));
}

export async function getStats(): Promise<Stats[]> {
  const { data: analytics } = await api.get<Analytics>("/analytics");
  return [
    { label: "Projects Created", value: String(analytics.projectCreatedCount), delta: "Recent activity" },
    { label: "Chat Usage", value: String(analytics.chatUsageCount), delta: "Recent activity" },
    { label: "Preview Usage", value: String(analytics.previewUsageCount), delta: "Recent activity" },
  ];
}

export async function shareProject(projectId: string): Promise<string> {
  const { data } = await api.post<ProjectShareResponse>(`/projects/${projectId}/share`);
  return data.shareToken;
}

export async function getProjectByShareToken(token: string): Promise<Project> {
  const { data } = await api.get<ApiProjectDetail>(`/projects/share/${token}`);
  return {
    id: String(data.id),
    name: data.name,
    framework: "Web",
    status: "active",
    updatedAt: data.updatedAt,
    stars: 0,
    description: "Shared project workspace",
    shareToken: token,
  };
}
