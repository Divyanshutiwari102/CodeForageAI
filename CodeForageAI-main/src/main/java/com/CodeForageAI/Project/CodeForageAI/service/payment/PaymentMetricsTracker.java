package com.CodeForageAI.Project.CodeForageAI.service.payment;

import com.CodeForageAI.Project.CodeForageAI.dto.alert.AlertNotification;
import com.CodeForageAI.Project.CodeForageAI.dto.alert.AlertSeverity;
import com.CodeForageAI.Project.CodeForageAI.service.notification.AlertNotificationService;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@Component
public class PaymentMetricsTracker {

    private final AtomicLong createOrderSuccessCount = new AtomicLong(0);
    private final AtomicLong createOrderFailureCount = new AtomicLong(0);
    private final AtomicLong verifySuccessCount = new AtomicLong(0);
    private final AtomicLong verifyFailureCount = new AtomicLong(0);
    private final AtomicLong verifyRateLimitedCount = new AtomicLong(0);

    private final AtomicLong highFailureRateAlertCount = new AtomicLong(0);
    private volatile boolean highFailureRateAlertActive = false;

    private final double alertFailureRateThresholdPercent;
    private final long alertMinimumEvents;
    private final AlertNotificationService alertNotificationService;

    public PaymentMetricsTracker(
            @Value("${payment.monitoring.failure-rate-alert-threshold-percent:30}") double alertFailureRateThresholdPercent,
            @Value("${payment.monitoring.failure-rate-alert-min-events:20}") long alertMinimumEvents,
            AlertNotificationService alertNotificationService
    ) {
        this.alertFailureRateThresholdPercent = Math.max(1.0d, alertFailureRateThresholdPercent);
        this.alertMinimumEvents = Math.max(1L, alertMinimumEvents);
        this.alertNotificationService = alertNotificationService;
    }

    public void recordCreateOrderSuccess() {
        createOrderSuccessCount.incrementAndGet();
        evaluateHighFailureRateAlert();
    }

    public void recordCreateOrderFailure() {
        createOrderFailureCount.incrementAndGet();
        evaluateHighFailureRateAlert();
    }

    public void recordVerifySuccess() {
        verifySuccessCount.incrementAndGet();
        evaluateHighFailureRateAlert();
    }

    public void recordVerifyFailure() {
        verifyFailureCount.incrementAndGet();
        evaluateHighFailureRateAlert();
    }

    public void recordVerifyRateLimited() {
        verifyRateLimitedCount.incrementAndGet();
        evaluateHighFailureRateAlert();
    }

    public long createOrderSuccessCount() {
        return createOrderSuccessCount.get();
    }

    public long createOrderFailureCount() {
        return createOrderFailureCount.get();
    }

    public long verifySuccessCount() {
        return verifySuccessCount.get();
    }

    public long verifyFailureCount() {
        return verifyFailureCount.get();
    }

    public long verifyRateLimitedCount() {
        return verifyRateLimitedCount.get();
    }

    public double createOrderFailureRatePercent() {
        long success = createOrderSuccessCount.get();
        long failure = createOrderFailureCount.get();
        long total = success + failure;
        if (total <= 0) return 0.0d;
        return (failure * 100.0d) / total;
    }

    public double verifyFailureRatePercent() {
        long success = verifySuccessCount.get();
        long failure = verifyFailureCount.get();
        long total = success + failure;
        if (total <= 0) return 0.0d;
        return (failure * 100.0d) / total;
    }

    public boolean highFailureRateAlertActive() {
        return highFailureRateAlertActive;
    }

    public long highFailureRateAlertCount() {
        return highFailureRateAlertCount.get();
    }

    public double highFailureRateThresholdPercent() {
        return alertFailureRateThresholdPercent;
    }

    private void evaluateHighFailureRateAlert() {
        long createTotal = createOrderSuccessCount.get() + createOrderFailureCount.get();
        long verifyTotal = verifySuccessCount.get() + verifyFailureCount.get();
        long totalEvents = createTotal + verifyTotal;

        boolean thresholdMet = totalEvents >= alertMinimumEvents &&
                (createOrderFailureRatePercent() >= alertFailureRateThresholdPercent
                        || verifyFailureRatePercent() >= alertFailureRateThresholdPercent);

        if (thresholdMet && !highFailureRateAlertActive) {
            highFailureRateAlertActive = true;
            long count = highFailureRateAlertCount.incrementAndGet();
            alertNotificationService.notify(new AlertNotification(
                    "High payment failure rate activated",
                    "createRate=" + createOrderFailureRatePercent() + "% verifyRate=" + verifyFailureRatePercent()
                            + "% threshold=" + alertFailureRateThresholdPercent + "% minEvents=" + alertMinimumEvents,
                    AlertSeverity.CRITICAL,
                    Instant.now()
            ));
            log.warn("High payment failure rate alert activated count={} createRate={} verifyRate={} threshold={} minEvents={}",
                    count, createOrderFailureRatePercent(), verifyFailureRatePercent(),
                    alertFailureRateThresholdPercent, alertMinimumEvents);
            return;
        }

        if (!thresholdMet && highFailureRateAlertActive) {
            highFailureRateAlertActive = false;
            alertNotificationService.notify(new AlertNotification(
                    "High payment failure rate cleared",
                    "createRate=" + createOrderFailureRatePercent() + "% verifyRate=" + verifyFailureRatePercent()
                            + "% threshold=" + alertFailureRateThresholdPercent + "%",
                    AlertSeverity.INFO,
                    Instant.now()
            ));
            log.info("High payment failure rate alert cleared createRate={} verifyRate={} threshold={}",
                    createOrderFailureRatePercent(), verifyFailureRatePercent(), alertFailureRateThresholdPercent);
        }
    }
}
