"use client";

export function PreviewPanel() {
  return (
    <section className="h-full border-l border-white/10 bg-slate-950/75">
      <header className="border-b border-white/10 px-3 py-2 text-sm font-medium">Preview</header>
      <div className="grid h-[calc(100%-41px)] place-items-center p-3">
        <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-center text-xs text-slate-400">
          Live preview endpoint ready.
        </div>
      </div>
    </section>
  );
}
