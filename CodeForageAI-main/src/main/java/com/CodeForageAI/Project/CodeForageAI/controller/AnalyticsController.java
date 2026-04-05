package com.CodeForageAI.Project.CodeForageAI.controller;

import com.CodeForageAI.Project.CodeForageAI.dto.health.AnalyticsResponse;
import com.CodeForageAI.Project.CodeForageAI.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(new AnalyticsResponse(
                Instant.now(),
                analyticsService.getProjectCreatedCount(),
                analyticsService.getChatUsageCount(),
                analyticsService.getPreviewUsageCount()
        ));
    }
}
