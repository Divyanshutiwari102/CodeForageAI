package com.CodeForageAI.Project.CodeForageAI.service;

public interface AnalyticsService {
    void trackProjectCreated();

    void trackChatUsed();

    void trackPreviewUsed();

    long getProjectCreatedCount();

    long getChatUsageCount();

    long getPreviewUsageCount();

    void initializeFromPersistence();
}
