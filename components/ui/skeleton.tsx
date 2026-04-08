import { cn } from "@/utils/cn";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-xl", className)}
      style={{ background: "rgba(255,255,255,0.05)", ...style }}
    />
  );
}
