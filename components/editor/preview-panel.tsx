"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw, Play, TriangleAlert, Monitor, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { usePreviewStore } from "@/store/usePreviewStore";
import { cn } from "@/utils/cn";

interface Props { projectId: string; }

type ViewportMode = "desktop" | "mobile";

const VIEWPORT: Record<ViewportMode, { w: string; label: string }> = {
  desktop: { w: "100%", label: "Desktop" },
  mobile:  { w: "390px", label: "Mobile 390px" },
};

export function PreviewPanel({ projectId }: Props) {
  const { previewUrl, loading, error, message, load, refresh, subscribeLive } = usePreviewStore();
  const [viewport, setViewport] = useState<ViewportMode>("desktop");
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => { void load(projectId); }, [load, projectId]);
  useEffect(() => { return subscribeLive(projectId); }, [projectId, subscribeLive]);

  const handleRefresh = useCallback(async () => {
    const id = toast.loading("Refreshing preview…");
    await refresh(projectId);
    const { error: e } = usePreviewStore.getState();
    if (e) { toast.error(e, { id }); return; }
    toast.success("Preview refreshed", { id });
    setIframeKey((k) => k + 1);
  }, [projectId, refresh]);

  return (
    <section
      className="flex h-full flex-col"
      style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", background: "#0a0a12" }}
      aria-label="Preview panel"
    >
      {/* Header */}
      <header className="flex flex-shrink-0 items-center gap-2 border-b border-white/[0.05] px-3 py-2">
        {/* URL bar */}
        <div
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5"
        >
          <div className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", previewUrl ? "bg-emerald-400" : "bg-white/20")} />
          <p className="truncate text-[11px] text-white/35 font-mono">
            {previewUrl ?? "No preview URL yet"}
          </p>
        </div>

        {/* Viewport toggles */}
        <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5">
          {(["desktop", "mobile"] as ViewportMode[]).map((v) => (
            <motion.button
              key={v}
              onClick={() => setViewport(v)}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
                viewport === v ? "bg-white/[0.1] text-white/80" : "text-white/25 hover:text-white/50",
              )}
              whileTap={{ scale: 0.85 }}
              title={VIEWPORT[v].label}
            >
              {v === "desktop" ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
            </motion.button>
          ))}
        </div>

        {/* Refresh */}
        <motion.button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/35 transition-colors hover:bg-white/[0.08] hover:text-white/70 disabled:opacity-40"
          whileTap={{ scale: 0.85 }}
          title="Refresh preview"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
        </motion.button>

        {/* External link */}
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-white/35 transition-colors hover:bg-white/[0.08] hover:text-white/70"
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </header>

      {/* Preview area */}
      <div className="relative flex-1 overflow-hidden p-3">
        <AnimatePresence mode="wait">
          {/* Loading skeleton */}
          {loading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-400" />
              <p className="text-xs text-white/25">{message ?? "Starting preview…"}</p>
            </motion.div>
          )}

          {/* Error state */}
          {!loading && error && (
            <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
                  <TriangleAlert className="h-5 w-5 text-red-400" />
                </div>
                <p className="mb-4 text-sm text-red-300/80">{error}</p>
                <motion.button type="button" onClick={() => void handleRefresh()}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20"
                  whileTap={{ scale: 0.97 }}>
                  Retry
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* No URL yet */}
          {!loading && !error && !previewUrl && (
            <motion.div key="empty" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center">
              <div className="w-full max-w-sm rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Play className="h-5 w-5 text-violet-400" />
                </div>
                <p className="mb-1.5 text-sm font-medium text-white/60">Preview ready to start</p>
                <p className="mb-4 text-xs text-white/30">{message ?? "Start your app with AI chat"}</p>
                <motion.button type="button" onClick={() => void handleRefresh()}
                  className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-500"
                  whileTap={{ scale: 0.97 }}>
                  Start preview
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Live iframe */}
          {!loading && !error && previewUrl && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex h-full flex-col items-center">
              <motion.div
                animate={{ width: viewport === "mobile" ? VIEWPORT.mobile.w : VIEWPORT.desktop.w }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative h-full overflow-hidden rounded-xl border border-white/[0.08] shadow-2xl"
                style={{ maxWidth: "100%" }}
              >
                {/* Browser chrome */}
                <div className="flex items-center gap-1.5 border-b border-white/[0.05] bg-white/[0.02] px-3 py-1.5">
                  {["#ff5f56","#ffbd2e","#27c93f"].map((c) => (
                    <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
                  ))}
                  <span className="ml-2 text-[10px] text-white/20 truncate font-mono">
                    {previewUrl.replace(/^https?:\/\//, "")}
                  </span>
                </div>
                <iframe
                  key={iframeKey}
                  src={previewUrl}
                  title="Project preview"
                  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                  className="w-full bg-white"
                  style={{ height: "calc(100% - 30px)" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
