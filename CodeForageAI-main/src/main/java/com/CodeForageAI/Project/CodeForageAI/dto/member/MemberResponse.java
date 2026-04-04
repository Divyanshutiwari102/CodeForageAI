package com.CodeForageAI.Project.CodeForageAI.dto.member;

import com.CodeForageAI.Project.CodeForageAI.enums.ProjectRole;

import java.time.Instant;

public record MemberResponse(
        Long userId,
        String username,
        String name,
        ProjectRole projectRole,
        Instant invitedAt
) {
}
