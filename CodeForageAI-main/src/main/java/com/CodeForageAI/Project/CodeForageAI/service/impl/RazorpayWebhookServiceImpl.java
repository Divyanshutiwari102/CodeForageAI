package com.CodeForageAI.Project.CodeForageAI.service.impl;

import com.CodeForageAI.Project.CodeForageAI.error.BadRequestException;
import com.CodeForageAI.Project.CodeForageAI.service.RazorpayWebhookService;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RazorpayWebhookServiceImpl implements RazorpayWebhookService {

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    @Override
    public void handleWebhook(String payload, String signature) {
        try {
            boolean isValid = Utils.verifyWebhookSignature(payload, signature, webhookSecret);
            if (!isValid) {
                throw new BadRequestException("Invalid Razorpay webhook signature");
            }

            JSONObject event = new JSONObject(payload);
            String eventType = event.optString("event");

            log.info("Razorpay webhook received: {}", eventType);

            // TODO: event based handling
            // payment.captured
            // subscription.charged
            // subscription.cancelled
            // etc.
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Razorpay webhook processing failed", e);
            throw new BadRequestException("Webhook processing failed: " + e.getMessage());
        }
    }
}