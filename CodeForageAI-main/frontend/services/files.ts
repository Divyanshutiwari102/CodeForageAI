import type { FileNode } from "@/types";
import { api } from "@/services/api";

interface ApiFileNode {
  path: string;
  modifiedAt: string;
  size: number;
  type: string;
}

interface ApiFileContent {
  path: string;
  content: string;
}

export const DEFAULT_EDITOR_LANGUAGE = "plaintext";

function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    css: "css",
    html: "html",
    md: "markdown",
    yml: "yaml",
    yaml: "yaml",
    py: "python",
    java: "java",
    go: "go",
    rs: "rust",
    sh: "shell",
  };
  return (ext && map[ext]) || DEFAULT_EDITOR_LANGUAGE;
}

function encodePathSegments(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function makeFolder(id: string, name: string): FileNode {
  return { id, name, type: "folder", children: [] };
}

export async function getProjectTree(projectId: string): Promise<FileNode[]> {
  const { data } = await api.get<ApiFileNode[]>(`/projects/${projectId}/files`);
  const root: FileNode[] = [];
  const folders = new Map<string, FileNode>();

  const ensureFolder = (path: string): FileNode => {
    const existing = folders.get(path);
    if (existing) return existing;

    const parts = path.split("/");
    const name = parts.at(-1) ?? path;
    const node = makeFolder(path, name);
    folders.set(path, node);

    const parentPath = parts.slice(0, -1).join("/");
    if (!parentPath) {
      root.push(node);
    } else {
      const parent = ensureFolder(parentPath);
      if (!parent.children) parent.children = [];
      parent.children.push(node);
    }
    return node;
  };

  for (const entry of data) {
    const normalized = entry.path.replace(/^\/+/, "");
    const parts = normalized.split("/");
    const fileName = parts.at(-1) ?? normalized;
    const parentPath = parts.slice(0, -1).join("/");
    const fileNode: FileNode = {
      id: normalized,
      name: fileName,
      type: "file",
      language: languageFromPath(fileName),
    };

    if (!parentPath) {
      root.push(fileNode);
    } else {
      const parent = ensureFolder(parentPath);
      if (!parent.children) parent.children = [];
      parent.children.push(fileNode);
    }
  }

  return root;
}

export async function getFileContent(projectId: string, path: string): Promise<string> {
  const encodedPath = encodePathSegments(path);
  const { data } = await api.get<ApiFileContent>(`/projects/${projectId}/files/${encodedPath}`);
  return data.content;
}

export async function exportProjectZip(
  projectId: string,
  options?: { paths?: string[]; asTemplate?: boolean; onProgress?: (progress: number | null) => void },
): Promise<{ filename: string; blob: Blob }> {
  const response = await api.get<Blob>(`/projects/${projectId}/files/export`, {
    responseType: "blob",
    params: {
      ...(options?.asTemplate ? { template: "true" } : {}),
      ...(options?.paths?.length ? { path: options.paths } : {}),
    },
    onDownloadProgress: (event) => {
      if (!options?.onProgress) return;
      if (!event.total) {
        options.onProgress(null);
        return;
      }
      options.onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });
  const header = response.headers["content-disposition"] as string | undefined;
  const filenameMatch = header?.match(/filename="?([^"]+)"?/i);
  const filename = filenameMatch?.[1] ?? `project-${projectId}.zip`;
  return { filename, blob: response.data };
}
