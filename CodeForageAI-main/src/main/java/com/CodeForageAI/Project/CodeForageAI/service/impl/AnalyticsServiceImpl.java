package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.repository.ChatSessionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.PreviewRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.service.AnalyticsService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AtomicLong projectCreatedCount = new AtomicLong(0);
    private final AtomicLong chatUsageCount = new AtomicLong(0);
    private final AtomicLong previewUsageCount = new AtomicLong(0);
    private final ProjectRepository projectRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final PreviewRepository previewRepository;

    @Override
    public void trackProjectCreated() {
        projectCreatedCount.incrementAndGet();
    }

    @Override
    public void trackChatUsed() {
        chatUsageCount.incrementAndGet();
    }

    @Override
    public void trackPreviewUsed() {
        previewUsageCount.incrementAndGet();
    }

    @Override
    public long getProjectCreatedCount() {
        return projectCreatedCount.get();
    }

    @Override
    public long getChatUsageCount() {
        return chatUsageCount.get();
    }

    @Override
    public long getPreviewUsageCount() {
        return previewUsageCount.get();
    }

    @Override
    @PostConstruct
    public void initializeFromPersistence() {
        projectCreatedCount.updateAndGet(current -> Math.max(current, projectRepository.count()));
        chatUsageCount.updateAndGet(current -> Math.max(current, chatSessionRepository.count()));
        previewUsageCount.updateAndGet(current -> Math.max(current, previewRepository.count()));
    }
}
