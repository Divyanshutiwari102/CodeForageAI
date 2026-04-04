package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatMessageResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatSessionRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatSessionResponse;

import java.util.List;

public interface ChatService {

    List<ChatSessionResponse> getChatSessions(Long projectId, Long userId);

    ChatSessionResponse createChatSession(Long projectId, ChatSessionRequest request, Long userId);

    List<ChatMessageResponse> getChatMessages(Long sessionId, Long userId);
}
