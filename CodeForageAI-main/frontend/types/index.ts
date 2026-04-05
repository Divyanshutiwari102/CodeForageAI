export type ID = string;

export interface User {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: "free" | "pro";
}

export interface Project {
  id: ID;
  name: string;
  framework: string;
  status: "active" | "draft" | "archived";
  updatedAt: string;
  stars: number;
  description: string;
}

export interface Stats {
  label: string;
  value: string;
  delta: string;
}

export interface FileNode {
  id: ID;
  name: string;
  type: "file" | "folder";
  language?: string;
  content?: string;
  children?: FileNode[];
}

export interface EditorTab {
  id: ID;
  fileId: ID;
  title: string;
  language: string;
  content: string;
}

export interface ChatMessage {
  id: ID;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  isStreaming?: boolean;
}
