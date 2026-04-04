package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatStreamRequest;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface AiService {

    SseEmitter streamChat(ChatStreamRequest request, Long userId);
}
