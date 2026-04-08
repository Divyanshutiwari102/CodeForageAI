"use client";

import { motion } from "framer-motion";
import { Bot, Eye, GitMerge, Shield, Terminal, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

const items = [
  {
    icon: Zap,
    title: "Instant scaffolding",
    text: "AI generates project architecture with production defaults in seconds.",
    color: "text-yellow-400",
  },
  {
    icon: Bot,
    title: "Integrated copilot",
    text: "Ask, refactor, and debug without leaving your editor context.",
    color: "text-sky-400",
  },
  {
    icon: Eye,
    title: "Live preview",
    text: "Validate UI instantly with hot-reloading and device simulation.",
    color: "text-emerald-400",
  },
  {
    icon: GitMerge,
    title: "Smart commits",
    text: "Save AI chat sessions as semantic commits automatically.",
    color: "text-purple-400",
  },
  {
    icon: Terminal,
    title: "Full IDE",
    text: "Monaco-powered editor with syntax highlighting, tabs, and file tree.",
    color: "text-orange-400",
  },
  {
    icon: Shield,
    title: "Enterprise ready",
    text: "RBAC, audit logs, and team collaboration built in from day one.",
    color: "text-rose-400",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything in one workspace</h2>
        <p className="mt-3 text-zinc-400">No context switching. No duct tape. Just flow.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <Card variant="interactive" glow className="flex h-full flex-col gap-4 p-6">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] ${item.color}`}>
                <item.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{item.text}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
