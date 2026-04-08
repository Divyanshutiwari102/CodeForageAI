package com.CodeForageAI.Project.CodeForageAI.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class LogAggregationService {

    private final RestClient restClient;

    @Value("${observability.logs.loki.endpoint:http://localhost:3100}")
    private String lokiEndpoint;

    @SuppressWarnings("unchecked")
    public Map<String, Object> searchByTraceId(String traceId, int limit) {
        if (traceId == null || traceId.isBlank()) {
            return Map.of("status", "error", "message", "traceId is required");
        }

        String query = "{traceId=\"" + traceId.trim() + "\"}";
        long nowNanos = Instant.now().toEpochMilli() * 1_000_000L;
        long startNanos = nowNanos - (60L * 60L * 1_000_000_000L);
        String url = UriComponentsBuilder.fromHttpUrl(lokiEndpoint)
                .path("/loki/api/v1/query_range")
                .queryParam("query", query)
                .queryParam("limit", Math.max(1, Math.min(limit, 500)))
                .queryParam("start", startNanos)
                .queryParam("end", nowNanos)
                .encode()
                .toUriString();

        try {
            Map<String, Object> response = restClient.get()
                    .uri(url)
                    .accept(MediaType.APPLICATION_JSON)
                    .retrieve()
                    .body(Map.class);

            return response != null ? response : Map.of("status", "success", "data", Map.of("result", List.of()));
        } catch (Exception ex) {
            log.warn("Failed centralized log search traceId={} message={}", traceId, ex.getMessage());
            return Map.of("status", "error", "message", "Unable to query centralized logs");
        }
    }
}
