package com.CodeForageAI.Project.CodeForageAI.dto.project;

import com.CodeForageAI.Project.CodeForageAI.dto.auth.UserProfileResponse;

import java.time.Instant;

public record ProjectResponse(
        Long id,
        String name,
        Instant createdAt,
        Instant updatedAt,
        UserProfileResponse owner
) {
}
