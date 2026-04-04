package com.CodeForageAI.Project.CodeForageAI.dto.payment;

public record CreateOrderResponse(
        String orderId,
        Integer amount,
        String currency,
        String key
) {}