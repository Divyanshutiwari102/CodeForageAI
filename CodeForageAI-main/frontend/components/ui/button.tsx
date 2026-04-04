import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        variant === "primary" && "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.35)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.45)]",
        variant === "ghost" && "bg-white/5 text-slate-200 hover:bg-white/10",
        className,
      )}
      {...props}
    />
  );
}
