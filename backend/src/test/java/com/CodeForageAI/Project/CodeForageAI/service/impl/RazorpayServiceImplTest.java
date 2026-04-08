package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.payment.VerifyPaymentRequest;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.entity.Subscription;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.repository.PaymentTransactionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.PlanRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.SubscriptionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.payment.PaymentMetricsTracker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RazorpayServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PlanRepository planRepository;
    @Mock
    private SubscriptionRepository subscriptionRepository;
    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;
    @Mock
    private PaymentMetricsTracker paymentMetricsTracker;

    @InjectMocks
    private RazorpayServiceImpl razorpayService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(razorpayService, "keySecret", "test_secret_1234567890");
        ReflectionTestUtils.setField(razorpayService, "keyId", "test_key");
        ReflectionTestUtils.setField(razorpayService, "proAmountPaise", 12345);
    }

    @Test
    void verifyAndActivate_throwsOnInvalidSignature() {
        VerifyPaymentRequest request = new VerifyPaymentRequest(
                10L,
                "order_abc123",
                "pay_abc123",
                "invalid_signature"
        );

        assertThrows(BadRequestException.class, () -> razorpayService.verifyAndActivate(1L, request));
        verify(paymentMetricsTracker).recordVerifyFailure();
        verify(paymentTransactionRepository, never()).saveAndFlush(any());
    }

    @Test
    void verifyAndActivate_persistsTransactionAndActivatesSubscription() throws Exception {
        Long userId = 7L;
        Long planId = 2L;
        String orderId = "order_12345";
        String paymentId = "pay_98765";
        String signature = sign(orderId + "|" + paymentId, "test_secret_1234567890");

        VerifyPaymentRequest request = new VerifyPaymentRequest(planId, orderId, paymentId, signature);

        User user = User.builder().id(userId).username("u7").build();
        Plan plan = Plan.builder().id(planId).name(PlanType.PRO).build();
        Subscription activeSub = Subscription.builder()
                .id(99L)
                .user(user)
                .plan(plan)
                .status(SubscriptionStatus.ACTIVE)
                .currentPeriodStart(Instant.now())
                .currentPeriodEnd(Instant.now().plusSeconds(3600))
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(planRepository.findById(planId)).thenReturn(Optional.of(plan));
        when(subscriptionRepository.findActiveByUserId(userId)).thenReturn(Optional.of(activeSub));

        razorpayService.verifyAndActivate(userId, request);

        ArgumentCaptor<Subscription> subscriptionCaptor = ArgumentCaptor.forClass(Subscription.class);
        verify(subscriptionRepository).save(subscriptionCaptor.capture());
        verify(paymentTransactionRepository).saveAndFlush(any());
        verify(userRepository).save(user);
        verify(paymentMetricsTracker).recordVerifySuccess();
        assertEquals(planId, user.getPlan().getId());
    }

    private String sign(String payload, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(digest.length * 2);
        for (byte b : digest) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    @Test
    void resolveAmountInPaise_usesConfiguredProAmount() {
        Plan proPlan = Plan.builder().id(1L).name(PlanType.PRO).build();

        Integer amount = ReflectionTestUtils.invokeMethod(razorpayService, "resolveAmountInPaise", proPlan);

        assertEquals(12345, amount);
    }
}
