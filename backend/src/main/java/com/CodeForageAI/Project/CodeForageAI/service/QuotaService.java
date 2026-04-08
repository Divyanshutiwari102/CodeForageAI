package com.CodeForageAI.Project.CodeForageAI.service;

public interface QuotaService {

    /**
     * Checks whether the user is allowed to create another project.
     * Throws QuotaExceededException if the project limit is reached.
     */
    void checkProjectQuota(Long userId);

    /**
     * Checks whether the user has remaining token budget for this month.
     * Throws QuotaExceededException if the monthly token limit is exceeded.
     */
    void checkTokenQuota(Long userId);

    /**
     * Records token usage for a completed AI interaction.
     */
    void logTokenUsage(Long userId, Long projectId, long tokensUsed);
}
