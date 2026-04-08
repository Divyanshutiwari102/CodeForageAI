import { Card } from "@/components/ui/card";
import type { Stats } from "@/types";

export function StatsCard({ item }: { item: Stats }) {
  return (
    <Card className="p-4 transition hover:border-cyan-300/30">
      <p className="text-xs text-slate-400">{item.label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
      <p className="mt-1 text-xs text-cyan-300">{item.delta}</p>
    </Card>
  );
}
