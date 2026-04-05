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
  paymentCreateOrderFailureRatePercent: number;
  paymentVerifyFailureRatePercent: number;
  paymentHighFailureRateAlertActive: boolean;
  paymentHighFailureRateAlertCount: number;
  paymentHighFailureRateThresholdPercent: number;
  paymentRateLimiterCircuitOpen: boolean;
  paymentRateLimiterCircuitOpenUntilEpochSecond: number;
  paymentRateLimiterConsecutiveRedisFailures: number;
  paymentRateLimiterCircuitOpenCount: number;
  paymentRateLimiterFallbackAllowCount: number;
  paymentRateLimiterFallbackDenyCount: number;
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const { data } = await api.get<AdminMetrics>("/metrics");
  return data;
}


export interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  path: string;
  method: string;
  statusCode: number;
  detail: string;
  traceId: string;
  createdAt: string;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function getAuditLogs(page = 0, size = 20, traceId?: string): Promise<AuditLogPage> {
  const { data } = await api.get<AuditLogPage>("/admin/audit-logs", {
    params: { page, size, ...(traceId ? { traceId } : {}) },
  });
  return data;
}

export interface CentralizedLogSearchResponse {
  status?: string;
  data?: {
    resultType?: string;
    result?: Array<{
      stream?: Record<string, string>;
      values?: string[][];
    }>;
  };
  message?: string;
}

export async function searchCentralizedLogsByTraceId(traceId: string, limit = 100): Promise<CentralizedLogSearchResponse> {
  const { data } = await api.get<CentralizedLogSearchResponse>(`/admin/audit-logs/${encodeURIComponent(traceId)}/search`, {
    params: { limit },
  });
  return data;
}
