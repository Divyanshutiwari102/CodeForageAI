package com.CodeForageAI.Project.CodeForageAI.dto.health;

import java.time.Instant;

public record LiveMetricsResponse(
        Instant timestamp,
        double paymentCreateOrderFailureRatePercent,
        double paymentVerifyFailureRatePercent,
        boolean paymentHighFailureRateAlertActive,
        long paymentHighFailureRateAlertCount
) {
}
