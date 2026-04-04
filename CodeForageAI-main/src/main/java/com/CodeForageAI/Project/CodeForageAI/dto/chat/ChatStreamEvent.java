package com.CodeForageAI.Project.CodeForageAI.dto.chat;

public record ChatStreamEvent(
        String type,
        String content
) {

    public static ChatStreamEvent token(String content) {
        return new ChatStreamEvent("token", content);
    }

    public static ChatStreamEvent fileSaved(String path) {
        return new ChatStreamEvent("file_saved", path);
    }

    public static ChatStreamEvent done() {
        return new ChatStreamEvent("done", null);
    }

    public static ChatStreamEvent error(String message) {
        return new ChatStreamEvent("error", message);
    }
}
