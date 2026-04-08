package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.CheckoutResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PlanResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PortalResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.SubscriptionResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import com.CodeForageAI.Project.CodeForageAI.enums.SubscriptionStatus;
import com.CodeForageAI.Project.CodeForageAI.repository.PlanRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.SubscriptionRepository;
import com.CodeForageAI.Project.CodeForageAI.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final int DEFAULT_FREE_MAX_PROJECTS = 3;
    private static final int DEFAULT_FREE_MAX_TOKENS_PER_MONTH = 50_000;

    private final SubscriptionRepository subscriptionRepository;
    private final PlanRepository planRepository;

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
                        buildFreePlanResponse(),
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

    private PlanResponse buildFreePlanResponse() {
        return planRepository.findByName(PlanType.FREE)
                .map(this::toPlanResponse)
                .orElse(new PlanResponse(
                        null,
                        PlanType.FREE.name(),
                        DEFAULT_FREE_MAX_PROJECTS,
                        DEFAULT_FREE_MAX_TOKENS_PER_MONTH,
                        false,
                        "free"
                ));
    }
}
