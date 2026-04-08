package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import com.CodeForageAI.Project.CodeForageAI.entity.UsageLog;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.enums.ProjectRole;
import com.CodeForageAI.Project.CodeForageAI.error.QuotaExceededException;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectMemberRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UsageLogRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.QuotaService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class QuotaServiceImpl implements QuotaService {

    // Default FREE plan limits when no plan is assigned
    private static final int FREE_MAX_PROJECTS = 3;
    private static final long FREE_MAX_TOKENS_PER_MONTH = 50_000L;
    private static final long LEGACY_UNLIMITED_SENTINEL = Integer.MAX_VALUE;

    UserRepository userRepository;
    ProjectRepository projectRepository;
    ProjectMemberRepository projectMemberRepository;
    UsageLogRepository usageLogRepository;

    @Override
    @Transactional(readOnly = true)
    public void checkProjectQuota(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        Plan plan = user.getPlan();
        int maxProjects = (plan != null && plan.getMaxProjects() != null)
                ? plan.getMaxProjects()
                : FREE_MAX_PROJECTS;

        // -1 means unlimited
        if (maxProjects < 0) {
            return;
        }

        long ownedProjects = projectMemberRepository
                .countByUser_IdAndProjectRole(userId, ProjectRole.OWNER);

        if (ownedProjects >= maxProjects) {
            throw new QuotaExceededException(
                    "Project limit reached (" + maxProjects + "). Upgrade to PRO for more projects.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void checkTokenQuota(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));

        Plan plan = user.getPlan();

        // -1 or null maxTokensPerMonth on a PRO plan = unlimited
        if (plan != null && isUnlimited(plan.getMaxTokensPerMonth())) {
            return;
        }

        long maxTokens = (plan != null && plan.getMaxTokensPerMonth() != null)
                ? plan.getMaxTokensPerMonth()
                : FREE_MAX_TOKENS_PER_MONTH;

        long usedTokens = usageLogRepository.sumTokensForUserSince(userId, startOfCurrentMonth());

        if (usedTokens >= maxTokens) {
            throw new QuotaExceededException(
                    "Monthly token limit exceeded (" + maxTokens + " tokens). Upgrade to PRO for unlimited AI access.");
        }
    }

    @Override
    @Transactional
    public void logTokenUsage(Long userId, Long projectId, long tokensUsed) {
        User user = userRepository.getReferenceById(userId);
        Project project = (projectId != null) ? projectRepository.getReferenceById(projectId) : null;

        UsageLog usageLog = UsageLog.builder()
                .user(user)
                .project(project)
                .tokensUsed(tokensUsed)
                .build();

        usageLogRepository.save(usageLog);
        log.debug("Logged {} tokens for user {}", tokensUsed, userId);
    }

    private Instant startOfCurrentMonth() {
        return YearMonth.now(ZoneOffset.UTC)
                .atDay(1)
                .atStartOfDay()
                .toInstant(ZoneOffset.UTC);
    }

    private boolean isUnlimited(Long maxTokensPerMonth) {
        return maxTokensPerMonth == null
                || maxTokensPerMonth < 0
                || maxTokensPerMonth >= LEGACY_UNLIMITED_SENTINEL;
    }
}
