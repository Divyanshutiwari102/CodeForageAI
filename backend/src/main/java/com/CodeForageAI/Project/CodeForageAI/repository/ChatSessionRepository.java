package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByProject_IdAndDeletedAtIsNullOrderByCreatedAtDesc(Long projectId);

    Optional<ChatSession> findByIdAndProject_IdAndDeletedAtIsNull(Long id, Long projectId);
}
