"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-24 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-sky-500/[0.07] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[360px] w-[500px] rounded-full bg-indigo-500/[0.06] blur-[100px]" />
        <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-4 py-1.5"
        >
          <Sparkles className="h-3 w-3 text-sky-400" />
          <span className="text-xs font-medium text-sky-300">AI-native development, reimagined</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          Build faster with
          <br />
          <span className="text-gradient">AI at your side</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-zinc-400"
        >
          CodeForageAI unifies planning, coding, AI assistance, and live preview into one seamless workspace.
          From first prompt to production.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        >
          <Link href="/dashboard">
            <Button size="lg" className="min-w-44" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start building
            </Button>
          </Link>
          <Button variant="secondary" size="lg">
            Watch the demo
          </Button>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-8 text-xs text-zinc-600">
          Trusted by <span className="text-zinc-400">2,400+</span> developers worldwide
        </motion.p>
      </div>
    </section>
  );
}
