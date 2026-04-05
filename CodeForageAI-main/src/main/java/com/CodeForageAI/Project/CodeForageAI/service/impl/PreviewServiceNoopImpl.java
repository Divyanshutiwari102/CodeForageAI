package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewStatusResponse;
import com.CodeForageAI.Project.CodeForageAI.enums.PreviewStatus;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.service.PreviewService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@ConditionalOnProperty(prefix = "kubernetes", name = "enabled", havingValue = "false", matchIfMissing = true)
public class PreviewServiceNoopImpl implements PreviewService {

    private static final String DISABLED_MESSAGE = "Preview service is disabled in this environment";

    @Override
    public PreviewResponse startPreview(Long projectId, Long userId) {
        throw new BadRequestException(DISABLED_MESSAGE);
    }

    @Override
    public PreviewStatusResponse getPreviewStatus(Long previewId, Long userId) {
        return new PreviewStatusResponse(previewId, PreviewStatus.FAILED, null, DISABLED_MESSAGE, Instant.now());
    }

    @Override
    public List<PreviewStatusResponse> listPreviews(Long projectId, Long userId) {
        return List.of();
    }

    @Override
    public void stopPreview(Long previewId, Long userId) {
        // no-op when disabled
    }
}
