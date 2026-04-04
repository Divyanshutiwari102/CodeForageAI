const stats = [
  { label: "Projects generated", value: "12.4k+" },
  { label: "Avg. setup time", value: "< 30 sec" },
  { label: "Developer satisfaction", value: "98%" },
];

export function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
            <p className="text-2xl font-semibold text-white">{item.value}</p>
            <p className="mt-1 text-sm text-slate-300">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
