"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-30 border-b border-white/[0.08] bg-zinc-950/85 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 shadow-[0_0_16px_rgba(56,189,248,0.4)]">
            <Zap className="h-4 w-4 text-white" />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            CodeForage<span className="text-sky-400">AI</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-zinc-300 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#editor" className="transition hover:text-white">
            Editor
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Start building</Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
