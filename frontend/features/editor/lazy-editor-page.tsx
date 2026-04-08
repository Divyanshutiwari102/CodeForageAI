"use client";

import dynamic from "next/dynamic";

const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-zinc-950">
    <div className="space-y-2 text-center">
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-1/2 animate-[shimmer_1.5s_infinite] rounded-full bg-sky-500" />
      </div>
      <p className="text-xs text-zinc-600">Loading workspace…</p>
    </div>
  </div>
);

const EditorPage = dynamic(() => import("@/features/editor/editor-page").then((module) => module.EditorPage), {
  ssr: false,
  loading: LoadingFallback,
});

export function LazyEditorPage({ projectId }: { projectId: string }) {
  return <EditorPage projectId={projectId} />;
}
