import type { ChatMessage } from "@/types";

export async function seedChat(): Promise<ChatMessage[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [
    {
      id: "a1",
      role: "assistant",
      content: "I analyzed your layout. Want me to optimize spacing and generate responsive breakpoints?",
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function sendMessage(content: string): Promise<ChatMessage> {
  await new Promise((r) => setTimeout(r, 350));
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: `Got it — I can help with: ${content.slice(0, 80)}${content.length > 80 ? "..." : ""}`,
    createdAt: new Date().toISOString(),
  };
}
