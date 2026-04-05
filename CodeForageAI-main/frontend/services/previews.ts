import { api } from "@/services/api";

interface PreviewStatusResponse {
  previewId: number;
  status: string;
  previewUrl: string | null;
  message: string | null;
  createdAt: string;
}

export interface PreviewState {
  previewId: number | null;
  previewUrl: string | null;
  status: string | null;
  message: string | null;
}

function mapLatest(previews: PreviewStatusResponse[]): PreviewState {
  const latest = previews[0];
  if (!latest) return { previewId: null, previewUrl: null, status: null, message: null };
  return {
    previewId: latest.previewId,
    previewUrl: latest.previewUrl,
    status: latest.status,
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
