package com.CodeForageAI.Project.CodeForageAI.service.payment;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PaymentVerificationRateLimiter {

    private static final int MAX_REQUESTS_PER_WINDOW = 10;
    private static final long WINDOW_SECONDS = 60;

    private final ConcurrentHashMap<Long, UserRateWindow> windows = new ConcurrentHashMap<>();

    public boolean allow(Long userId) {
        if (userId == null) return false;
        long now = Instant.now().getEpochSecond();
        UserRateWindow current = windows.compute(userId, (key, existing) -> {
            if (existing == null || now >= existing.windowEndEpochSecond()) {
                return new UserRateWindow(1, now + WINDOW_SECONDS);
            }
            if (existing.count() >= MAX_REQUESTS_PER_WINDOW) {
                return existing;
            }
            return new UserRateWindow(existing.count() + 1, existing.windowEndEpochSecond());
        });
        return current.count() <= MAX_REQUESTS_PER_WINDOW;
    }

    private record UserRateWindow(int count, long windowEndEpochSecond) {
    }
}
