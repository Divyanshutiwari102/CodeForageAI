"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { useAuthStore } from "@/store/useAuthStore";

export function Navbar() {
  const { theme, toggle } = useTheme();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06]"
      style={{ background: "rgba(10,10,15,0.8)", backdropFilter: "blur(20px)" }}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600">
            <span className="text-sm font-bold text-white">⬡</span>
          </div>
          <span className="text-sm font-semibold text-white">
            CodeForage<span className="text-violet-400">AI</span>
          </span>
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {["Solutions", "Resources", "Pricing", "Community", "Security"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="rounded-lg px-3 py-1.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white/80"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white/70"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90 active:scale-95"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-1.5 text-sm text-white/60 transition hover:bg-white/5 hover:text-white/80"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-white px-4 py-1.5 text-sm font-medium text-black transition hover:bg-white/90 active:scale-95"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
