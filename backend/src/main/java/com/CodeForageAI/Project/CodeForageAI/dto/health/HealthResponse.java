package com.CodeForageAI.Project.CodeForageAI.dto.health;

import java.time.Instant;
import java.util.List;

public record HealthResponse(
        String status,
        Instant timestamp,
        List<ServiceStatus> services
) {
    public static HealthResponse of(List<ServiceStatus> services) {
        boolean allUp = services.stream().allMatch(s -> "UP".equals(s.status()));
        return new HealthResponse(allUp ? "UP" : "DEGRADED", Instant.now(), services);
    }
}
