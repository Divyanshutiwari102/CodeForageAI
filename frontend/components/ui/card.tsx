import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type CardVariant = "default" | "elevated" | "flat" | "interactive";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  glow?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border border-white/[0.08] bg-white/[0.03]",
  elevated: "border border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-[0_16px_42px_rgba(0,0,0,0.4)]",
  flat: "border border-white/[0.06] bg-zinc-900/80",
  interactive:
    "border border-white/[0.08] bg-white/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/25 hover:bg-white/[0.05]",
};

export function Card({ className, variant = "default", glow = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        variantClasses[variant],
        glow && "shadow-[0_0_32px_rgba(56,189,248,0.18)]",
        className,
      )}
      {...props}
    />
  );
}
