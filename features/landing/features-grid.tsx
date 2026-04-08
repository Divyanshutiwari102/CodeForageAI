"use client";

import { motion } from "framer-motion";
import { Zap, Brain, Eye, FolderOpen, Users, BarChart3 } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    color: "#a855f7",
    title: "AI Code Generation",
    desc: "GPT-4o generates full-stack code — React components, APIs, database schemas — from natural language.",
  },
  {
    icon: Brain,
    color: "#f59e0b",
    title: "RAG-Powered Context",
    desc: "AI understands your entire codebase using vector embeddings. No more repeating context every message.",
  },
  {
    icon: Eye,
    color: "#22c55e",
    title: "Live Preview",
    desc: "Kubernetes-powered containers spin up your app instantly. See changes in real-time as AI writes code.",
  },
  {
    icon: FolderOpen,
    color: "#3b82f6",
    title: "Smart File Manager",
    desc: "MinIO-backed file system with full tree navigation. AI can read, write, and restructure your project files.",
  },
  {
    icon: Users,
    color: "#ec4899",
    title: "Team Collaboration",
    desc: "Invite teammates as Viewer, Editor, or Owner. Work together on the same AI workspace in real-time.",
  },
  {
    icon: BarChart3,
    color: "#06b6d4",
    title: "Usage Analytics",
    desc: "Track token usage, project activity, and subscription limits. Built-in quota management per plan.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">Capabilities</p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Everything you need to ship faster
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true }}
              className="group rounded-2xl border border-white/[0.07] p-6 transition-all duration-200 hover:border-white/15 hover:-translate-y-0.5"
              style={{ background: "#111118" }}
            >
              <div
                className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: `${feat.color}18` }}
              >
                <feat.icon className="h-5 w-5" style={{ color: feat.color }} />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-white">{feat.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
