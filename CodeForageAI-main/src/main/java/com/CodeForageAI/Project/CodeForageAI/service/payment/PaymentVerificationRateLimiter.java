package com.CodeForageAI.Project.CodeForageAI.service.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
public class PaymentVerificationRateLimiter {
    private static final RedisScript<Long> RATE_LIMIT_SCRIPT = RedisScript.of(
            """
                    local current = redis.call('INCR', KEYS[1])
                    if current == 1 then
                      redis.call('EXPIRE', KEYS[1], ARGV[1])
                    end
                    if current > tonumber(ARGV[2]) then
                      return 0
                    end
                    return 1
                    """,
            Long.class
    );

    private final StringRedisTemplate redisTemplate;
    private final int maxRequestsPerWindow;
    private final long windowSeconds;
    private final boolean failOpenOnRedisError;
    private final int circuitFailureThreshold;
    private final long circuitOpenDurationSeconds;

    private final AtomicInteger consecutiveRedisFailures = new AtomicInteger(0);
    private final AtomicLong circuitOpenUntilEpochSecond = new AtomicLong(0);
    private final AtomicLong circuitOpenCount = new AtomicLong(0);
    private final AtomicLong fallbackAllowCount = new AtomicLong(0);
    private final AtomicLong fallbackDenyCount = new AtomicLong(0);

    public PaymentVerificationRateLimiter(
            StringRedisTemplate redisTemplate,
            @Value("${payment.rate-limit.verify-max-requests:10}") int maxRequestsPerWindow,
            @Value("${payment.rate-limit.verify-window-seconds:60}") long windowSeconds,
            @Value("${payment.rate-limit.fail-open-on-redis-error:true}") boolean failOpenOnRedisError,
            @Value("${payment.rate-limit.circuit-breaker.failure-threshold:5}") int circuitFailureThreshold,
            @Value("${payment.rate-limit.circuit-breaker.open-duration-seconds:30}") long circuitOpenDurationSeconds
    ) {
        this.redisTemplate = redisTemplate;
        this.maxRequestsPerWindow = Math.max(1, maxRequestsPerWindow);
        this.windowSeconds = Math.max(1, windowSeconds);
        this.failOpenOnRedisError = failOpenOnRedisError;
        this.circuitFailureThreshold = Math.max(1, circuitFailureThreshold);
        this.circuitOpenDurationSeconds = Math.max(1, circuitOpenDurationSeconds);
    }

    public boolean allow(Long userId) {
        if (userId == null) return false;
        long now = Instant.now().getEpochSecond();
        if (isCircuitOpen(now)) {
            return fallbackDecision();
        }
        long windowStart = now - (now % windowSeconds);
        String key = "payment:verify:ratelimit:user:" + userId + ":window:" + windowStart;
        try {
            Long result = redisTemplate.execute(
                    RATE_LIMIT_SCRIPT,
                    Collections.singletonList(key),
                    String.valueOf(windowSeconds),
                    String.valueOf(maxRequestsPerWindow)
            );
            consecutiveRedisFailures.set(0);
            return Long.valueOf(1L).equals(result);
        } catch (Exception ex) {
            int failures = consecutiveRedisFailures.incrementAndGet();
            if (failures >= circuitFailureThreshold) {
                openCircuit(now);
            }
            log.error("Redis rate limiter failure for userId={} key={} error={}", userId, key, ex.getMessage(), ex);
            return fallbackDecision();
        }
    }

    public long circuitOpenUntilEpochSecond() {
        return circuitOpenUntilEpochSecond.get();
    }

    public boolean circuitOpen() {
        return isCircuitOpen(Instant.now().getEpochSecond());
    }

    public long consecutiveRedisFailures() {
        return consecutiveRedisFailures.get();
    }

    public long circuitOpenCount() {
        return circuitOpenCount.get();
    }

    public long fallbackAllowCount() {
        return fallbackAllowCount.get();
    }

    public long fallbackDenyCount() {
        return fallbackDenyCount.get();
    }

    private boolean fallbackDecision() {
        if (failOpenOnRedisError) {
            fallbackAllowCount.incrementAndGet();
            return true;
        }
        fallbackDenyCount.incrementAndGet();
        return false;
    }

    private boolean isCircuitOpen(long nowEpochSecond) {
        return nowEpochSecond < circuitOpenUntilEpochSecond.get();
    }

    private void openCircuit(long nowEpochSecond) {
        long openUntil = nowEpochSecond + circuitOpenDurationSeconds;
        long prev = circuitOpenUntilEpochSecond.getAndUpdate(current -> Math.max(current, openUntil));
        if (openUntil > prev) {
            circuitOpenCount.incrementAndGet();
            log.warn("Opened Redis rate-limiter circuit breaker until {}", openUntil);
        }
    }
}
