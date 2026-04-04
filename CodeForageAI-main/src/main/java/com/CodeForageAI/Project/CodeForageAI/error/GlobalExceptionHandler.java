package com.CodeForageAI.Project.CodeForageAI.error;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(QuotaExceededException.class)
    public ResponseEntity<ApiError> handleQuotaExceeded(QuotaExceededException ex) {
        ApiError apiError = new ApiError(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage());
        log.warn("Quota exceeded: {}", ex.getMessage());
        return ResponseEntity.status(apiError.status()).body(apiError);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiError> handleBadRequest(BadRequestException ex) {
        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST, ex.getMessage());
        log.warn("Bad request: {}", ex.getMessage());
        return ResponseEntity.status(apiError.status()).body(apiError);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiError apiError = new ApiError(HttpStatus.NOT_FOUND, ex.getResourceName() + " with id " + ex.getResourceId() + " not found");
        log.warn("Resource not found: {} id={}", ex.getResourceName(), ex.getResourceId());
        return ResponseEntity.status(apiError.status()).body(apiError);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleInputValidationError(MethodArgumentNotValidException ex) {
        List<ApiFieldError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiFieldError(error.getField(), error.getDefaultMessage()))
                .toList();

        ApiError apiError = new ApiError(HttpStatus.BAD_REQUEST, "Input Validation Failed", errors);
        log.warn("Validation failed: {}", errors);
        return ResponseEntity.status(apiError.status()).body(apiError);
    }

    // MinIO operations throw IllegalStateException on failure
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex) {
        ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "Storage operation failed: " + ex.getMessage());
        log.error("Storage/state error", ex);
        return ResponseEntity.status(apiError.status()).body(apiError);
    }

    // Kubernetes, AI, and other runtime failures
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiError> handleRuntimeException(RuntimeException ex) {
        ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        log.error("Unexpected runtime error: {}", ex.getMessage(), ex);
        return ResponseEntity.status(apiError.status()).body(apiError);
    }

    // Final fallback for any unhandled exception
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        ApiError apiError = new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(apiError.status()).body(apiError);
    }

}
