package com.CodeForageAI.Project.CodeForageAI.service.payment;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Collections;

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

    public PaymentVerificationRateLimiter(
            StringRedisTemplate redisTemplate,
            @Value("${payment.rate-limit.verify-max-requests:10}") int maxRequestsPerWindow,
            @Value("${payment.rate-limit.verify-window-seconds:60}") long windowSeconds,
            @Value("${payment.rate-limit.fail-open-on-redis-error:true}") boolean failOpenOnRedisError
    ) {
        this.redisTemplate = redisTemplate;
        this.maxRequestsPerWindow = Math.max(1, maxRequestsPerWindow);
        this.windowSeconds = Math.max(1, windowSeconds);
        this.failOpenOnRedisError = failOpenOnRedisError;
    }

    public boolean allow(Long userId) {
        if (userId == null) return false;
        long now = Instant.now().getEpochSecond();
        long windowStart = now - (now % windowSeconds);
        String key = "payment:verify:ratelimit:user:" + userId + ":window:" + windowStart;
        try {
            Long result = redisTemplate.execute(
                    RATE_LIMIT_SCRIPT,
                    Collections.singletonList(key),
                    String.valueOf(windowSeconds),
                    String.valueOf(maxRequestsPerWindow)
            );
            return Long.valueOf(1L).equals(result);
        } catch (Exception ex) {
            log.error("Redis rate limiter failure for userId={} key={} error={}", userId, key, ex.getMessage(), ex);
            if (failOpenOnRedisError) {
                return true;
            }
            return false;
        }
    }
}
