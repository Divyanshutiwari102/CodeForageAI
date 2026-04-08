import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid h-screen grid-cols-[48px_240px_1fr] bg-slate-950 p-2 lg:grid-cols-[48px_260px_1fr_320px_320px]">
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="h-full" />
      <Skeleton className="hidden h-full lg:block" />
      <Skeleton className="hidden h-full lg:block" />
    </div>
  );
}
