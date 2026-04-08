import { cn } from "@/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50";

    const variants = {
      primary: "bg-violet-600 text-white hover:bg-violet-500",
      secondary: "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white",
      ghost: "text-white/60 hover:bg-white/5 hover:text-white/80",
      danger: "bg-red-600 text-white hover:bg-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
