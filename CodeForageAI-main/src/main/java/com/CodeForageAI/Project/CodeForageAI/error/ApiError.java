package com.CodeForageAI.Project.CodeForageAI.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.util.List;

public record ApiError(
        HttpStatus status,
        String message,
        String traceId,
        Instant timestamp,
        @JsonInclude(JsonInclude.Include.NON_NULL) List<ApiFieldError> errors
) {
    public ApiError(HttpStatus status, String message, String traceId) {
        this(status, message, traceId, Instant.now(), null);
    }

    public ApiError(HttpStatus status, String message, String traceId, List<ApiFieldError> errors) {
        this(status, message, traceId, Instant.now(), errors);
    }
}

record ApiFieldError(String field, String message){}