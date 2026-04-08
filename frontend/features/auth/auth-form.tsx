"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/utils/cn";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = cn(
  "w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-zinc-100",
  "placeholder:text-zinc-600",
  "outline-none ring-0 transition-all duration-150",
  "focus:border-sky-400/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-sky-400/20",
);

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const { isLoading, error, login, signup } = useAuthStore();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const toastId = toast.loading(mode === "login" ? "Signing in…" : "Creating account…");
    const success =
      mode === "login"
        ? await login({ username: email, password })
        : await signup({ username: email, name, password });

    if (success) {
      toast.success(mode === "login" ? "Welcome back!" : "Account created!", { id: toastId });
      router.replace("/dashboard");
      return;
    }

    toast.error(useAuthStore.getState().error || "Authentication failed", { id: toastId });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-950 p-5">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/[0.06] blur-[100px]" />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 shadow-[0_0_24px_rgba(56,189,248,0.4)]">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {mode === "login" ? "Sign in to continue building" : "Start shipping with AI-powered IDE"}
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-7 shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
          <form onSubmit={onSubmit} className="space-y-5">
            {mode === "signup" ? (
              <Field label="Full name">
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Jane Smith"
                  className={inputCls}
                />
              </Field>
            ) : null}

            <Field label="Email address">
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="jane@company.com"
                className={inputCls}
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  required
                  minLength={8}
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Min. 8 characters"
                  className={cn(inputCls, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error ? (
              <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.07] px-3 py-2.5 text-xs text-rose-300">
                {error}
              </div>
            ) : null}

            <Button type="submit" loading={isLoading} className="mt-2 w-full" size="lg">
              {mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <Link href={mode === "login" ? "/signup" : "/login"} className="font-medium text-sky-400 transition-colors hover:text-sky-300">
            {mode === "login" ? "Sign up free" : "Sign in"}
          </Link>
        </p>
      </div>
    </div>
  );
}
