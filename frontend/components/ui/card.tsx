import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
