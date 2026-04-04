package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PortalResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.SubscriptionResponse;
import com.CodeForageAI.Project.CodeForageAI.service.SubscriptionService;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionServiceImpl implements SubscriptionService {
    @Override
    public SubscriptionResponse getCurrentSubscription(Long userId) {
        return null;
    }

    @Override
    public CheckoutResponse createCheckoutSessionUrl(CheckoutRequest request, Long userId) {
        return null;
    }

    @Override
    public PortalResponse openCustomerPortal(Long userId) {
        return null;
    }
}
