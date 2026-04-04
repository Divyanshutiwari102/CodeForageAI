package com.CodeForageAI.Project.CodeForageAI.dto.member;

import com.CodeForageAI.Project.CodeForageAI.enums.ProjectRole;
import jakarta.validation.constraints.NotNull;

public record UpdateMemberRoleRequest(
        @NotNull ProjectRole role) {
}
