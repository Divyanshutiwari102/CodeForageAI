package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PortalResponse;

public interface StripeService {

    CheckoutResponse createCheckoutSession(Long userId, String priceId);

    PortalResponse createPortalSession(Long userId);

    void handleWebhook(String payload, String sigHeader);
}
