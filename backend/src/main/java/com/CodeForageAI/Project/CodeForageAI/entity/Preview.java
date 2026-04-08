package com.CodeForageAI.Project.CodeForageAI.entity;

import com.CodeForageAI.Project.CodeForageAI.enums.PreviewStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "previews",
        indexes = {
                @Index(name = "idx_preview_project_id", columnList = "project_id"),
                @Index(name = "idx_preview_status", columnList = "status")
        }
)
public class Preview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    Project project;

    @Column(nullable = false)
    String namespace;

    @Column(name = "pod_name", nullable = false)
    String podName;

    @Column(name = "preview_url")
    String previewUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PreviewStatus status;

    @Column(name = "started_at")
    Instant startedAt;

    @Column(name = "terminated_at")
    Instant terminatedAt;

    @CreationTimestamp
    @Column(name = "created_at")
    Instant createdAt;
}
