package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewStatusResponse;

import java.util.List;

public interface PreviewService {

    PreviewResponse startPreview(Long projectId, Long userId);

    PreviewStatusResponse getPreviewStatus(Long previewId, Long userId);

    List<PreviewStatusResponse> listPreviews(Long projectId, Long userId);

    void stopPreview(Long previewId, Long userId);
}
