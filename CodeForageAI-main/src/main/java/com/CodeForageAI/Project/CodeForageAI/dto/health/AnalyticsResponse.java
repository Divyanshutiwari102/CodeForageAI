package com.CodeForageAI.Project.CodeForageAI.dto.health;

import java.time.Instant;

public record AnalyticsResponse(
        Instant timestamp,
        long projectCreatedCount,
        long chatUsageCount,
        long previewUsageCount
) {
}
