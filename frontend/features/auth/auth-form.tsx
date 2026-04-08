"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading, error, login, signup } = useAuthStore();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const action = mode === "login" ? "Signing in..." : "Creating account...";
    const successMessage = mode === "login" ? "Signed in successfully" : "Account created successfully";
    const toastId = toast.loading(action);
    const success =
      mode === "login"
        ? await login({ username: email, password })
        : await signup({ username: email, name, password });
    if (success) {
      toast.success(successMessage, { id: toastId });
      router.replace("/dashboard");
      return;
    }
    toast.error(useAuthStore.getState().error || "Authentication failed", { id: toastId });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-100">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-semibold text-white">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-1 text-sm text-slate-400">{mode === "login" ? "Sign in to continue" : "Start building with CodeForageAI"}</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <label className="block space-y-1 text-sm">
              <span className="text-slate-300">Name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none ring-cyan-400/30 focus:ring-2"
              />
            </label>
          )}
          <label className="block space-y-1 text-sm">
            <span className="text-slate-300">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none ring-cyan-400/30 focus:ring-2"
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-slate-300">Password</span>
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 outline-none ring-cyan-400/30 focus:ring-2"
            />
          </label>
          {error ? <p className="text-sm text-rose-400">{error}</p> : null}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-400">
          {mode === "login" ? "No account? " : "Already have an account? "}
          <Link href={mode === "login" ? "/signup" : "/login"} className="text-cyan-400 hover:text-cyan-300">
            {mode === "login" ? "Sign up" : "Sign in"}
          </Link>
        </p>
      </Card>
    </div>
  );
}
