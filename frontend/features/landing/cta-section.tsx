import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-4 pb-28 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-sky-400/15 bg-gradient-to-br from-sky-500/[0.08] via-zinc-950 to-indigo-500/[0.06] p-12 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to build at the speed of thought?</h2>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">Join thousands of developers shipping faster with AI.</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
              Start for free
            </Button>
          </Link>
          <Button variant="secondary" size="lg">
            View pricing
          </Button>
        </div>
      </div>
    </section>
  );
}
