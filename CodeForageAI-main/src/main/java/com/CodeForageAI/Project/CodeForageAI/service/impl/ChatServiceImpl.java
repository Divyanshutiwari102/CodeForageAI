package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatMessageResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatSessionRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatSessionResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.ChatSession;
import com.CodeForageAI.Project.CodeForageAI.entity.Project;
import com.CodeForageAI.Project.CodeForageAI.entity.User;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.ChatMessageRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ChatSessionRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ProjectRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.UserRepository;
import com.CodeForageAI.Project.CodeForageAI.service.ChatService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
@Transactional
public class ChatServiceImpl implements ChatService {

    ChatSessionRepository chatSessionRepository;
    ChatMessageRepository chatMessageRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getChatSessions(Long projectId, Long userId) {
        getAccessibleProject(projectId, userId);
        return chatSessionRepository
                .findByProject_IdAndDeletedAtIsNullOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::toSessionResponse)
                .toList();
    }

    @Override
    public ChatSessionResponse createChatSession(Long projectId, ChatSessionRequest request, Long userId) {
        Project project = getAccessibleProject(projectId, userId);
        User user = userRepository.getReferenceById(userId);

        ChatSession session = ChatSession.builder()
                .project(project)
                .user(user)
                .title(request.title())
                .build();

        session = chatSessionRepository.save(session);
        return toSessionResponse(session);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getChatMessages(Long sessionId, Long userId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChatSession", sessionId.toString()));

        getAccessibleProject(session.getProject().getId(), userId);

        return chatMessageRepository
                .findByChatSession_IdOrderByCreatedAtAsc(sessionId)
                .stream()
                .map(m -> new ChatMessageResponse(m.getId(), m.getContent(), m.getRole(), m.getCreatedAt()))
                .toList();
    }

    private Project getAccessibleProject(Long projectId, Long userId) {
        return projectRepository.findAccessibleProjectById(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", projectId.toString()));
    }

    private ChatSessionResponse toSessionResponse(ChatSession session) {
        return new ChatSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getProject().getId(),
                session.getCreatedAt(),
                session.getUpdatedAt()
        );
    }
}
