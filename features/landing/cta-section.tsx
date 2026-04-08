import Link from "next/link";

export function CTASection() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl p-12 text-center"
        style={{
          background:
            "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(124,58,237,0.2) 0%, transparent 70%), #111118",
          border: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        {/* Glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 50% 0%, rgba(168,85,247,0.3) 0%, transparent 60%)",
          }}
        />
        <p className="relative mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
          Ready to ship?
        </p>
        <h2
          className="relative mb-4 text-3xl font-bold text-white sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Build your first app today
        </h2>
        <p className="relative mx-auto mb-8 max-w-lg text-base text-white/50">
          From prompt to production in minutes. No credit card required.
        </p>
        <div className="relative flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90 active:scale-95"
          >
            Get started free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white active:scale-95"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}
