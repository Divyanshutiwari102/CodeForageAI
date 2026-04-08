package com.CodeForageAI.Project.CodeForageAI.dto.alert;

import java.time.Instant;

public record AlertNotification(
        String title,
        String message,
        AlertSeverity severity,
        Instant timestamp
) {
}
