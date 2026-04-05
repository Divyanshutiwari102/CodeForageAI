package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PlanResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import com.CodeForageAI.Project.CodeForageAI.repository.PlanRepository;
import com.CodeForageAI.Project.CodeForageAI.service.PlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanServiceImpl implements PlanService {

    private final PlanRepository planRepository;

    @Override
    public List<PlanResponse> getAllActivePlans() {
        return planRepository.findAll().stream()
                .map(this::toPlanResponse)
                .toList();
    }

    private PlanResponse toPlanResponse(Plan plan) {
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
