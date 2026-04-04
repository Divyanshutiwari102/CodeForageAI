"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.20),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,.18),transparent_30%)]" />
      <div className="mx-auto max-w-5xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-balance text-4xl font-bold leading-tight text-white sm:text-6xl"
        >
          Build. Iterate. Ship.
          <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">AI-native dev environment.</span>
        </motion.h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-slate-300">
          CodeForageAI unifies planning, coding, chat assistance, and live preview into one premium workspace.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/dashboard"><Button>Start building <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          <Button variant="ghost">Watch demo</Button>
        </div>
      </div>
    </section>
  );
}
