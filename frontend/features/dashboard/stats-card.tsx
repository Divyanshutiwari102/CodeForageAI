import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/types";

export function StatsCard({ item }: { item: Stats }) {
  const isPositive = item.delta?.startsWith("+");

  return (
    <Card className="group p-5 transition-all duration-200 hover:border-sky-400/20">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{item.label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{item.value}</p>
      {item.delta ? (
        <div className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {item.delta}
        </div>
      ) : null}
    </Card>
  );
}
