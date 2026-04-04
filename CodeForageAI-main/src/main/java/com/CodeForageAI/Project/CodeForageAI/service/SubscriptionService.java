package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PortalResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.SubscriptionResponse;

public interface SubscriptionService {
    SubscriptionResponse getCurrentSubscription(Long userId);

    CheckoutResponse createCheckoutSessionUrl(CheckoutRequest request, Long userId);

    PortalResponse openCustomerPortal(Long userId);
}
