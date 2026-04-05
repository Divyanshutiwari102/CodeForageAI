package com.CodeForageAI.Project.CodeForageAI.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_logs_created_at", columnList = "created_at"),
        @Index(name = "idx_audit_logs_trace_id", columnList = "trace_id")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    Long userId;

    @Column(nullable = false)
    String action;

    @Column(nullable = false)
    String path;

    @Column(nullable = false)
    String method;

    Integer statusCode;

    @Column(length = 512)
    String detail;

    @Column(nullable = false)
    String traceId;

    @CreationTimestamp
    Instant createdAt;
}
