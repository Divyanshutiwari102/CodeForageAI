import { api } from "@/services/api";

export const PREVIEW_STATUSES = ["creating", "running", "failed", "terminated"] as const;
export type PreviewStatus = (typeof PREVIEW_STATUSES)[number];

interface PreviewStatusResponse {
  previewId: number;
  status: string | null;
  previewUrl: string | null;
  message: string | null;
  createdAt: string;
}

export interface PreviewState {
  previewId: number | null;
  previewUrl: string | null;
  status: PreviewStatus | null;
  message: string | null;
}

function normalizePreviewStatus(status: string | null | undefined): PreviewStatus | null {
  if (!status) return null;
  const normalized = status.toLowerCase();
  return PREVIEW_STATUSES.find((candidate) => candidate === normalized) ?? null;
}

function mapLatest(previews: PreviewStatusResponse[]): PreviewState {
  const latest = previews[0];
  if (!latest) return { previewId: null, previewUrl: null, status: null, message: null };
  return {
    previewId: latest.previewId,
    previewUrl: latest.previewUrl,
    status: normalizePreviewStatus(latest.status),
    message: latest.message,
  };
}

export async function getLatestPreview(projectId: string): Promise<PreviewState> {
  const { data } = await api.get<PreviewStatusResponse[]>(`/projects/${projectId}/previews`);
  return mapLatest(data);
}

export async function startPreview(projectId: string): Promise<PreviewState> {
  await api.post(`/projects/${projectId}/previews`);
  return getLatestPreview(projectId);
}
