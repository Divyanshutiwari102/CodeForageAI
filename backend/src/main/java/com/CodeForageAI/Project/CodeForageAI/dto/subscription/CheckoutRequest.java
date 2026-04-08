package com.CodeForageAI.Project.CodeForageAI.dto.subscription;

import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
        @NotBlank String priceId
) {
}

