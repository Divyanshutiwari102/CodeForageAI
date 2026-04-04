package com.CodeForageAI.Project.CodeForageAI.dto.chat;

import java.time.Instant;

public record ChatSessionResponse(
        Long id,
        String title,
        Long projectId,
        Instant createdAt,
        Instant updatedAt
) {
}
