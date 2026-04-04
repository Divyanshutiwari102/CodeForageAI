package com.CodeForageAI.Project.CodeForageAI.entity;

import com.CodeForageAI.Project.CodeForageAI.enums.MessageRole;
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
@Table(name = "chat_messages",
        indexes = {
                @Index(name = "idx_chat_messages_session_id", columnList = "chat_session_id"),
                @Index(name = "idx_chat_messages_session_created", columnList = "chat_session_id, created_at")
        })
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_session_id", nullable = false)
    ChatSession chatSession;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    MessageRole role;

    @Column(columnDefinition = "TEXT")
    String toolCalls; // JSON Array of Tools Called

    Integer tokensUsed;

    @CreationTimestamp
    Instant createdAt;
}
