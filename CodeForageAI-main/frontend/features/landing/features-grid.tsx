"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

const items = [
  { title: "Smart project scaffolding", text: "Launch new ideas with AI-generated architecture and production defaults." },
  { title: "Integrated AI copilot", text: "Ask, refactor, and debug without leaving your editor context." },
  { title: "Live preview and deploy", text: "Validate UI instantly and hand off with confidence." },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
      {items.map((item, index) => (
        <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} viewport={{ once: true }}>
          <Card className="h-full p-5 transition hover:-translate-y-1 hover:border-cyan-300/30">
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.text}</p>
          </Card>
        </motion.div>
      ))}
    </section>
  );
}
