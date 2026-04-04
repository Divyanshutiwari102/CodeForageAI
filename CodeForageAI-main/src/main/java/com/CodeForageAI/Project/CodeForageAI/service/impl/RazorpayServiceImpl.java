package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.VerifyPaymentRequest;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.entity.Subscription;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.PlanRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.SubscriptionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    private RazorpayClient client() throws Exception {
        return new RazorpayClient(keyId, keySecret);
    }

    @Override
    public CreateOrderResponse createOrder(Long userId, CreateOrderRequest request) {
        try {
            JSONObject options = new JSONObject();
            options.put("amount", request.amount());
            options.put("currency", request.currency());
            options.put("receipt", "rcpt_user_" + userId + "_" + System.currentTimeMillis());

            Order order = client().orders.create(options);
            return new CreateOrderResponse(order.get("id"), request.amount(), request.currency(), keyId);
        } catch (Exception e) {
            throw new BadRequestException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void verifyAndActivate(Long userId, VerifyPaymentRequest request) {
        try {
            JSONObject payload = new JSONObject();
            payload.put("razorpay_order_id", request.razorpayOrderId());
            payload.put("razorpay_payment_id", request.razorpayPaymentId());
            payload.put("razorpay_signature", request.razorpaySignature());

            boolean valid = Utils.verifyPaymentSignature(payload, keySecret);
            if (!valid) throw new BadRequestException("Invalid Razorpay signature");

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
            Plan plan = planRepository.findById(request.planId())
                    .orElseThrow(() -> new ResourceNotFoundException("Plan", request.planId().toString()));

            subscriptionRepository.findActiveByUserId(userId).ifPresent(s -> {
                s.setStatus(SubscriptionStatus.CANCELED);
                subscriptionRepository.save(s);
            });

            Subscription sub = Subscription.builder()
                    .user(user)
                    .plan(plan)
                    .status(SubscriptionStatus.ACTIVE)
                    .paymentProvider("RAZORPAY")
                    .providerSubscriptionId(request.razorpayPaymentId())
                    .providerCustomerId(null)
                    .currentPeriodStart(Instant.now())
                    .currentPeriodEnd(Instant.now().plusSeconds(30L * 24 * 60 * 60))
                    .build();

            subscriptionRepository.save(sub);

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Payment verification failed: " + e.getMessage());
        }
    }
}