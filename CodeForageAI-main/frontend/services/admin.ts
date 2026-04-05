import { api } from "@/services/api";

export interface AdminMetrics {
  timestamp: string;
  totalUsers: number;
  totalProjects: number;
  totalChatSessions: number;
  totalMessagesAllTime: number;
  paymentCreateOrderSuccessCount: number;
  paymentCreateOrderFailureCount: number;
  paymentVerifySuccessCount: number;
  paymentVerifyFailureCount: number;
  paymentVerifyRateLimitedCount: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const { data } = await api.get<AdminMetrics>("/metrics");
  return data;
}
