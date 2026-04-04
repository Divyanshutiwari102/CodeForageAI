package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.service.EmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmbeddingServiceImpl implements EmbeddingService {

    private final EmbeddingModel embeddingModel;

    private static final int MAX_EMBEDDING_CHARS = 6000;

    @Override
    public List<Float> embed(String text) {
        // OpenAI ada-002 limit is 8192 tokens — truncate large content to be safe
        String truncated = text.length() > MAX_EMBEDDING_CHARS
                ? text.substring(0, MAX_EMBEDDING_CHARS)
                : text;

        Exception lastException = null;
        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                float[] embeddings = embeddingModel.embed(truncated);
                List<Float> result = new ArrayList<>(embeddings.length);
                for (float f : embeddings) {
                    result.add(f);
                }
                return result;
            } catch (Exception e) {
                lastException = e;
                log.warn("Attempt {}/3 failed to generate embedding: {}", attempt, e.getMessage());
            }
        }
        log.error("Failed to generate embedding after 3 attempts", lastException);
        throw new RuntimeException("Failed to generate embedding", lastException);
    }
}
