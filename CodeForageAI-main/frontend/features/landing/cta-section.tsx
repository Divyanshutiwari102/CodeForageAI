import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-cyan-300/20 bg-gradient-to-r from-cyan-400/10 to-indigo-400/10 p-8 text-center">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Premium developer experience, ready now.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-slate-300">From first prompt to production PR, everything in one place.</p>
        <Link href="/dashboard" className="mt-6 inline-block"><Button>Go to dashboard</Button></Link>
      </div>
    </section>
  );
}
