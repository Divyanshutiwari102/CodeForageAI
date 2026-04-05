package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.config.KubernetesConfig;
import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.preview.PreviewStatusResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.Preview;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import com.CodeForageAI.Project.CodeForageAI.enums.PreviewStatus;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.PreviewRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.service.PreviewService;
import com.CodeForageAI.Project.CodeForageAI.service.AnalyticsService;
import io.kubernetes.client.openapi.apis.AppsV1Api;
import io.kubernetes.client.openapi.apis.CoreV1Api;
import io.kubernetes.client.openapi.apis.NetworkingV1Api;
import io.kubernetes.client.openapi.models.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "kubernetes", name = "enabled", havingValue = "true")
@Transactional
public class PreviewServiceImpl implements PreviewService {

    private final CoreV1Api coreV1Api;
    private final AppsV1Api appsV1Api;
    private final NetworkingV1Api networkingV1Api;
    private final KubernetesConfig kubernetesConfig;
    private final PreviewRepository previewRepository;
    private final ProjectRepository projectRepository;
    private final AnalyticsService analyticsService;

    private static final String NAMESPACE_PREFIX = "preview-";
    private static final int VITE_PORT = 3000;

    @Override
    public PreviewResponse startPreview(Long projectId, Long userId) {
        log.info("Starting preview for project {} by user {}", projectId, userId);
        analyticsService.trackPreviewUsed();
        Project project = projectRepository.findAccessibleProjectById(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));

        // Terminate any existing running preview for this project
        previewRepository.findFirstByProject_IdAndStatusOrderByCreatedAtDesc(projectId, PreviewStatus.RUNNING)
                .ifPresent(existing -> terminatePreviewResources(existing));

        String namespace = NAMESPACE_PREFIX + projectId;
        String podName = "vite-" + projectId;
        String previewUrl = "https://" + projectId + "." + kubernetesConfig.getIngressDomain();

        Preview preview = Preview.builder()
                .project(project)
                .namespace(namespace)
                .podName(podName)
                .previewUrl(previewUrl)
                .status(PreviewStatus.CREATING)
                .build();
        preview = previewRepository.save(preview);

        try {
            ensureNamespaceExists(namespace);
            createDeployment(namespace, podName, projectId);
            createService(namespace, podName);
            createIngress(namespace, podName, projectId);

            preview.setStatus(PreviewStatus.RUNNING);
            preview.setStartedAt(Instant.now());

        } catch (Exception e) {
            log.error("Failed to start Kubernetes preview for project {}", projectId, e);
            preview.setStatus(PreviewStatus.FAILED);
        }

