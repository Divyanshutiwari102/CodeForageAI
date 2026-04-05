package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.config.MinioConfig;
import com.CodeForageAI.Project.CodeForageAI.config.QdrantConfig;
import com.CodeForageAI.Project.CodeForageAI.dto.health.HealthResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.health.LiveMetricsResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.health.MetricsResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.health.ServiceStatus;
import com.CodeForageAI.Project.CodeForageAI.repository.ChatMessageRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ChatSessionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.payment.PaymentMetricsTracker;
import com.CodeForageAI.Project.CodeForageAI.service.payment.PaymentVerificationRateLimiter;
import io.minio.BucketExistsArgs;
import io.minio.MinioClient;
import io.qdrant.client.QdrantClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import javax.sql.DataSource;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final DataSource dataSource;
    private final MinioClient minioClient;
    private final MinioConfig minioConfig;
    private final QdrantClient qdrantClient;
    private final QdrantConfig qdrantConfig;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final PaymentMetricsTracker paymentMetricsTracker;
    private final PaymentVerificationRateLimiter paymentVerificationRateLimiter;

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> health() {
        List<ServiceStatus> statuses = new ArrayList<>();
        statuses.add(checkDatabase());
        statuses.add(checkMinio());
        statuses.add(checkQdrant());

        HealthResponse response = HealthResponse.of(statuses);
        log.info("Health check: status={}", response.status());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/metrics")
    public ResponseEntity<MetricsResponse> metrics() {
        long totalUsers = userRepository.count();
        long totalProjects = projectRepository.count();
        long totalChatSessions = chatSessionRepository.count();
        long totalMessages = chatMessageRepository.count();

        MetricsResponse response = new MetricsResponse(
                Instant.now(), totalUsers, totalProjects, totalChatSessions, totalMessages,
                paymentMetricsTracker.createOrderSuccessCount(),
                paymentMetricsTracker.createOrderFailureCount(),
                paymentMetricsTracker.verifySuccessCount(),
                paymentMetricsTracker.verifyFailureCount(),
                paymentMetricsTracker.verifyRateLimitedCount(),
                paymentMetricsTracker.createOrderFailureRatePercent(),
                paymentMetricsTracker.verifyFailureRatePercent(),
                paymentMetricsTracker.highFailureRateAlertActive(),
                paymentMetricsTracker.highFailureRateAlertCount(),
                paymentMetricsTracker.highFailureRateThresholdPercent(),
                paymentVerificationRateLimiter.circuitOpen(),
                paymentVerificationRateLimiter.circuitOpenUntilEpochSecond(),
                paymentVerificationRateLimiter.consecutiveRedisFailures(),
                paymentVerificationRateLimiter.circuitOpenCount(),
                paymentVerificationRateLimiter.fallbackAllowCount(),
                paymentVerificationRateLimiter.fallbackDenyCount());
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/metrics/stream")
    public SseEmitter metricsStream() {
        SseEmitter emitter = new SseEmitter(0L);
        Thread streamThread = new Thread(() -> {
            try {
                while (!Thread.currentThread().isInterrupted()) {
                    LiveMetricsResponse snapshot = new LiveMetricsResponse(
                            Instant.now(),
                            paymentMetricsTracker.createOrderFailureRatePercent(),
                            paymentMetricsTracker.verifyFailureRatePercent(),
                            paymentMetricsTracker.highFailureRateAlertActive(),
                            paymentMetricsTracker.highFailureRateAlertCount()
                    );
                    emitter.send(SseEmitter.event().name("metrics").data(snapshot));
                    Thread.sleep(5000);
                }
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        }, "metrics-stream-thread");
        streamThread.setDaemon(true);
        emitter.onCompletion(streamThread::interrupt);
        emitter.onTimeout(streamThread::interrupt);
        streamThread.start();
        return emitter;
    }

    private ServiceStatus checkDatabase() {
        try (var conn = dataSource.getConnection()) {
            if (!conn.isValid(2)) {
                return ServiceStatus.down("database", "Connection validation failed");
            }
            return ServiceStatus.up("database");
        } catch (Exception e) {
            log.warn("Database health check failed: {}", e.getMessage());
            return ServiceStatus.down("database", e.getMessage());
        }
    }

    private ServiceStatus checkMinio() {
        try {
            minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioConfig.getBucket()).build());
            return ServiceStatus.up("minio");
        } catch (Exception e) {
            log.warn("MinIO health check failed: {}", e.getMessage());
            return ServiceStatus.down("minio", e.getMessage());
        }
    }

    private ServiceStatus checkQdrant() {
        try {
            qdrantClient.collectionExistsAsync(qdrantConfig.getCollectionName()).get();
            return ServiceStatus.up("qdrant");
        } catch (Exception e) {
            log.warn("Qdrant health check failed: {}", e.getMessage());
            return ServiceStatus.down("qdrant", e.getMessage());
        }
    }
}
