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

export function createPreviewLiveSocket(projectId: string): WebSocket | null {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!base) return null;
  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return null;
  }
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return new WebSocket(`${protocol}//${url.host}/ws/projects/${projectId}/preview`);
}