        preview = previewRepository.save(preview);
        log.info("Preview {} started for project {}, url={}", preview.getId(), projectId, previewUrl);
        return new PreviewResponse(preview.getId(), preview.getPreviewUrl(), preview.getStatus());
    }

    @Override
    @Transactional(readOnly = true)
    public PreviewStatusResponse getPreviewStatus(Long previewId, Long userId) {
        Preview preview = previewRepository.findById(previewId)
                .orElseThrow(() -> new ResourceNotFoundException("Preview", previewId.toString()));

        // validate user has access
        projectRepository.findAccessibleProjectById(preview.getProject().getId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", preview.getProject().getId().toString()));

        return toStatusResponse(preview, statusMessage(preview.getStatus()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PreviewStatusResponse> listPreviews(Long projectId, Long userId) {
        projectRepository.findAccessibleProjectById(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));

        return previewRepository.findByProject_IdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(p -> toStatusResponse(p, statusMessage(p.getStatus())))
                .toList();
    }

    @Override
    public void stopPreview(Long previewId, Long userId) {
        log.info("Stopping preview {} by user {}", previewId, userId);
        Preview preview = previewRepository.findById(previewId)
                .orElseThrow(() -> new ResourceNotFoundException("Preview", previewId.toString()));

        projectRepository.findAccessibleProjectById(preview.getProject().getId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", preview.getProject().getId().toString()));

        terminatePreviewResources(preview);
        previewRepository.save(preview);
    }

    // --- Kubernetes resource helpers ---

    private void ensureNamespaceExists(String namespace) throws Exception {
        try {
            coreV1Api.readNamespace(namespace).execute();
        } catch (Exception e) {
            V1Namespace ns = new V1Namespace()
                    .metadata(new V1ObjectMeta().name(namespace));
            coreV1Api.createNamespace(ns).execute();
            log.info("Created namespace: {}", namespace);
        }
    }

    private void createDeployment(String namespace, String podName, Long projectId) throws Exception {
        Map<String, String> labels = Map.of("app", podName);

        V1Deployment deployment = new V1Deployment()
                .metadata(new V1ObjectMeta().name(podName).namespace(namespace))
                .spec(new V1DeploymentSpec()
                        .replicas(1)
                        .selector(new V1LabelSelector().matchLabels(labels))
                        .template(new V1PodTemplateSpec()
                                .metadata(new V1ObjectMeta().labels(labels))
                                .spec(new V1PodSpec()
                                        .containers(List.of(new V1Container()
                                                .name("vite")
                                                .image(kubernetesConfig.getPreviewImage())
                                                .ports(List.of(new V1ContainerPort().containerPort(VITE_PORT)))
                                                .env(List.of(
                                                        new V1EnvVar().name("PROJECT_ID").value(projectId.toString()),
                                                        new V1EnvVar().name("MINIO_ENDPOINT").value(kubernetesConfig.getMinioEndpoint()),
                                                        new V1EnvVar().name("MINIO_ACCESS_KEY").value(kubernetesConfig.getMinioAccessKey()),
                                                        new V1EnvVar().name("MINIO_SECRET_KEY").value(kubernetesConfig.getMinioSecretKey()),
                                                        new V1EnvVar().name("MINIO_BUCKET").value(kubernetesConfig.getMinioBucket())
                                                ))
                                        ))
                                )
                        )
                );

        appsV1Api.createNamespacedDeployment(namespace, deployment).execute();
        log.info("Created deployment {} in namespace {}", podName, namespace);
    }

    private void createService(String namespace, String podName) throws Exception {
        Map<String, String> selector = Map.of("app", podName);

        V1Service service = new V1Service()
                .metadata(new V1ObjectMeta().name(podName).namespace(namespace))
                .spec(new V1ServiceSpec()
                        .selector(selector)
                        .ports(List.of(new V1ServicePort()
                                .port(VITE_PORT)
                                .targetPort(new io.kubernetes.client.custom.IntOrString(VITE_PORT))
                        ))
                );

        coreV1Api.createNamespacedService(namespace, service).execute();
        log.info("Created service {} in namespace {}", podName, namespace);
    }

    private void createIngress(String namespace, String podName, Long projectId) throws Exception {
        String host = projectId + "." + kubernetesConfig.getIngressDomain();

        V1Ingress ingress = new V1Ingress()
                .metadata(new V1ObjectMeta()
                        .name(podName)
                        .namespace(namespace)
                        .putAnnotationsItem("nginx.ingress.kubernetes.io/rewrite-target", "/")
                )
                .spec(new V1IngressSpec()
                        .rules(List.of(new V1IngressRule()
                                .host(host)
                                .http(new V1HTTPIngressRuleValue()
                                        .paths(List.of(new V1HTTPIngressPath()
                                                .path("/")
                                                .pathType("Prefix")
                                                .backend(new V1IngressBackend()
                                                        .service(new V1IngressServiceBackend()
                                                                .name(podName)
                                                                .port(new V1ServiceBackendPort().number(VITE_PORT))
                                                        )
                                                )
                                        ))
                                )
                        ))
                );

        networkingV1Api.createNamespacedIngress(namespace, ingress).execute();
        log.info("Created ingress {} in namespace {}", podName, namespace);
    }

    private void terminatePreviewResources(Preview preview) {
        String namespace = preview.getNamespace();
        String podName = preview.getPodName();
        log.info("Terminating preview resources: namespace={} podName={}", namespace, podName);
        try {
            networkingV1Api.deleteNamespacedIngress(podName, namespace).execute();
            log.info("Deleted ingress {}/{}", namespace, podName);
        } catch (Exception e) {
            log.warn("Could not delete ingress {}/{}: {}", namespace, podName, e.getMessage());
        }
        try {
            coreV1Api.deleteNamespacedService(podName, namespace).execute();
            log.info("Deleted service {}/{}", namespace, podName);
        } catch (Exception e) {
            log.warn("Could not delete service {}/{}: {}", namespace, podName, e.getMessage());
        }
        try {
            appsV1Api.deleteNamespacedDeployment(podName, namespace).execute();
            log.info("Deleted deployment {}/{}", namespace, podName);
        } catch (Exception e) {
            log.warn("Could not delete deployment {}/{}: {}", namespace, podName, e.getMessage());
        }
        try {
            coreV1Api.deleteNamespace(namespace).execute();
            log.info("Deleted namespace {}", namespace);
        } catch (Exception e) {
            log.warn("Could not delete namespace {}: {}", namespace, e.getMessage());
        }
        preview.setStatus(PreviewStatus.TERMINATED);
        preview.setTerminatedAt(Instant.now());
        log.info("Terminated preview {} for project {}", preview.getId(), preview.getProject().getId());
    }

    private PreviewStatusResponse toStatusResponse(Preview preview, String message) {
        return new PreviewStatusResponse(
                preview.getId(),
                preview.getStatus(),
                preview.getPreviewUrl(),
                message,
                preview.getCreatedAt()
        );
    }

    private String statusMessage(PreviewStatus status) {
        return switch (status) {
            case CREATING -> "Preview is being created";
            case RUNNING -> "Preview is running";
            case FAILED -> "Preview failed to start";
            case TERMINATED -> "Preview has been terminated";
        };
    }
}
