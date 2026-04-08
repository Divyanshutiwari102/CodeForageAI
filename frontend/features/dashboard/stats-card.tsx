import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Stats } from "@/types";

function getDeltaTone(delta: string | undefined) {
  const value = delta?.trim() ?? "";
  if (!value) return "neutral" as const;
  if (value.startsWith("+")) return "positive" as const;
  if (value.startsWith("-")) return "negative" as const;

  const parsed = Number(value.replace(/[,%]/g, ""));
  if (Number.isNaN(parsed) || parsed === 0) return "neutral" as const;
  return parsed > 0 ? ("positive" as const) : ("negative" as const);
}

export function StatsCard({ item }: { item: Stats }) {
  const tone = getDeltaTone(item.delta);

  return (
    <Card className="group p-5 transition-all duration-200 hover:border-sky-400/20">
      <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{item.label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">{item.value}</p>
      {item.delta ? (
        <div
          className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
            tone === "positive" ? "text-emerald-400" : tone === "negative" ? "text-rose-400" : "text-zinc-400"
          }`}
        >
          {tone === "positive" ? <TrendingUp className="h-3 w-3" /> : tone === "negative" ? <TrendingDown className="h-3 w-3" /> : null}
          {item.delta}
        </div>
      ) : null}
    </Card>
  );
}
