"use client";

import { RotateCw } from "lucide-react";

interface Props {
  previewUrl: string | null;
  loading: boolean;
  error?: string | null;
  message?: string | null;
  onRefresh: () => Promise<void>;
}

export function PreviewPanel({ previewUrl, loading, error, message, onRefresh }: Props) {
  async function handleRefreshClick() {
    try {
      await onRefresh();
    } catch {
      return;
    }
  }

  return (
    <section className="h-full border-l border-white/10 bg-slate-950/75">
      <header className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-sm font-medium">
        <span>Preview</span>
        <button
          onClick={() => void handleRefreshClick()}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-200 hover:bg-white/10"
        >
          <RotateCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>
      <div className="grid h-[calc(100%-41px)] place-items-center p-3">
        {loading ? <div className="h-full w-full animate-pulse rounded-xl border border-white/10 bg-white/5" /> : null}
        {!loading && error ? (
          <div className="w-full rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-center text-xs text-rose-200">{error}</div>
        ) : null}
        {!loading && !error && previewUrl ? (
          <iframe
            src={previewUrl}
            title="Project preview"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            className="h-full w-full rounded-xl border border-white/10 bg-white"
          />
        ) : null}
        {!loading && !error && !previewUrl ? (
          <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xs text-slate-400">
            {message || "Preview is not ready yet."}
          </div>
        ) : null}
      </div>
    </section>
  );
}
