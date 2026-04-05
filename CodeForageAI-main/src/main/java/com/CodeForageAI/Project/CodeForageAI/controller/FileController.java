package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.project.FileContentResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.project.FileNode;
import com.CodeForageAI.Project.CodeForageAI.security.AuthUtil;
import com.CodeForageAI.Project.CodeForageAI.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects/{projectId}/files")
public class FileController {

    private final FileService fileService;
    private final AuthUtil authUtil;

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

}
