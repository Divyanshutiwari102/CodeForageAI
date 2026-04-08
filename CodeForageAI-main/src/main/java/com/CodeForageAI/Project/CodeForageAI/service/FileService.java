package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.project.FileContentResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.project.FileNode;

import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface FileService {
    List<FileNode> getFileTree(Long projectId, Long userId);

    FileContentResponse getFileContent(Long projectId, String path, Long userId);

    FileNode uploadFile(Long projectId, String path, byte[] content, String contentType, Long userId);

    void deleteFile(Long projectId, String path, Long userId);

    CompletableFuture<byte[]> exportProjectZip(Long projectId, Long userId, List<String> selectedPaths, boolean asTemplate);
}
