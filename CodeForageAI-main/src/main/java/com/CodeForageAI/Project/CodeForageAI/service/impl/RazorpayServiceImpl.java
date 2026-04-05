package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.VerifyPaymentRequest;
import com.CodeForageAI.Project.CodeForageAI.entity.PaymentTransaction;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.entity.Subscription;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.enums.PaymentTransactionStatus;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.PaymentTransactionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.PlanRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.SubscriptionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.RazorpayService;
import com.CodeForageAI.Project.CodeForageAI.service.payment.PaymentMetricsTracker;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {
    private static final String PAYMENT_AUDIT = "PAYMENT_AUDIT";

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentMetricsTracker paymentMetricsTracker;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${payment.pricing.pro-amount-paise}")
    private int proAmountPaise;

    private RazorpayClient client() throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    @Override
    @Transactional
    public CreateOrderResponse createOrder(Long userId, CreateOrderRequest request) {
        String correlationId = newCorrelationId();
        try {
            Plan plan = planRepository.findById(request.planId())
                    .orElseThrow(() -> new ResourceNotFoundException("Plan", request.planId().toString()));
            int serverAmount = resolveAmountInPaise(plan);
            log.info("{} event=create_order status=started correlationId={} userId={} currency={}",
                    PAYMENT_AUDIT, correlationId, userId, request.currency());
            JSONObject options = new JSONObject();
            options.put("amount", serverAmount);
            options.put("currency", request.currency());
            options.put("receipt", "rcpt_user_" + userId + "_" + System.currentTimeMillis());

            Order order = client().orders.create(options);
            log.info("{} event=create_order status=success correlationId={} userId={} orderId={} currency={}",
                    PAYMENT_AUDIT, correlationId, userId, maskId(order.get("id").toString()), request.currency());
            paymentMetricsTracker.recordCreateOrderSuccess();
            return new CreateOrderResponse(order.get("id"), serverAmount, request.currency(), keyId);
        } catch (Exception e) {
            log.error("{} event=create_order status=failure correlationId={} userId={} currency={} error={}",
                    PAYMENT_AUDIT, correlationId, userId, request.currency(), e.getMessage(), e);
            paymentMetricsTracker.recordCreateOrderFailure();
            throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void verifyAndActivate(Long userId, VerifyPaymentRequest request) {
        String correlationId = newCorrelationId();
        String orderId = request.razorpay_order_id();
        String paymentId = request.razorpay_payment_id();
        String signature = request.razorpay_signature();
        Long planId = request.planId();
        try {
            log.info("{} event=verify_payment status=started correlationId={} userId={} planId={} orderId={} paymentId={}",
                    PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId));

            boolean valid = verifySignature(orderId, paymentId, signature);
            if (!valid) {
                log.warn("{} event=verify_signature status=failure correlationId={} userId={} planId={} orderId={} paymentId={} reason=invalid_signature",
                        PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId));
                throw new BadRequestException("Invalid Razorpay signature");
            }
            log.info("{} event=verify_signature status=success correlationId={} userId={} planId={} orderId={} paymentId={}",
                    PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
            Plan plan = planRepository.findById(planId)
                    .orElseThrow(() -> new ResourceNotFoundException("Plan", planId.toString()));

            paymentTransactionRepository.saveAndFlush(PaymentTransaction.builder()
                    .user(user)
                    .plan(plan)
                    .paymentProvider("RAZORPAY")
                    .providerOrderId(orderId)
                    .providerPaymentId(paymentId)
                    .providerSignature(signature)
                    .status(PaymentTransactionStatus.SUCCESS)
                    .build());
            log.info("{} event=payment_transaction status=persisted correlationId={} userId={} planId={} orderId={} paymentId={}",
                    PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId));

            subscriptionRepository.findActiveByUserId(userId).ifPresent(s -> {
                s.setStatus(SubscriptionStatus.CANCELED);
                subscriptionRepository.save(s);
                log.info("{} event=subscription_transition status=canceled_previous correlationId={} userId={} subscriptionId={}",
                        PAYMENT_AUDIT, correlationId, userId, s.getId());
            });

            Subscription sub = Subscription.builder()
                    .user(user)
                    .plan(plan)
                    .status(SubscriptionStatus.ACTIVE)
                    .paymentProvider("RAZORPAY")
                    .providerSubscriptionId(paymentId)
                    .providerCustomerId(null)
                    .currentPeriodStart(Instant.now())
                    .currentPeriodEnd(Instant.now().plusSeconds(30L * 24 * 60 * 60))
                    .build();

            subscriptionRepository.save(sub);
            user.setPlan(plan);
            userRepository.save(user);
            log.info("{} event=verify_payment status=success correlationId={} userId={} planId={} orderId={} paymentId={} subscriptionId={}",
                    PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId), sub.getId());
            paymentMetricsTracker.recordVerifySuccess();

        } catch (DataIntegrityViolationException e) {
            if (isDuplicatePaymentIdViolation(e)) {
                // Idempotent at DB level: unique payment_id already persisted by concurrent request.
                syncUserPlanSafely(userId, planId);
                log.info("{} event=verify_payment status=idempotent_duplicate correlationId={} userId={} planId={} orderId={} paymentId={}",
                        PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId));
                paymentMetricsTracker.recordVerifySuccess();
                return;
            }
            log.error("{} event=verify_payment status=failure correlationId={} userId={} planId={} orderId={} paymentId={} reason=integrity_error error={}",
                    PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId), e.getMessage(), e);
            paymentMetricsTracker.recordVerifyFailure();
            throw new BadRequestException("Payment verification failed: " + e.getMessage());

        } catch (BadRequestException e) {
            log.warn("{} event=verify_payment status=failure correlationId={} userId={} planId={} orderId={} paymentId={} reason=bad_request error={}",
                    PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId), e.getMessage());
            paymentMetricsTracker.recordVerifyFailure();
            throw e;
        } catch (Exception e) {
            log.error("{} event=verify_payment status=failure correlationId={} userId={} planId={} orderId={} paymentId={} reason=unexpected_exception error={}",
                    PAYMENT_AUDIT, correlationId, userId, planId, maskId(orderId), maskId(paymentId), e.getMessage(), e);
            paymentMetricsTracker.recordVerifyFailure();
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String receivedSignature)
            throws NoSuchAlgorithmException, InvalidKeyException {
        String payload = orderId + "|" + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String expected = toHex(digest);
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.UTF_8),
                receivedSignature.getBytes(StandardCharsets.UTF_8)
        );
    }

    private String toHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private boolean isDuplicatePaymentIdViolation(DataIntegrityViolationException e) {
        String message = e.getMessage();
        String lowerMessage = StringUtils.hasText(message) ? message.toLowerCase() : null;
        return StringUtils.hasText(lowerMessage)
                && lowerMessage.contains("provider_payment_id")
                && (lowerMessage.contains("duplicate") || lowerMessage.contains("unique"));
    }

    private String newCorrelationId() {
        return UUID.randomUUID().toString();
    }

    private int resolveAmountInPaise(Plan plan) {
        if (plan.getName() == PlanType.FREE) {
            return 0;
        }
        if (plan.getName() == PlanType.PRO) {
            return proAmountPaise;
        }
        throw new BadRequestException("Unsupported plan for payment");
    }

    private String maskId(String value) {
        if (!StringUtils.hasText(value)) return "[empty]";
        String trimmed = value.trim();
        int len = trimmed.length();
        if (len <= 6) return "***";
        return trimmed.substring(0, 3) + "***" + trimmed.substring(len - 3);
    }

    private void syncUserPlanSafely(Long userId, Long planId) {
        if (planId == null) {
            return;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }
        Plan plan = planRepository.findById(planId).orElse(null);
        if (plan == null) {
            return;
        }
        user.setPlan(plan);
        userRepository.save(user);
    }
}
