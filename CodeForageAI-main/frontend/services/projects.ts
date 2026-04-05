import type { Analytics, Project, Stats } from "@/types";
import { api } from "@/services/api";

interface ApiProject {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  shareToken?: string | null;
}

interface ProjectShareResponse {
  shareToken: string;
}

interface ApiMetrics {
  timestamp: string;
  totalUsers: number;
  totalProjects: number;
  totalChatSessions: number;
  totalMessagesAllTime: number;
}

export async function getProjects(): Promise<Project[]> {
  const { data } = await api.get<ApiProject[]>("/projects");
  return data.map((project) => ({
    id: String(project.id),
    name: project.name,
    framework: "Web",
    status: "active",
    updatedAt: project.updatedAt,
    stars: 0,
    description: "Project workspace",
    shareToken: project.shareToken ?? undefined,
  }));
}

export async function getStats(): Promise<Stats[]> {
  const [{ data: metrics }, { data: analytics }] = await Promise.all([
    api.get<ApiMetrics>("/metrics"),
    api.get<Analytics>("/analytics"),
  ]);
  return [
    { label: "Active Projects", value: String(metrics.totalProjects), delta: `+${analytics.projectCreatedCount} created` },
    { label: "Chat Usage", value: String(analytics.chatUsageCount), delta: `${metrics.totalChatSessions} sessions total` },
    { label: "Preview Usage", value: String(analytics.previewUsageCount), delta: `${metrics.totalMessagesAllTime} messages all-time` },
    { label: "Total Users", value: String(metrics.totalUsers), delta: "Platform-wide" },
  ];
}

export async function shareProject(projectId: string): Promise<string> {
  const { data } = await api.post<ProjectShareResponse>(`/projects/${projectId}/share`);
  return data.shareToken;
}

export async function getProjectByShareToken(token: string): Promise<Project> {
  const { data } = await api.get<ApiProject>(`/projects/share/${token}`);
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
