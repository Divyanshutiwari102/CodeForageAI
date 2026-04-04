package com.CodeForageAI.Project.CodeForageAI.service;

public interface RazorpayWebhookService {
    void handleWebhook(String payload, String signature);
}