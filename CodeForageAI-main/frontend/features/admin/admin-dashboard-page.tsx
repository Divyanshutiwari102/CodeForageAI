"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminMetrics, type AdminMetrics } from "@/services/admin";
import { AuditLogViewer } from "@/features/admin/audit-log-viewer";

function MiniBarChart({
  title,
  values,
  labels,
}: {
  title: string;
  values: number[];
  labels: string[];
}) {
  const max = Math.max(...values, 1);
  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-medium text-white">{title}</p>
      <div className="space-y-2">
        {values.map((value, idx) => {
          const width = `${Math.max(6, Math.round((value / max) * 100))}%`;
          return (
            <div key={labels[idx]}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                <span>{labels[idx]}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 w-full rounded bg-slate-800">
                <div className="h-2 rounded bg-cyan-400" style={{ width }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    const loadMetrics = async () => {
      try {
        const data = await getAdminMetrics();
        if (mounted) setMetrics(data);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadMetrics();
    intervalId = setInterval(() => {
      void loadMetrics();
    }, 10000);

    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const cards = metrics
    ? [
        { label: "Users", value: metrics.totalUsers },
        { label: "Projects", value: metrics.totalProjects },
        { label: "Chat Sessions", value: metrics.totalChatSessions },
        { label: "Messages", value: metrics.totalMessagesAllTime },
        { label: "Create Order Success", value: metrics.paymentCreateOrderSuccessCount },
        { label: "Create Order Failure", value: metrics.paymentCreateOrderFailureCount },
        { label: "Verify Success", value: metrics.paymentVerifySuccessCount },
        { label: "Verify Failure", value: metrics.paymentVerifyFailureCount },
        { label: "Verify Rate Limited", value: metrics.paymentVerifyRateLimitedCount },
      ]
    : [];

  const circuitOpenUntil = metrics?.paymentRateLimiterCircuitOpenUntilEpochSecond
    ? new Date(metrics.paymentRateLimiterCircuitOpenUntilEpochSecond * 1000).toLocaleString()
    : "-";

  return (
    <DashboardShell>
      <DashboardTopbar />
      <main className="space-y-6 p-4 sm:p-6">
        <section>
          <h2 className="text-lg font-semibold text-white">Admin Metrics Dashboard</h2>
          <p className="text-sm text-slate-400">Operational counters, Redis reliability, and payment verification health (live refresh every 10s).</p>
          {metrics ? (
            <p className="mt-2 text-xs text-slate-500">Last updated: {new Date(metrics.timestamp).toLocaleString()}</p>
          ) : null}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            : cards.map((item) => (
                <Card key={item.label} className="p-4">
                  <p className="text-xs text-slate-400">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </Card>
              ))}
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {loading || !metrics ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <Card className="p-4">
                <p className="text-xs text-slate-400">Create Failure Rate</p>
                <p className="mt-2 text-xl font-semibold text-white">{metrics.paymentCreateOrderFailureRatePercent.toFixed(2)}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-400">Verify Failure Rate</p>
                <p className="mt-2 text-xl font-semibold text-white">{metrics.paymentVerifyFailureRatePercent.toFixed(2)}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-400">Failure Alert Status</p>
                <p className={`mt-2 text-xl font-semibold ${metrics.paymentHighFailureRateAlertActive ? "text-red-300" : "text-emerald-300"}`}>
                  {metrics.paymentHighFailureRateAlertActive ? "ACTIVE" : "NORMAL"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-400">Failure Alert Count</p>
                <p className="mt-2 text-xl font-semibold text-white">{metrics.paymentHighFailureRateAlertCount}</p>
                <p className="mt-1 text-xs text-slate-500">Threshold: {metrics.paymentHighFailureRateThresholdPercent}%</p>
              </Card>
            </>
          )}
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          {loading || !metrics ? (
            Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-48" />)
          ) : (
            <>
              <MiniBarChart
                title="Payment Pipeline"
                labels={["Create Success", "Create Failure", "Verify Success", "Verify Failure", "Rate Limited"]}
                values={[
                  metrics.paymentCreateOrderSuccessCount,
                  metrics.paymentCreateOrderFailureCount,
                  metrics.paymentVerifySuccessCount,
                  metrics.paymentVerifyFailureCount,
                  metrics.paymentVerifyRateLimitedCount,
                ]}
              />
              <MiniBarChart
                title="Redis Limiter Reliability"
                labels={["Consecutive Failures", "Circuit Opens", "Fallback Allow", "Fallback Deny"]}
                values={[
                  metrics.paymentRateLimiterConsecutiveRedisFailures,
                  metrics.paymentRateLimiterCircuitOpenCount,
                  metrics.paymentRateLimiterFallbackAllowCount,
                  metrics.paymentRateLimiterFallbackDenyCount,
                ]}
              />
            </>
          )}
        </section>


        <section className="space-y-2">
          <h3 className="text-base font-semibold text-white">Audit Trail</h3>
          <p className="text-sm text-slate-400">Trace-aware request audit logs for debugging across services.</p>
          <AuditLogViewer />
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {loading || !metrics ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : (
            <>
              <Card className="p-4">
                <p className="text-xs text-slate-400">Redis Circuit State</p>
                <p className={`mt-2 text-xl font-semibold ${metrics.paymentRateLimiterCircuitOpen ? "text-amber-300" : "text-emerald-300"}`}>
                  {metrics.paymentRateLimiterCircuitOpen ? "OPEN" : "CLOSED"}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-400">Circuit Open Until</p>
                <p className="mt-2 text-sm font-semibold text-white">{circuitOpenUntil}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-slate-400">Monitoring Visibility</p>
                <p className="mt-2 text-sm font-semibold text-white">Limiter + Fallback + Circuit + Alert telemetry active</p>
              </Card>
            </>
          )}
        </section>
      </main>
    </DashboardShell>
  );
}
