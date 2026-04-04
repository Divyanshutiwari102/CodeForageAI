package com.CodeForageAI.Project.CodeForageAI.dto.preview;

import com.CodeForageAI.Project.CodeForageAI.enums.PreviewStatus;

import java.time.Instant;

public record PreviewStatusResponse(
        Long previewId,
        PreviewStatus status,
        String previewUrl,
        String message,
        Instant createdAt
) {}
