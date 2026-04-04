package com.CodeForageAI.Project.CodeForageAI.dto.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChatStreamRequest(
        @NotNull Long sessionId,
        @NotNull Long projectId,
        @NotBlank String prompt
) {
}
