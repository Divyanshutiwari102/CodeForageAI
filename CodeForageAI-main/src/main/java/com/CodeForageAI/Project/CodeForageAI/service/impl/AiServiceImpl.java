package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatStreamEvent;
import com.CodeForageAI.Project.CodeForageAI.dto.chat.ChatStreamRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.file.AiEditFileRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.file.AiEditFileResponse;
import com.CodeForageAI.Project.CodeForageAI.entity.ChatMessage;
import com.CodeForageAI.Project.CodeForageAI.entity.ChatSession;
import com.CodeForageAI.Project.CodeForageAI.enums.MessageRole;
import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.error.ResourceNotFoundException;
import com.CodeForageAI.Project.CodeForageAI.repository.ChatMessageRepository;
import com.CodeForageAI.Project.CodeForageAI.repository.ChatSessionRepository;
import com.CodeForageAI.Project.CodeForageAI.service.AiService;
import com.CodeForageAI.Project.CodeForageAI.service.FileService;
import com.CodeForageAI.Project.CodeForageAI.service.QuotaService;
import com.CodeForageAI.Project.CodeForageAI.service.RagService;
import com.CodeForageAI.Project.CodeForageAI.service.AnalyticsService;
import com.CodeForageAI.Project.CodeForageAI.util.CodeBlockParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class AiServiceImpl implements AiService {

    ChatClient chatClient;
    ChatSessionRepository chatSessionRepository;
    ChatMessageRepository chatMessageRepository;
    FileService fileService;
    QuotaService quotaService;
    RagService ragService;
    AnalyticsService analyticsService;
    ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            You are an expert full-stack developer AI assistant helping users build web applications.

            When generating or modifying code:
            1. Always specify the file path as a comment on the FIRST line inside the code block
               Example:
               ```jsx
               // src/components/App.jsx
               import React from 'react';
               ...
               ```
            2. Generate complete, working code — never partial snippets
            3. Use React + Vite + Tailwind CSS stack by default
            4. If multiple files need changes, output each in a separate code block
            5. After code blocks, briefly explain what was done

            Current project files context will be provided with each message.
            """;

    @Override
    public SseEmitter streamChat(ChatStreamRequest request, Long userId) {
        log.info("AI stream request: sessionId={} projectId={} userId={}", request.sessionId(), request.projectId(), userId);
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT_MS);
        analyticsService.trackChatUsed();

        // Check token quota before proceeding
        quotaService.checkTokenQuota(userId);

        ChatSession session = chatSessionRepository
                .findById(request.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ChatSession", request.sessionId().toString()));

        // Save user message before starting the stream
        ChatMessage userMessage = ChatMessage.builder()
                .chatSession(session)
                .content(request.prompt())
                .role(MessageRole.USER)
                .build();
        chatMessageRepository.save(userMessage);

        // Delegate streaming to a background thread so this method returns the emitter immediately
        streamAsync(emitter, session, request, userId);

        return emitter;
    }

    @Override
    public AiEditFileResponse editFile(AiEditFileRequest request, Long userId) {
        Long projectId = request.projectId();
        String instruction = request.instruction().trim();
        if (instruction.length() < 3) {
            throw new BadRequestException("Instruction must be at least 3 characters");
        }
        if (instruction.length() > 2000) {
            throw new BadRequestException("Instruction exceeds maximum length");
        }
        String existingContent = fileService.getFileContent(projectId, request.path(), userId).content();
        String prompt = """
                You are modifying an existing file.
                Return only the full updated file content with no markdown fences.
                File path: %s
                Instruction: %s
                
                Existing file content:
                %s
                """.formatted(request.path(), instruction, existingContent);

        String updatedContent = chatClient.prompt()
                .system("You are an expert coding assistant that edits files safely.")
                .user(prompt)
                .call()
                .content();
        if (updatedContent == null) {
            throw new IllegalStateException("AI returned empty edit response");
        }

        fileService.uploadFile(
                projectId,
                request.path(),
                updatedContent.getBytes(StandardCharsets.UTF_8),
                detectContentType(request.path()),
                userId
        );
        return new AiEditFileResponse(request.path(), updatedContent);
    }

    @Async
    public void streamAsync(SseEmitter emitter, ChatSession session,
                            ChatStreamRequest request, Long userId) {
        try {
            // Fetch relevant files from Qdrant and build context
            String enhancedPrompt = buildEnhancedPrompt(session, request.prompt(), userId);

            List<Message> messages = buildMessageHistory(session.getId());
            messages.add(new UserMessage(enhancedPrompt));

            AtomicReference<StringBuilder> fullResponse = new AtomicReference<>(new StringBuilder());

            chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .messages(messages)
                    .stream()
                    .content()
                    .doOnNext(chunk -> {
                        try {
                            fullResponse.get().append(chunk);
                            emitter.send(SseEmitter.event()
                                    .name("message")
                                    .data(objectMapper.writeValueAsString(
                                            ChatStreamEvent.token(chunk))));
                        } catch (Exception e) {
                            log.error("Error sending SSE token chunk", e);
                        }
                    })
                    .doOnComplete(() -> {
                        try {
                            String completeResponse = fullResponse.get().toString();
                            log.info("AI stream completed: sessionId={} userId={} responseLength={}", session.getId(), userId, completeResponse.length());

                            // Persist the full assistant reply
                            ChatMessage assistantMessage = ChatMessage.builder()
                                    .chatSession(session)
                                    .content(completeResponse)
                                    .role(MessageRole.ASSISTANT)
                                    .build();
                            chatMessageRepository.save(assistantMessage);

                            // Estimate token usage (approx. CHARS_PER_TOKEN chars per token) and log it
                            long estimatedTokens = Math.max(1L,
                                    (long) Math.ceil(completeResponse.length() / (double) CHARS_PER_TOKEN));
                            quotaService.logTokenUsage(userId, session.getProject().getId(), estimatedTokens);

                            // Parse code blocks and write files to MinIO
                            List<CodeBlockParser.ParsedFile> parsedFiles =
                                    CodeBlockParser.parse(completeResponse);

                            for (CodeBlockParser.ParsedFile file : parsedFiles) {
                                byte[] contentBytes = file.content()
                                        .getBytes(StandardCharsets.UTF_8);
                                fileService.uploadFile(
                                        session.getProject().getId(),
                                        file.path(),
                                        contentBytes,
                                        detectContentType(file.path()),
                                        userId
                                );
                                emitter.send(SseEmitter.event()
                                        .name("message")
                                        .data(objectMapper.writeValueAsString(
                                                ChatStreamEvent.fileSaved(file.path()))));
                            }

                            emitter.send(SseEmitter.event()
                                    .name("message")
                                    .data(objectMapper.writeValueAsString(
                                            ChatStreamEvent.done())));
                            emitter.complete();

                        } catch (Exception e) {
                            log.error("Error in stream completion handler", e);
                            emitter.completeWithError(e);
                        }
                    })
                    .doOnError(error -> {
                        log.error("LLM stream error", error);
                        try {
                            emitter.send(SseEmitter.event()
                                    .name("message")
                                    .data(objectMapper.writeValueAsString(
                                            ChatStreamEvent.error(error.getMessage()))));
                        } catch (Exception e) {
                            log.error("Error sending SSE error event", e);
                        }
                        emitter.completeWithError(error);
                    })
                    .subscribe();

        } catch (Exception e) {
            log.error("Error starting AI stream", e);
            emitter.completeWithError(e);
        }
    }

    private String buildEnhancedPrompt(ChatSession session, String prompt, Long userId) {
        try {
            Long projectId = session.getProject().getId();
            List<String> relevantPaths = ragService.searchRelevantFiles(projectId, prompt, 5);

            if (relevantPaths.isEmpty()) {
                return prompt;
            }

            StringBuilder context = new StringBuilder("Relevant project files:\n\n");
            for (String path : relevantPaths) {
                try {
                    String content = fileService.getFileContent(projectId, path, userId).content();
                    context.append("// ").append(path).append("\n```\n")
                            .append(content).append("\n```\n\n");
                } catch (Exception e) {
                    log.warn("Could not fetch file content for RAG context: {}", path);
                }
            }

            return context + "User request: " + prompt;

        } catch (Exception e) {
            log.warn("RAG context retrieval failed, proceeding without context: {}", e.getMessage());
            return prompt;
        }
    }

    private List<Message> buildMessageHistory(Long sessionId) {
        // Fetch last 10 messages in descending order, then reverse for chronological order
        List<ChatMessage> dbMessages = chatMessageRepository
                .findTop10ByChatSession_IdOrderByCreatedAtDesc(sessionId);

        List<Message> messages = new ArrayList<>();
        for (int i = dbMessages.size() - 1; i >= 0; i--) {
            ChatMessage msg = dbMessages.get(i);
            if (msg.getRole() == MessageRole.USER) {
                messages.add(new UserMessage(msg.getContent()));
            } else {
                messages.add(new AssistantMessage(msg.getContent()));
            }
        }
        return messages;
    }

    private static final long EMITTER_TIMEOUT_MS = 180_000L; // 3 min

    private static final int CHARS_PER_TOKEN = 4; // rough approximation

    private static final Map<String, String> EXTENSION_CONTENT_TYPES = Map.ofEntries(
            Map.entry(".html", "text/html"),
            Map.entry(".css", "text/css"),
            Map.entry(".js", "application/javascript"),
            Map.entry(".jsx", "application/javascript"),
            Map.entry(".ts", "application/javascript"),
            Map.entry(".tsx", "application/javascript"),
            Map.entry(".json", "application/json"),
            Map.entry(".md", "text/markdown"),
            Map.entry(".xml", "application/xml"),
            Map.entry(".yaml", "application/yaml"),
            Map.entry(".yml", "application/yaml")
    );

    private String detectContentType(String path) {
        String lower = path.toLowerCase();
        return EXTENSION_CONTENT_TYPES.entrySet().stream()
                .filter(e -> lower.endsWith(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse("text/plain");
    }
}
