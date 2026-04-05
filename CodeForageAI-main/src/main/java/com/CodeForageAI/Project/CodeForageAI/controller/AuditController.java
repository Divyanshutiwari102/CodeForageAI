package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.audit.AuditLogResponse;
import com.CodeForageAI.Project.CodeForageAI.service.AuditLogService;
import com.CodeForageAI.Project.CodeForageAI.service.LogAggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogService auditLogService;
    private final LogAggregationService logAggregationService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogResponse>> listAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String traceId
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(auditLogService.list(pageable, traceId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/audit-logs/{traceId}/search")
    public ResponseEntity<Map<String, Object>> searchCentralizedLogsByTrace(
            @PathVariable String traceId,
            @RequestParam(defaultValue = "100") int limit
    ) {
        return ResponseEntity.ok(logAggregationService.searchByTraceId(traceId, limit));
    }
}
