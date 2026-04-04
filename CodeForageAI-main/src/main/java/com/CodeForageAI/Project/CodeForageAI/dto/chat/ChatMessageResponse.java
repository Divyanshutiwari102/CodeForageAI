package com.CodeForageAI.Project.CodeForageAI.dto.chat;

import com.CodeForageAI.Project.CodeForageAI.enums.MessageRole;

import java.time.Instant;

public record ChatMessageResponse(
        Long id,
        String content,
        MessageRole role,
        Instant createdAt
) {
}
