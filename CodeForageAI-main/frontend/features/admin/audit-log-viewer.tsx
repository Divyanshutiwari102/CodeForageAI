"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAuditLogs, searchCentralizedLogsByTraceId, type AuditLog } from "@/services/admin";

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [traceFilter, setTraceFilter] = useState("");
  const [traceSearchTarget, setTraceSearchTarget] = useState<string | null>(null);
  const [traceResults, setTraceResults] = useState<string[]>([]);
  const [traceLoading, setTraceLoading] = useState(false);

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

  useEffect(() => {
    if (!traceSearchTarget) return;
    let mounted = true;
    setTraceLoading(true);
    searchCentralizedLogsByTraceId(traceSearchTarget)
      .then((data) => {
        if (!mounted) return;
        const lines =
          data.data?.result?.flatMap((item) =>
            (item.values ?? []).map((entry) => {
              const timestamp = entry[0];
              const message = entry[1];
              return `${timestamp} ${message}`;
            }),
          ) ?? [];
        setTraceResults(lines);
      })
      .catch(() => {
        if (mounted) {
          setTraceResults(["Centralized log lookup failed"]);
        }
      })
      .finally(() => {
        if (mounted) setTraceLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [traceSearchTarget]);

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
                  <td className="max-w-[240px] truncate p-2" title={log.traceId}>
                    <button
                      type="button"
                      className="text-left text-cyan-300 hover:text-cyan-200"
                      onClick={() => setTraceSearchTarget(log.traceId)}
                    >
                      {log.traceId}
                    </button>
                  </td>
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

      {traceSearchTarget ? (
        <div className="mt-4 rounded border border-slate-800 bg-slate-950/40 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-medium text-white">Centralized logs for traceId: {traceSearchTarget}</p>
            <button
              type="button"
              className="text-xs text-slate-400 hover:text-slate-200"
              onClick={() => {
                setTraceSearchTarget(null);
                setTraceResults([]);
              }}
            >
              Close
            </button>
          </div>
          {traceLoading ? (
            <Skeleton className="h-16" />
          ) : (
            <div className="max-h-48 overflow-auto rounded bg-slate-900 p-2 text-[11px] text-slate-300">
              {traceResults.length ? traceResults.map((line, idx) => <p key={idx}>{line}</p>) : <p>No centralized logs found.</p>}
            </div>
          )}
        </div>
      ) : null}
    </Card>
  );
}
