package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.config.MinioConfig;
import com.CodeForageAI.Project.CodeForageAI.dto.project.FileContentResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.project.FileNode;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import com.CodeForageAI.Project.CodeForageAI.entity.ProjectFile;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectFileRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.FileService;
import com.CodeForageAI.Project.CodeForageAI.service.RagService;
import io.minio.*;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.List;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Transactional
public class FileServiceImpl implements FileService {

    MinioClient minioClient;
    MinioConfig minioConfig;
    ProjectFileRepository projectFileRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;
    RagService ragService;

    @PostConstruct
    public void ensureBucketExists() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(minioConfig.getBucket()).build()
            );
            if (!exists) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(minioConfig.getBucket()).build()
                );
                log.info("Created MinIO bucket: {}", minioConfig.getBucket());
            }
        } catch (Exception e) {
            log.error("Failed to ensure MinIO bucket exists: {}", e.getMessage(), e);
            throw new IllegalStateException("MinIO bucket initialization failed", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileNode> getFileTree(Long projectId, Long userId) {
        getAccessibleProject(projectId, userId);
        return projectFileRepository.findByProject_Id(projectId).stream()
                .map(f -> new FileNode(f.getPath(), f.getUpdatedAt(), f.getSize(), f.getContentType()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FileContentResponse getFileContent(Long projectId, String path, Long userId) {
        getAccessibleProject(projectId, userId);

        String normalizedPath = normalizePath(path);

        ProjectFile file = projectFileRepository.findByProject_IdAndPath(projectId, normalizedPath)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectFile", normalizedPath));

        log.info("Downloading file: projectId={} path={}", projectId, normalizedPath);
        Exception lastException = null;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try (InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(file.getMinioObjectKey())
                            .build()
            )) {
                String content = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
                log.info("Downloaded file: projectId={} path={} attempt={}", projectId, normalizedPath, attempt);
                return new FileContentResponse(normalizedPath, content);
            } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
                lastException = e;
                log.warn("Attempt {}/3 failed to read file from MinIO: {} - {}", attempt, file.getMinioObjectKey(), e.getMessage());
            }
        }
        log.error("Failed to read file from MinIO after 3 attempts: {}", file.getMinioObjectKey(), lastException);
        throw new IllegalStateException("Failed to read file content for path: " + normalizedPath, lastException);
    }

    @Override
    public FileNode uploadFile(Long projectId, String path, byte[] content, String contentType, Long userId) {
        Project project = getAccessibleProject(projectId, userId);
        User user = userRepository.getReferenceById(userId);

        String normalizedPath = normalizePath(path);
        String objectKey = buildObjectKey(projectId, normalizedPath);

        String resolvedContentType = (contentType != null && !contentType.isBlank())
                ? contentType
                : "application/octet-stream";

        log.info("Uploading file: projectId={} path={} size={} contentType={}",
                projectId, normalizedPath, content.length, resolvedContentType);

        Exception lastException = null;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(minioConfig.getBucket())
                                .object(objectKey)
                                .stream(new ByteArrayInputStream(content), content.length, -1)
                                .contentType(resolvedContentType)
                                .build()
                );
                log.info("Uploaded file: projectId={} path={} attempt={}", projectId, normalizedPath, attempt);
                lastException = null;
                break;
            } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
                lastException = e;
                log.warn("Attempt {}/3 failed to upload file to MinIO: {} - {}", attempt, objectKey, e.getMessage());
            }
        }

        if (lastException != null) {
            log.error("Failed to upload file to MinIO after 3 attempts: {}", objectKey, lastException);
            throw new IllegalStateException("Failed to upload file at path: " + normalizedPath, lastException);
        }

        ProjectFile file = projectFileRepository.findByProject_IdAndPath(projectId, normalizedPath)
                .orElse(ProjectFile.builder()
                        .project(project)
                        .path(normalizedPath)
                        .createdBy(user)
                        .build());

        file.setPath(normalizedPath);
        file.setMinioObjectKey(objectKey);
        file.setContentType(resolvedContentType);
        file.setSize((long) content.length);
        file.setUpdatedBy(user);

        file = projectFileRepository.save(file);

        if (isTextContent(resolvedContentType)) {
            try {
                String textContent = new String(content, StandardCharsets.UTF_8);
                ragService.indexFile(projectId, normalizedPath, textContent);
            } catch (Exception e) {
                log.warn("RAG indexing failed for file {}, continuing: {}", normalizedPath, e.getMessage());
            }
        }

        return new FileNode(file.getPath(), file.getUpdatedAt(), file.getSize(), file.getContentType());
    }

    @Override
    public void deleteFile(Long projectId, String path, Long userId) {
        getAccessibleProject(projectId, userId);

        String normalizedPath = normalizePath(path);

        ProjectFile file = projectFileRepository.findByProject_IdAndPath(projectId, normalizedPath)
                .orElseThrow(() -> new ResourceNotFoundException("ProjectFile", normalizedPath));

        log.info("Deleting file: projectId={} path={}", projectId, normalizedPath);
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucket())
                            .object(file.getMinioObjectKey())
                            .build()
            );
            log.info("Deleted file from MinIO: {}", file.getMinioObjectKey());
        } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
            log.error("Failed to delete file from MinIO: {}", file.getMinioObjectKey(), e);
            throw new IllegalStateException("Failed to delete file at path: " + normalizedPath, e);
        }

        projectFileRepository.delete(file);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportProjectZip(Long projectId, Long userId, List<String> selectedPaths, boolean asTemplate) {
        getAccessibleProject(projectId, userId);
        List<ProjectFile> files = projectFileRepository.findByProject_Id(projectId);
        Set<String> selectedNormalizedPaths = selectedPaths == null
                ? Set.of()
                : selectedPaths.stream()
                .filter(path -> path != null && !path.isBlank())
                .map(this::normalizePath)
                .collect(Collectors.toCollection(HashSet::new));

        List<ProjectFile> filesToExport = selectedNormalizedPaths.isEmpty()
                ? files
                : files.stream()
                .filter(file -> selectedNormalizedPaths.contains(normalizePath(file.getPath())))
                .toList();

        try (ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
             ZipOutputStream zipStream = new ZipOutputStream(byteStream)) {
            for (ProjectFile file : filesToExport) {
                String path = normalizePath(file.getPath());
                String entryPath = asTemplate ? "template/" + path : path;
                ZipEntry entry = new ZipEntry(entryPath);
                try (InputStream stream = minioClient.getObject(
                        GetObjectArgs.builder()
                                .bucket(minioConfig.getBucket())
                                .object(file.getMinioObjectKey())
                                .build()
                )) {
                    zipStream.putNextEntry(entry);
                    stream.transferTo(zipStream);
                    zipStream.closeEntry();
                } catch (MinioException | IOException | InvalidKeyException | NoSuchAlgorithmException e) {
                    throw new IllegalStateException("Failed to read file content for path: " + path, e);
                }
            }
            zipStream.finish();
            return byteStream.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate project zip export", e);
        }
    }

    private Project getAccessibleProject(Long projectId, Long userId) {
        return projectRepository.findAccessibleProjectById(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
    }

    private String buildObjectKey(Long projectId, String path) {
        String normalizedPath = normalizePath(path);
        return "projects/" + projectId + "/" + normalizedPath;
    }

    private String normalizePath(String path) {
        if (path == null || path.isBlank()) {
            throw new IllegalArgumentException("File path must not be blank");
        }
        String normalized = path.trim().replace("\\", "/");
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }

    private static final Set<String> TEXT_CONTENT_TYPES = Set.of(
            "text/plain", "text/html", "text/css", "text/markdown",
            "application/javascript", "application/json", "application/xml",
            "application/yaml", "application/typescript"
    );

    private boolean isTextContent(String contentType) {
        if (contentType == null) return false;
        String base = contentType.contains(";")
                ? contentType.substring(0, contentType.indexOf(';')).trim()
                : contentType;
        return base.startsWith("text/") || TEXT_CONTENT_TYPES.contains(base);
    }
}
