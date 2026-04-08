package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PlanLimitsResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.UsageTodayResponse;

public interface UsageService {
     UsageTodayResponse getTodayUsageOfUser(Long userId);

    PlanLimitsResponse getCurrentSubscriptionLimitsOfUser(Long userId);
}
