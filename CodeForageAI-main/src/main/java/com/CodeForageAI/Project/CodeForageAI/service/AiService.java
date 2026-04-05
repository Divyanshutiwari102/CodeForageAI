package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatStreamRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.file.AiEditFileRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.file.AiEditFileResponse;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface AiService {

    SseEmitter streamChat(ChatStreamRequest request, Long userId);

    AiEditFileResponse editFile(AiEditFileRequest request, Long userId);
}
