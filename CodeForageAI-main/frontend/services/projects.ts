import type { Project, Stats } from "@/types";

const DEMO_PROJECTS: Project[] = [
  { id: "1", name: "CodeForage Landing", framework: "Next.js", status: "active", updatedAt: "2m ago", stars: 23, description: "High-converting landing for AI workflows" },
  { id: "2", name: "AI Pair Dashboard", framework: "React", status: "active", updatedAt: "15m ago", stars: 9, description: "Analytics and collaboration dashboard" },
  { id: "3", name: "Realtime IDE", framework: "TypeScript", status: "draft", updatedAt: "1h ago", stars: 41, description: "Code editor with assistant and live preview" },
];

const DEMO_STATS: Stats[] = [
  { label: "Active Projects", value: "12", delta: "+2 this week" },
  { label: "AI Generations", value: "1,248", delta: "+14%" },
  { label: "Deployments", value: "94", delta: "+6%" },
  { label: "Team Members", value: "8", delta: "+1 this month" },
];

export async function getProjects(): Promise<Project[]> {
  await new Promise((r) => setTimeout(r, 300));
  return DEMO_PROJECTS;
}

export async function getStats(): Promise<Stats[]> {
  await new Promise((r) => setTimeout(r, 300));
  return DEMO_STATS;
}
