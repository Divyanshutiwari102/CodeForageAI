package com.CodeForageAI.Project.CodeForageAI.service.payment;

import org.springframework.stereotype.Component;

import java.util.concurrent.atomic.AtomicLong;

@Component
public class PaymentMetricsTracker {

    private final AtomicLong createOrderSuccessCount = new AtomicLong(0);
    private final AtomicLong createOrderFailureCount = new AtomicLong(0);
    private final AtomicLong verifySuccessCount = new AtomicLong(0);
    private final AtomicLong verifyFailureCount = new AtomicLong(0);
    private final AtomicLong verifyRateLimitedCount = new AtomicLong(0);

    public void recordCreateOrderSuccess() {
        createOrderSuccessCount.incrementAndGet();
    }

    public void recordCreateOrderFailure() {
        createOrderFailureCount.incrementAndGet();
    }

    public void recordVerifySuccess() {
        verifySuccessCount.incrementAndGet();
    }

    public void recordVerifyFailure() {
        verifyFailureCount.incrementAndGet();
    }

    public void recordVerifyRateLimited() {
        verifyRateLimitedCount.incrementAndGet();
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
}
