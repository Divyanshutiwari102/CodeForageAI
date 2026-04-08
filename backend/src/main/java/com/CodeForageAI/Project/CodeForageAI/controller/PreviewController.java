package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewStatusResponse;
import com.CodeForageAI.Project.CodeForageAI.security.AuthUtil;
import com.CodeForageAI.Project.CodeForageAI.service.PreviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}/previews")
public class PreviewController {

    private final PreviewService previewService;
    private final AuthUtil authUtil;

    @PostMapping
    public ResponseEntity<PreviewResponse> startPreview(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(previewService.startPreview(projectId, userId));
    }

    @GetMapping
    public ResponseEntity<List<PreviewStatusResponse>> listPreviews(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(previewService.listPreviews(projectId, userId));
    }

    @GetMapping("/{previewId}")
    public ResponseEntity<PreviewStatusResponse> getPreviewStatus(
            @PathVariable Long projectId,
            @PathVariable Long previewId
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(previewService.getPreviewStatus(previewId, userId));
    }

    @DeleteMapping("/{previewId}")
    public ResponseEntity<Void> stopPreview(
            @PathVariable Long projectId,
            @PathVariable Long previewId
    ) {
        Long userId = authUtil.getCurrentUserId();
        previewService.stopPreview(previewId, userId);
        return ResponseEntity.noContent().build();
    }
}
