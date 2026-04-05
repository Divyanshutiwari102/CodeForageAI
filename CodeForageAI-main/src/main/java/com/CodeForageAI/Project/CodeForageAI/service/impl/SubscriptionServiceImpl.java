package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PlanResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PortalResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.SubscriptionResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import com.CodeForageAI.Project.CodeForageAI.repository.SubscriptionRepository;
import com.CodeForageAI.Project.CodeForageAI.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    @Override
    public SubscriptionResponse getCurrentSubscription(Long userId) {
        return subscriptionRepository.findActiveByUserId(userId)
                .map(subscription -> new SubscriptionResponse(
                        toPlanResponse(subscription.getPlan()),
                        subscription.getStatus().name(),
                        subscription.getCurrentPeriodEnd(),
                        0L
                ))
                .orElseGet(() -> new SubscriptionResponse(
                        new PlanResponse(
                                null,
                                PlanType.FREE.name(),
                                3,
                                50_000,
                                false,
                                "free"
                        ),
                        SubscriptionStatus.ACTIVE.name(),
                        null,
                        0L
                ));
    }

    @Override
    public CheckoutResponse createCheckoutSessionUrl(CheckoutRequest request, Long userId) {
        return null;
    }

    @Override
    public PortalResponse openCustomerPortal(Long userId) {
        return null;
    }

    private PlanResponse toPlanResponse(Plan plan) {
        if (plan == null) {
            return null;
        }
        boolean proPlan = plan.getName() == PlanType.PRO;
        Integer maxTokensPerDay = null;
        if (plan.getMaxTokensPerMonth() != null) {
            maxTokensPerDay = plan.getMaxTokensPerMonth() > Integer.MAX_VALUE
                    ? Integer.MAX_VALUE
                    : Math.toIntExact(plan.getMaxTokensPerMonth());
        }
        return new PlanResponse(
                plan.getId(),
                plan.getName().name(),
                plan.getMaxProjects(),
                maxTokensPerDay,
                proPlan,
                proPlan ? "custom" : "free"
        );
    }
}
