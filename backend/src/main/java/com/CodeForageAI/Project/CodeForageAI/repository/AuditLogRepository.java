package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByTraceIdContainingIgnoreCase(String traceId, Pageable pageable);
}
