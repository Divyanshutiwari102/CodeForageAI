package com.CodeForageAI.Project.CodeForageAI.service;

import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderRequest;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.CreateOrderResponse;
import com.CodeForageAI.Project.CodeForageAI.dto.payment.VerifyPaymentRequest;

public interface RazorpayService {
    CreateOrderResponse createOrder(Long userId, CreateOrderRequest request);
    void verifyAndActivate(Long userId, VerifyPaymentRequest request);
}