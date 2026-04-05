package com.CodeForageAI.Project.CodeForageAI.dto.health;

import java.time.Instant;

public record MetricsResponse(
        Instant timestamp,
        long totalUsers,
        long totalProjects,
        long totalChatSessions,
        long totalMessagesAllTime,
        long paymentCreateOrderSuccessCount,
        long paymentCreateOrderFailureCount,
        long paymentVerifySuccessCount,
        long paymentVerifyFailureCount,
        long paymentVerifyRateLimitedCount,
        double paymentCreateOrderFailureRatePercent,
        double paymentVerifyFailureRatePercent,
        boolean paymentHighFailureRateAlertActive,
        long paymentHighFailureRateAlertCount,
        double paymentHighFailureRateThresholdPercent,
        boolean paymentRateLimiterCircuitOpen,
        long paymentRateLimiterCircuitOpenUntilEpochSecond,
        long paymentRateLimiterConsecutiveRedisFailures,
        long paymentRateLimiterCircuitOpenCount,
        long paymentRateLimiterFallbackAllowCount,
        long paymentRateLimiterFallbackDenyCount
) {
}
