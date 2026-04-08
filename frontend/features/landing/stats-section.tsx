"use client";

import { motion } from "framer-motion";

const stats = [
  { label: "Projects generated", value: "12.4k+" },
  { label: "Avg. setup time", value: "< 30 sec" },
  { label: "Developer satisfaction", value: "98%" },
];

export function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.35 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.06] to-transparent p-6 text-center"
          >
            <p className="text-4xl font-bold tracking-tight text-white">{item.value}</p>
            <p className="mt-2 text-sm text-zinc-400">{item.label}</p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
