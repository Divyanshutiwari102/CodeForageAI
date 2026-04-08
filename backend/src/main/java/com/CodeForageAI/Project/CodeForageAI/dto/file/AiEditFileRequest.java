package com.CodeForageAI.Project.CodeForageAI.dto.file;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AiEditFileRequest(
        @NotNull Long projectId,
        @NotBlank String path,
        @NotBlank String instruction
) {
}
