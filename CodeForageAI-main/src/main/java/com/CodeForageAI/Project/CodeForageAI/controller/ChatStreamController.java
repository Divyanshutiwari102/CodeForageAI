package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatStreamRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.file.AiEditFileRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.file.AiEditFileResponse;
import com.CodeForageAI.Project.CodeForageAI.security.AuthUtil;
import com.CodeForageAI.Project.CodeForageAI.service.AiService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class ChatStreamController {

    AiService aiService;
    AuthUtil authUtil;

    @PostMapping("/stream")
    public SseEmitter streamChat(@Valid @RequestBody ChatStreamRequest request) {
        Long userId = authUtil.getCurrentUserId();
        return aiService.streamChat(request, userId);
    }

    @PostMapping("/edit-file")
    public ResponseEntity<AiEditFileResponse> editFile(@Valid @RequestBody AiEditFileRequest request) {
        Long userId = authUtil.getCurrentUserId();
        return ResponseEntity.ok(aiService.editFile(request, userId));
    }
}
