package com.CodeForageAI.Project.CodeForageAI.dto.preview;

import com.CodeForageAI.Project.CodeForageAI.enums.PreviewStatus;

public record PreviewResponse(
        Long previewId,
        String previewUrl,
        PreviewStatus status
) {}
