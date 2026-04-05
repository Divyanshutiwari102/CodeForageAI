package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.VerifyPaymentRequest;
import com.CodeForageAI.Project.CodeForageAI.entity.PaymentTransaction;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.entity.Subscription;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.enums.PaymentTransactionStatus;
import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.PaymentTransactionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.PlanRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.SubscriptionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.RazorpayService;
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

@Service
@Slf4j
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {
    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient client() throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    @Override
    @Transactional
    public CreateOrderResponse createOrder(Long userId, CreateOrderRequest request) {
        try {
            log.info("PAYMENT_AUDIT create_order_started userId={} amount={} currency={}",
                    userId, request.amount(), request.currency());
            JSONObject options = new JSONObject();
            options.put("amount", request.amount());
            options.put("currency", request.currency());
            options.put("receipt", "rcpt_user_" + userId + "_" + System.currentTimeMillis());

            Order order = client().orders.create(options);
            log.info("PAYMENT_AUDIT create_order_success userId={} orderId={} amount={} currency={}",
                    userId, order.get("id"), request.amount(), request.currency());
            return new CreateOrderResponse(order.get("id"), request.amount(), request.currency(), keyId);
        } catch (Exception e) {
            log.error("PAYMENT_AUDIT create_order_failed userId={} amount={} currency={} error={}",
                    userId, request.amount(), request.currency(), e.getMessage(), e);
            throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void verifyAndActivate(Long userId, VerifyPaymentRequest request) {
        try {
            String orderId = request.razorpay_order_id();
            String paymentId = request.razorpay_payment_id();
            String signature = request.razorpay_signature();
            Long planId = request.planId();

            log.info("PAYMENT_AUDIT verify_started userId={} planId={} orderId={} paymentId={}",
                    userId, planId, orderId, paymentId);

            boolean valid = verifySignature(orderId, paymentId, signature);
            if (!valid) {
                log.warn("PAYMENT_AUDIT verify_failed_invalid_signature userId={} planId={} orderId={} paymentId={}",
                        userId, planId, orderId, paymentId);
                throw new BadRequestException("Invalid Razorpay signature");
            }
            log.info("PAYMENT_AUDIT verify_signature_success userId={} planId={} orderId={} paymentId={}",
                    userId, planId, orderId, paymentId);

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
            log.info("PAYMENT_AUDIT verify_transaction_persisted userId={} planId={} orderId={} paymentId={}",
                    userId, planId, orderId, paymentId);

            subscriptionRepository.findActiveByUserId(userId).ifPresent(s -> {
                s.setStatus(SubscriptionStatus.CANCELED);
                subscriptionRepository.save(s);
                log.info("PAYMENT_AUDIT verify_existing_subscription_canceled userId={} subscriptionId={}",
                        userId, s.getId());
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
            log.info("PAYMENT_AUDIT verify_completed_success userId={} planId={} orderId={} paymentId={} subscriptionId={}",
                    userId, planId, orderId, paymentId, sub.getId());

        } catch (DataIntegrityViolationException e) {
            if (isDuplicatePaymentIdViolation(e)) {
                // Idempotent at DB level: unique payment_id already persisted by concurrent request.
                log.info("PAYMENT_AUDIT verify_idempotent_duplicate userId={} planId={} orderId={} paymentId={}",
                        userId, request.planId(), request.razorpay_order_id(), request.razorpay_payment_id());
                return;
            }
            log.error("PAYMENT_AUDIT verify_failed_integrity userId={} planId={} orderId={} paymentId={} error={}",
                    userId, request.planId(), request.razorpay_order_id(), request.razorpay_payment_id(), e.getMessage(), e);
            throw new BadRequestException("Payment verification failed: " + e.getMessage());

        } catch (BadRequestException e) {
            log.warn("PAYMENT_AUDIT verify_failed_bad_request userId={} planId={} orderId={} paymentId={} error={}",
                    userId, request.planId(), request.razorpay_order_id(), request.razorpay_payment_id(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("PAYMENT_AUDIT verify_failed_exception userId={} planId={} orderId={} paymentId={} error={}",
                    userId, request.planId(), request.razorpay_order_id(), request.razorpay_payment_id(), e.getMessage(), e);
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
        return StringUtils.hasText(message)
                && message.toLowerCase().contains("provider_payment_id")
                && (message.toLowerCase().contains("duplicate") || message.toLowerCase().contains("unique"));
    }
}
