package com.CodeForageAI.Project.CodeForageAI.service.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class UploadRateLimiter {
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

    public UploadRateLimiter(
            StringRedisTemplate redisTemplate,
            @Value("${upload.rate-limit.max-requests:30}") int maxRequestsPerWindow,
            @Value("${upload.rate-limit.window-seconds:60}") long windowSeconds
    ) {
        this.redisTemplate = redisTemplate;
        this.maxRequestsPerWindow = Math.max(1, maxRequestsPerWindow);
        this.windowSeconds = Math.max(1, windowSeconds);
    }

    public boolean allow(Long userId) {
        if (userId == null) return false;
        long nowEpochSecond = System.currentTimeMillis() / 1000L;
        long windowStart = nowEpochSecond - (nowEpochSecond % windowSeconds);
        String key = "upload:ratelimit:user:" + userId + ":window:" + windowStart;
        Long result = redisTemplate.execute(
                RATE_LIMIT_SCRIPT,
                Collections.singletonList(key),
                String.valueOf(windowSeconds),
                String.valueOf(maxRequestsPerWindow)
        );
        return result != null && result == 1L;
    }
}
