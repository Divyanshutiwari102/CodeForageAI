package com.CodeForageAI.Project.CodeForageAI.dto.audit;

import java.time.Instant;

public record AuditLogResponse(
        Long id,
        Long userId,
        String action,
        String path,
        String method,
        Integer statusCode,
        String detail,
        String traceId,
        Instant createdAt
) {
}
