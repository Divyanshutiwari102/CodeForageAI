package com.CodeForageAI.Project.CodeForageAI.service.notification.impl;

import com.CodeForageAI.Project.CodeForageAI.dto.alert.AlertNotification;
import com.CodeForageAI.Project.CodeForageAI.service.notification.AlertNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class AlertNotificationServiceImpl implements AlertNotificationService {

    private final RestClient restClient;
    private final JavaMailSender javaMailSender;

    @Value("${observability.alerts.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${observability.alerts.email.recipients:}")
    private String emailRecipients;

    @Value("${observability.alerts.slack.enabled:false}")
    private boolean slackEnabled;

    @Value("${observability.alerts.slack.webhook-url:}")
    private String slackWebhookUrl;

    @Value("${observability.alerts.slack.channel:#alerts}")
    private String slackChannel;

    @Value("${observability.alerts.slack.username:CodeForageAI Alerts}")
    private String slackUsername;

    @Override
    public void notify(AlertNotification notification) {
        if (emailEnabled) {
            sendEmail(notification);
        }
        if (slackEnabled) {
            sendSlack(notification);
        }
    }

    private void sendEmail(AlertNotification notification) {
        String[] recipients = Arrays.stream(emailRecipients.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .toArray(String[]::new);
        if (recipients.length == 0) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(recipients);
            message.setSubject("[CodeForageAI][" + notification.severity() + "] " + notification.title());
            message.setText(notification.timestamp() + "\n\n" + notification.message());
            javaMailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send alert email message={}", ex.getMessage());
        }
    }

    private void sendSlack(AlertNotification notification) {
        if (slackWebhookUrl == null || slackWebhookUrl.isBlank()) {
            return;
        }

        try {
            Map<String, Object> payload = Map.of(
                    "channel", slackChannel,
                    "username", slackUsername,
                    "text", "[" + notification.severity() + "] " + notification.title() + "\n" + notification.message()
            );
            restClient.post()
                    .uri(slackWebhookUrl)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Failed to send slack alert message={}", ex.getMessage());
        }
    }
}
