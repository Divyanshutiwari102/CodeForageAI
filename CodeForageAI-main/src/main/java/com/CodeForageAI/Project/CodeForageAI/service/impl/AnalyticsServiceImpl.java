package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.service.AnalyticsService;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicLong;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final AtomicLong projectCreatedCount = new AtomicLong(0);
    private final AtomicLong chatUsageCount = new AtomicLong(0);
    private final AtomicLong previewUsageCount = new AtomicLong(0);

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
}
