"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, error, login, signup } = useAuthStore();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const toastId = toast.loading(mode === "login" ? "Signing in..." : "Creating account...");
    const success =
      mode === "login"
        ? await login({ username: email, password })
        : await signup({ username: email, name, password });

    if (success) {
      toast.success(mode === "login" ? "Welcome back!" : "Account created!", { id: toastId });
      router.replace("/dashboard");
      return;
    }
    toast.dismiss(toastId);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      {/* Gradient background — Lovable style */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 50% -10%, rgba(109,40,217,0.35) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 85% 65%, rgba(37,99,235,0.18) 0%, transparent 65%), #0a0a0f",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 shadow-lg shadow-violet-500/25">
            <span className="text-xl font-bold text-white">⬡</span>
          </div>
          <h1 className="text-xl font-semibold text-white">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-white/40">
            {mode === "login"
              ? "Sign in to continue building"
              : "Start building with AI today"}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] p-7" style={{ background: "#13131c" }}>
          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Full name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Divyanshu Tiwari"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Password</label>
              <div className="relative">
                <input
                  required
                  minLength={8}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400 ring-1 ring-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 mt-1"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  {mode === "login" ? "Sign in" : "Create account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-white/30">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="text-violet-400 transition hover:text-violet-300"
          >
            {mode === "login" ? "Sign up free" : "Sign in"}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
