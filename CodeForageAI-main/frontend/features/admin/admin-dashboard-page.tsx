"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardTopbar } from "@/components/layout/dashboard-topbar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminMetrics, type AdminMetrics } from "@/services/admin";

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAdminMetrics()
      .then((data) => {
        if (mounted) setMetrics(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
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

  return (
    <DashboardShell>
      <DashboardTopbar />
      <main className="space-y-6 p-4 sm:p-6">
        <section>
          <h2 className="text-lg font-semibold text-white">Admin Metrics Dashboard</h2>
          <p className="text-sm text-slate-400">Operational counters and payment verification health.</p>
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
      </main>
    </DashboardShell>
  );
}
