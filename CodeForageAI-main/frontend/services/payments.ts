import { api } from "@/services/api";

export interface CreateOrderRequest {
  planId: number;
  amount: number;
  currency: string;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface VerifyPaymentRequest {
  planId: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
  const { data } = await api.post<CreateOrderResponse>("/payments/create-order", payload);
  return data;
}

export async function verifyPayment(payload: VerifyPaymentRequest): Promise<void> {
  await api.post("/payment/verify", payload);
}
