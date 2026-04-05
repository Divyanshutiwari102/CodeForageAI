import type { ChatMessage, EditorTab } from "@/types";

export function selectTabs(openTabIds: string[], tabsByFileId: Record<string, EditorTab>): EditorTab[] {
  return openTabIds.map((id) => tabsByFileId[id]).filter((tab): tab is EditorTab => Boolean(tab));
}

export function selectMessages(
  messageIds: string[],
  messagesById: Record<string, ChatMessage>,
): ChatMessage[] {
  return messageIds.map((id) => messagesById[id]).filter((message): message is ChatMessage => Boolean(message));
}
