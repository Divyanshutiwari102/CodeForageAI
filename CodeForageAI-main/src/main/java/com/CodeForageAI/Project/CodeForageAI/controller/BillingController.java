package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.VerifyPaymentRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PlanResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.SubscriptionResponse;
import com.CodeForageAI.Project.CodeForageAI.security.AuthUtil;
import com.CodeForageAI.Project.CodeForageAI.service.PlanService;
import com.CodeForageAI.Project.CodeForageAI.service.RazorpayService;
import com.CodeForageAI.Project.CodeForageAI.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class BillingController {

    private final PlanService planService;
    private final SubscriptionService subscriptionService;
    private final RazorpayService razorpayService;
    private final AuthUtil authUtil;

    @GetMapping("/api/plans")
    public ResponseEntity<List<PlanResponse>> getAllPlans() {
        return ResponseEntity.ok(planService.getAllActivePlans());
    }

    @GetMapping("/api/me/subscription")
    public ResponseEntity<SubscriptionResponse> getMySubscription() {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(subscriptionService.getCurrentSubscription(userId));
    }

    @PostMapping("/api/payments/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(razorpayService.createOrder(userId, request));
    }

    @PostMapping({"/api/payments/verify", "/api/payment/verify"})
    public ResponseEntity<Void> verify(@Valid @RequestBody VerifyPaymentRequest request) {
        Long userId = authUtil.getCurrentUserId();
        razorpayService.verifyAndActivate(userId, request);
        return ResponseEntity.ok().build();
    }
}
