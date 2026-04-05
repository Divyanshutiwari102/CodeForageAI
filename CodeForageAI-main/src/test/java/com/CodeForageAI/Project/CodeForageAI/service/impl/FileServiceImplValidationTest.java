package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.config.MinioConfig;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectFileRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.RagService;
import io.minio.MinioClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileServiceImplValidationTest {

    @Mock
    private MinioClient minioClient;
    @Mock
    private MinioConfig minioConfig;
    @Mock
    private ProjectFileRepository projectFileRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RagService ragService;

    @InjectMocks
    private FileServiceImpl fileService;

    @BeforeEach
    void setUp() {
        when(projectRepository.findAccessibleProjectById(1L, 2L))
                .thenReturn(Optional.of(Project.builder().id(1L).build()));
        when(userRepository.getReferenceById(2L))
                .thenReturn(User.builder().id(2L).username("u").build());
    }

    @Test
    void uploadFile_rejectsPathTraversal() {
        assertThrows(BadRequestException.class, () -> fileService.uploadFile(
                1L, "../secret.txt", "abc".getBytes(StandardCharsets.UTF_8), "text/plain", 2L
        ));
    }

    @Test
    void uploadFile_rejectsUnsupportedContentType() {
        assertThrows(BadRequestException.class, () -> fileService.uploadFile(
                1L, "src/a.bin", "abc".getBytes(StandardCharsets.UTF_8), "application/x-msdownload", 2L
        ));
    }
}
