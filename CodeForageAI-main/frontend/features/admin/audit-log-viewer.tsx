"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuditLogs, type AuditLog } from "@/services/admin";

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [traceFilter, setTraceFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    getAuditLogs(page, 10, traceFilter || undefined)
      .then((data) => {
        if (!mounted) return;
        setLogs(data.content);
        setTotalPages(data.totalPages);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [page, traceFilter]);

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-white">Audit Log Viewer</p>
        <input
          value={traceFilter}
          onChange={(e) => {
            setPage(0);
            setTraceFilter(e.target.value);
          }}
          placeholder="Filter by traceId"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="p-2">Time</th>
                <th className="p-2">Action</th>
                <th className="p-2">Path</th>
                <th className="p-2">Status</th>
                <th className="p-2">User</th>
                <th className="p-2">Trace</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-900/70">
                  <td className="p-2">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-2">{log.method} {log.action}</td>
                  <td className="max-w-[320px] truncate p-2" title={log.path}>{log.path}</td>
                  <td className="p-2">{log.statusCode}</td>
                  <td className="p-2">{log.userId ?? "-"}</td>
                  <td className="max-w-[240px] truncate p-2" title={log.traceId}>{log.traceId}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 ? <p className="mt-3 text-xs text-slate-500">No audit records found.</p> : null}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 disabled:opacity-40"
        >
          Prev
        </button>
        <p className="text-xs text-slate-500">Page {page + 1} / {Math.max(totalPages, 1)}</p>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </Card>
  );
}
