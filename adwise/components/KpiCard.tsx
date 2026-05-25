import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn, formatDelta } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  delta?: number;
  // when true, a negative delta is good (e.g. CPA going down)
  invertDelta?: boolean;
  hint?: string;
}

export default function KpiCard({ label, value, delta, invertDelta, hint }: Props) {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const positive = showDelta ? (invertDelta ? delta! < 0 : delta! > 0) : false;
  const negative = showDelta ? (invertDelta ? delta! > 0 : delta! < 0) : false;

  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 shadow-card">
      <div className="text-xs text-zinc-500 uppercase tracking-wide">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {showDelta && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              positive && "text-success",
              negative && "text-danger",
              !positive && !negative && "text-zinc-500",
            )}
          >
            {delta! > 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : delta! < 0 ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : null}
            <span>{formatDelta(delta!)}</span>
          </div>
        )}
      </div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}
