package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatMessageResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatCommitResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatSessionRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatSessionResponse;
import com.CodeForageAI.Project.CodeForageAI.security.AuthUtil;
import com.CodeForageAI.Project.CodeForageAI.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final AuthUtil authUtil;

    @GetMapping("/api/projects/{projectId}/chat-sessions")
    public ResponseEntity<List<ChatSessionResponse>> getChatSessions(@PathVariable Long projectId) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(chatService.getChatSessions(projectId, userId));
    }

    @PostMapping("/api/projects/{projectId}/chat-sessions")
    public ResponseEntity<ChatSessionResponse> createChatSession(
            @PathVariable Long projectId,
            @Valid @RequestBody ChatSessionRequest request
    ) {
        Long userId = authUtil.getCurrentUserId();
        ChatSessionResponse response = chatService.createChatSession(projectId, request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/chat/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getChatMessages(@PathVariable Long sessionId) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(chatService.getChatMessages(sessionId, userId));
    }

    @PostMapping("/api/chat/sessions/{sessionId}/commit")
    public ResponseEntity<ChatCommitResponse> saveChatAsCommit(@PathVariable Long sessionId) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(chatService.saveChatAsCommit(sessionId, userId));
    }
}
