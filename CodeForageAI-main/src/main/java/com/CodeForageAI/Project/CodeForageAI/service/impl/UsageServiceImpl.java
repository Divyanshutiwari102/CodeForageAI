package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.subscription.PlanLimitsResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.subscription.UsageTodayResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.PreviewRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UsageLogRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.UsageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UsageServiceImpl implements UsageService {

    private static final int FREE_MAX_TOKENS_PER_DAY = 50_000;
    private static final int FREE_MAX_PROJECTS = 3;
    private static final int FREE_MAX_PREVIEWS = 1;

    private final UserRepository userRepository;
    private final UsageLogRepository usageLogRepository;
    private final PreviewRepository previewRepository;
    private final ProjectRepository projectRepository;

    @Override
    public UsageTodayResponse getTodayUsageOfUser(Long userId) {
        User user = getUserOrThrow(userId);
        Plan plan = user.getPlan();

        long usedTokensTodayLong = usageLogRepository.sumTokensForUserSince(
                userId,
                LocalDate.now(ZoneOffset.UTC).atStartOfDay().toInstant(ZoneOffset.UTC)
        );
        int usedTokensToday = usedTokensTodayLong > Integer.MAX_VALUE
                ? Integer.MAX_VALUE
                : (int) usedTokensTodayLong;

        int tokensLimit = resolveTokenLimit(plan);
        int previewsLimit = resolvePreviewLimit(plan);
        List<Long> projectIds = projectRepository.findAllAccessibleByUser(userId).stream()
                .map(Project::getId)
                .toList();
        int runningPreviews = projectIds.isEmpty() ? 0 : previewRepository.countRunningByProjectIds(projectIds);

        return new UsageTodayResponse(
                usedTokensToday,
                tokensLimit,
                runningPreviews,
                previewsLimit
        );
    }

    @Override
    public PlanLimitsResponse getCurrentSubscriptionLimitsOfUser(Long userId) {
        User user = getUserOrThrow(userId);
        Plan plan = user.getPlan();

        String planName = plan == null ? PlanType.FREE.name() : plan.getName().name();
        int tokenLimit = resolveTokenLimit(plan);
        int maxProjects = (plan != null && plan.getMaxProjects() != null)
                ? plan.getMaxProjects()
                : FREE_MAX_PROJECTS;
        boolean unlimitedAi = plan != null
                && plan.getName() == PlanType.PRO
                && (plan.getMaxTokensPerMonth() == null || plan.getMaxTokensPerMonth() < 0);

        return new PlanLimitsResponse(
                planName,
                tokenLimit,
                maxProjects,
                unlimitedAi
        );
    }

    private User getUserOrThrow(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
    }

    private int resolveTokenLimit(Plan plan) {
        if (plan == null || plan.getMaxTokensPerMonth() == null) {
            return FREE_MAX_TOKENS_PER_DAY;
        }
        if (plan.getMaxTokensPerMonth() < 0) {
            return Integer.MAX_VALUE;
        }
        return plan.getMaxTokensPerMonth() > Integer.MAX_VALUE
                ? Integer.MAX_VALUE
                : Math.toIntExact(plan.getMaxTokensPerMonth());
    }

    private int resolvePreviewLimit(Plan plan) {
        if (plan == null || plan.getMaxConcurrentPreviews() == null) {
            return FREE_MAX_PREVIEWS;
        }
        return plan.getMaxConcurrentPreviews();
    }
}
