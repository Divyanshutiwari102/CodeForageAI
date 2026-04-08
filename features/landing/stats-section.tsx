"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "12.4k+", label: "Projects generated" },
  { value: "< 30s", label: "Average setup time" },
  { value: "98%", label: "Developer satisfaction" },
  { value: "99.9%", label: "Uptime SLA" },
];

export function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            viewport={{ once: true }}
            className="rounded-2xl border p-5 text-center"
            style={{ background: "#111118", borderColor: "rgba(255,255,255,0.07)" }}
          >
            <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-heading)" }}>
              {item.value}
            </p>
            <p className="mt-1 text-sm text-white/40">{item.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
