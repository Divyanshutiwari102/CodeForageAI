"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, RefreshCw } from "lucide-react";
import { getAuditLogs, type AuditLog } from "@/services/admin";

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const page = await getAuditLogs();
      setLogs(page.content ?? []);
    } catch { setLogs([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  return (
    <div className="rounded-2xl border" style={{ background: "#0f0f18", borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Audit Log</h3>
        </div>
        <button onClick={() => void load()} disabled={loading}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] text-white/40 transition-colors hover:text-white/70 disabled:opacity-40">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>
      <div className="max-h-96 overflow-auto">
        {loading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-sm text-white/25">No audit events yet</div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {logs.map((log, i) => (
              <motion.li key={log.id ?? i}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-start gap-3 px-5 py-3">
                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400/60" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white/75">{log.action}</p>
                  <p className="mt-0.5 truncate text-[11px] font-mono text-white/30">{log.method} {log.path}</p>
                </div>
                <span className="flex-shrink-0 text-[10px] text-white/20">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
