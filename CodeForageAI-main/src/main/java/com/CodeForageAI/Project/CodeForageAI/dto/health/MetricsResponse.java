package com.CodeForageAI.Project.CodeForageAI.dto.health;

import java.time.Instant;

public record MetricsResponse(
        Instant timestamp,
        long totalUsers,
        long totalProjects,
        long totalChatSessions,
        long totalMessagesAllTime
) {
}
