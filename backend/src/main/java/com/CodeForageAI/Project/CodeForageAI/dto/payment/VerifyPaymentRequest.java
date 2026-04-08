package com.CodeForageAI.Project.CodeForageAI.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VerifyPaymentRequest(
        @NotNull Long planId,
        @NotBlank String razorpay_order_id,
        @NotBlank String razorpay_payment_id,
        @NotBlank String razorpay_signature
) {}
