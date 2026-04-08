import { cn } from "@/utils/cn";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function Card({ className, children, style }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl border", className)}
      style={{ background: "#111118", borderColor: "rgba(255,255,255,0.07)", ...style }}
    >
      {children}
    </div>
  );
}
