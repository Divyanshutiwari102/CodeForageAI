"use client";

import { motion } from "framer-motion";
import { Check, Zap } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: ["3 projects", "50k tokens / month", "1 concurrent preview", "Community support"],
    cta: "Get started",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "₹999",
    period: "per month",
    features: [
      "Unlimited projects",
      "Unlimited tokens / month",
      "5 concurrent previews",
      "Team collaboration",
      "Priority support",
      "Advanced analytics",
    ],
    cta: "Start free trial",
    href: "/signup",
    featured: true,
  },
  {
    name: "Team",
    price: "₹2,999",
    period: "per month",
    features: [
      "Everything in Pro",
      "10M tokens / month",
      "Unlimited previews",
      "SSO & SAML",
      "SLA guarantee",
      "Dedicated support",
    ],
    cta: "Contact sales",
    href: "/signup",
    featured: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">Pricing</p>
          <h2 className="text-3xl font-bold text-white sm:text-4xl" style={{ fontFamily: "var(--font-heading)" }}>
            Simple, transparent pricing
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="relative rounded-2xl border p-6"
              style={{
                background: plan.featured ? "rgba(124,58,237,0.1)" : "#111118",
                borderColor: plan.featured ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.07)",
              }}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-[11px] font-medium text-white">
                    <Zap className="h-3 w-3" />
                    Popular
                  </span>
                </div>
              )}
              <p className="mb-2 text-sm font-medium text-white/60">{plan.name}</p>
              <div className="mb-1 flex items-end gap-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
              </div>
              <p className="mb-6 text-xs text-white/30">{plan.period}</p>
              <Link
                href={plan.href}
                className={`mb-6 flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-medium transition active:scale-95 ${
                  plan.featured
                    ? "bg-violet-600 text-white hover:bg-violet-500"
                    : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                }`}
              >
                {plan.cta}
              </Link>
              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/55">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-violet-400" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
