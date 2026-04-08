package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.entity.Plan;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.enums.PlanType;
import com.CodeForageAI.Project.CodeForageAI.enums.ProjectRole;
import com.CodeForageAI.Project.CodeForageAI.error.QuotaExceededException;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectMemberRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UsageLogRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuotaServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProjectMemberRepository projectMemberRepository;
    @Mock
    private UsageLogRepository usageLogRepository;

    @InjectMocks
    private QuotaServiceImpl quotaService;

    @Test
    void checkProjectQuota_throwsWhenOwnerProjectsReachPlanLimit() {
        Long userId = 1L;
        Plan plan = Plan.builder().name(PlanType.PRO).maxProjects(1).build();
        User user = User.builder().id(userId).username("u1").plan(plan).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(projectMemberRepository.countByUser_IdAndProjectRole(userId, ProjectRole.OWNER)).thenReturn(1L);

        assertThrows(QuotaExceededException.class, () -> quotaService.checkProjectQuota(userId));
    }

    @Test
    void checkTokenQuota_throwsWhenMonthlyUsageReachesLimit() {
        Long userId = 2L;
        Plan plan = Plan.builder().name(PlanType.PRO).maxTokensPerMonth(100L).build();
        User user = User.builder().id(userId).username("u2").plan(plan).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(usageLogRepository.sumTokensForUserSince(anyLong(), any())).thenReturn(100L);

        assertThrows(QuotaExceededException.class, () -> quotaService.checkTokenQuota(userId));
    }

    @Test
    void checkTokenQuota_allowsUnlimitedPlanWithoutUsageLookup() {
        Long userId = 3L;
        Plan plan = Plan.builder().name(PlanType.PRO).maxTokensPerMonth(-1L).build();
        User user = User.builder().id(userId).username("u3").plan(plan).build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertDoesNotThrow(() -> quotaService.checkTokenQuota(userId));
        verify(usageLogRepository, never()).sumTokensForUserSince(anyLong(), any());
    }

    @Test
    void logTokenUsage_savesUsageLogWithProjectReference() {
        Long userId = 4L;
        Long projectId = 11L;
        User user = User.builder().id(userId).username("u4").build();
        Project project = Project.builder().id(projectId).name("p1").build();

        when(userRepository.getReferenceById(userId)).thenReturn(user);
        when(projectRepository.getReferenceById(projectId)).thenReturn(project);

        quotaService.logTokenUsage(userId, projectId, 42L);

        ArgumentCaptor<com.CodeForageAI.Project.CodeForageAI.entity.UsageLog> usageLogCaptor =
                ArgumentCaptor.forClass(com.CodeForageAI.Project.CodeForageAI.entity.UsageLog.class);
        verify(usageLogRepository).save(usageLogCaptor.capture());
        assertEquals(42L, usageLogCaptor.getValue().getTokensUsed());
        assertEquals(userId, usageLogCaptor.getValue().getUser().getId());
        assertEquals(projectId, usageLogCaptor.getValue().getProject().getId());
    }
}
