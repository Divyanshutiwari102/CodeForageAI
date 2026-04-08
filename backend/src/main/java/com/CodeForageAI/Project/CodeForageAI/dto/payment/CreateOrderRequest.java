package com.CodeForageAI.Project.CodeForageAI.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull Long planId,
        @NotNull Integer amount,   // in paise
        @NotBlank String currency  // INR
) {}