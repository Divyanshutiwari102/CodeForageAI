"use client";

import { useEffect } from "react";
import { ExternalLink, Play, RotateCw, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { usePreviewStore } from "@/store/usePreviewStore";

interface Props {
  projectId: string;
}

export function PreviewPanel({ projectId }: Props) {
  const { previewUrl, loading, error, message, load, refresh, subscribeLive } = usePreviewStore();

  useEffect(() => {
    void load(projectId);
  }, [load, projectId]);

  useEffect(() => {
    return subscribeLive(projectId);
  }, [projectId, subscribeLive]);

  async function handleRefresh() {
    const toastId = toast.loading("Refreshing preview...");
    await refresh(projectId);
    const { error: latestError } = usePreviewStore.getState();
    if (latestError) {
      toast.error(latestError, { id: toastId });
      return;
    }
    toast.success("Preview updated", { id: toastId });
  }

  return (
    <section className="h-full border-l border-white/10 bg-slate-950/75">
      <header className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <div className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-300">
          <p className="truncate">{previewUrl ?? "No preview URL yet"}</p>
        </div>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>
      <div className="h-[calc(100%-41px)] p-3">
        {loading ? (
          <div className="h-full w-full animate-pulse rounded-xl border border-white/10 bg-white/5 transition-all" />
        ) : null}

        {!loading && error ? (
          <div className="grid h-full place-items-center">
            <div className="w-full max-w-sm rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-center text-xs text-rose-200">
              <TriangleAlert className="mx-auto mb-2 h-4 w-4" />
              <p className="mb-3">{error}</p>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                className="rounded-md border border-rose-300/30 bg-rose-400/10 px-3 py-1.5 text-[11px] font-medium text-rose-100 transition hover:bg-rose-400/20"
              >
                Retry
              </button>
            </div>
          </div>
        ) : null}

        {!loading && !error && previewUrl ? (
          <div className="h-full overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-200">
            <div className="flex items-center justify-between border-b border-white/10 px-2 py-1.5 text-[11px] text-slate-300">
              <span className="truncate pr-2">Live preview</span>
              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-cyan-300 transition hover:text-cyan-200"
              >
                Open
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <iframe
              src={previewUrl}
              title="Project preview"
              sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
              className="h-[calc(100%-30px)] w-full bg-white"
            />
          </div>
        ) : null}

        {!loading && !error && !previewUrl ? (
          <div className="grid h-full place-items-center">
            <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xs text-slate-300">
              <p className="mb-3">{message || "Preview is not ready yet."}</p>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                className="inline-flex items-center gap-1 rounded-md border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-medium text-cyan-100 transition hover:bg-cyan-400/20"
              >
                <Play className="h-3 w-3" />
                Start preview
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
