package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.project.FileContentResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.project.FileNode;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.security.AuthUtil;
import com.CodeForageAI.Project.CodeForageAI.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}/files")
public class FileController {
    private static final List<String> ALLOWED_CONTENT_TYPE_PREFIXES = List.of(
            "text/", "application/json", "application/javascript", "application/xml", "application/yaml"
    );

    private final FileService fileService;
    private final AuthUtil authUtil;
    private final Map<Long, SlidingWindowCounter> uploadCounters = new ConcurrentHashMap<>();

    @Value("${upload.max-size-bytes:1048576}")
    private long maxUploadSizeBytes;
    @Value("${upload.rate-limit.max-requests:30}")
    private int uploadRateLimitMaxRequests;
    @Value("${upload.rate-limit.window-seconds:60}")
    private long uploadRateLimitWindowSeconds;

    @GetMapping
    public ResponseEntity<List<FileNode>> getFileTree(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(fileService.getFileTree(projectId, userId));
    }

    @GetMapping("/{*path}") // /src/hooks/get-user-hook.jsx
    public ResponseEntity<FileContentResponse> getFile(
            @PathVariable Long projectId,
            @PathVariable String path
    ) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(fileService.getFileContent(projectId, path, userId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileNode> uploadFile(
            @PathVariable Long projectId,
            @RequestParam String path,
            @RequestParam MultipartFile file
    ) throws IOException {
        Long userId = authUtil.getCurrentUserId();
        validateUploadRequest(file, userId);
        byte[] content = file.getBytes();
        FileNode fileNode = fileService.uploadFile(projectId, path, content, file.getContentType(), userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(fileNode);
    }

    @DeleteMapping("/{*path}")
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long projectId,
            @PathVariable String path
    ) {
        Long userId = authUtil.getCurrentUserId();
        fileService.deleteFile(projectId, path, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/export", produces = "application/zip")
    public ResponseEntity<byte[]> exportProject(
            @PathVariable Long projectId,
            @RequestParam(name = "path", required = false) List<String> selectedPaths,
            @RequestParam(name = "template", defaultValue = "false") boolean asTemplate
    ) {
        Long userId = authUtil.getCurrentUserId();
        byte[] zipBytes = fileService.exportProjectZip(projectId, userId, selectedPaths, asTemplate);
        String fileName = asTemplate ? "project-template-" + projectId + ".zip" : "project-" + projectId + ".zip";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("application/zip"))
                .body(zipBytes);
    }

    private void validateUploadRequest(MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file must not be empty");
        }
        if (file.getSize() > maxUploadSizeBytes) {
            throw new BadRequestException("Uploaded file exceeds allowed size");
        }
        String contentType = file.getContentType();
        if (contentType == null || ALLOWED_CONTENT_TYPE_PREFIXES.stream().noneMatch(contentType::startsWith)) {
            throw new BadRequestException("Unsupported file content type");
        }
        SlidingWindowCounter counter = uploadCounters.computeIfAbsent(
                userId, ignored -> new SlidingWindowCounter(uploadRateLimitWindowSeconds)
        );
        if (!counter.allow(uploadRateLimitMaxRequests)) {
            throw new BadRequestException("Upload rate limit exceeded");
        }
    }

    private static final class SlidingWindowCounter {
        private long windowStartEpochSecond;
        private int count;
        private final long windowSeconds;

        private SlidingWindowCounter(long windowSeconds) {
            this.windowSeconds = windowSeconds;
            this.windowStartEpochSecond = Instant.now().getEpochSecond();
            this.count = 0;
        }

        private synchronized boolean allow(int maxRequests) {
            long now = Instant.now().getEpochSecond();
            if (now - windowStartEpochSecond >= windowSeconds) {
                windowStartEpochSecond = now;
                count = 0;
            }
            if (count >= maxRequests) {
                return false;
            }
            count++;
            return true;
        }
    }

}
