import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sky-500 text-white hover:bg-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.35)] border border-sky-400/30",
  secondary: "bg-white/[0.08] text-zinc-100 hover:bg-white/[0.12] border border-white/[0.08]",
  ghost: "bg-transparent text-zinc-200 hover:bg-white/[0.06] border border-transparent",
  outline: "bg-transparent text-zinc-100 border border-white/[0.14] hover:bg-white/[0.06]",
  danger: "bg-rose-500/90 text-white border border-rose-400/30 hover:bg-rose-400",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={cn(
        "btn-press inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/45",
        "disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={isDisabled}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      <span>{children}</span>
      {!loading ? rightIcon : null}
    </button>
  );
}
