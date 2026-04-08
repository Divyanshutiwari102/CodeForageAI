package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.audit.AuditLogResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.AuditLog;
import com.CodeForageAI.Project.CodeForageAI.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public void record(Long userId,
                       String action,
                       String path,
                       String method,
                       Integer statusCode,
                       String detail,
                       String traceId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .action(action)
                .path(path)
                .method(method)
                .statusCode(statusCode)
                .detail(detail)
                .traceId(traceId)
                .build();
        auditLogRepository.save(log);
    }

    public Page<AuditLogResponse> list(Pageable pageable, String traceId) {
        Page<AuditLog> page = (traceId == null || traceId.isBlank())
                ? auditLogRepository.findAll(pageable)
                : auditLogRepository.findByTraceIdContainingIgnoreCase(traceId, pageable);

        return page.map(log -> new AuditLogResponse(
                log.getId(),
                log.getUserId(),
                log.getAction(),
                log.getPath(),
                log.getMethod(),
                log.getStatusCode(),
                log.getDetail(),
                log.getTraceId(),
                log.getCreatedAt()
        ));
    }
}
