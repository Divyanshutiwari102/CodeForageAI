package com.CodeForageAI.Project.CodeForageAI.repository;

import com.CodeForageAI.Project.CodeForageAI.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatSession_IdOrderByCreatedAtAsc(Long sessionId);

    List<ChatMessage> findTop10ByChatSession_IdOrderByCreatedAtDesc(Long sessionId);
}
