"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
import { cn } from "@/utils/cn";

interface Props {
  className?: string;
}

export function ThemeToggle({ className }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white/70",
        className,
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
