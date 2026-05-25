import { AlertTriangle, Sparkles, TrendingUp, Info } from "lucide-react";
import type { Insight } from "@/types";
import { cn } from "@/lib/utils";

const STYLES: Record<
  Insight["severity"],
  { icon: typeof Sparkles; ring: string; tag: string; label: string }
> = {
  critical: {
    icon: AlertTriangle,
    ring: "border-danger/40 bg-danger/5",
    tag: "bg-danger/15 text-danger",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    ring: "border-warning/40 bg-warning/5",
    tag: "bg-warning/15 text-warning",
    label: "Warning",
  },
  opportunity: {
    icon: TrendingUp,
    ring: "border-success/40 bg-success/5",
    tag: "bg-success/15 text-success",
    label: "Opportunity",
  },
  info: {
    icon: Info,
    ring: "border-border bg-bg-card",
    tag: "bg-zinc-500/15 text-zinc-300",
    label: "Info",
  },
};

export default function InsightCard({ insight }: { insight: Insight }) {
  const s = STYLES[insight.severity];
  const Icon = s.icon;
  return (
    <div className={cn("rounded-xl border p-5 shadow-card", s.ring)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "h-9 w-9 rounded-lg grid place-items-center shrink-0",
            s.tag,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded",
                s.tag,
              )}
            >
              {s.label}
            </span>
            <span className="text-xs text-zinc-500 truncate">{insight.campaignName}</span>
          </div>
          <h3 className="mt-2 text-sm font-semibold text-zinc-100">{insight.title}</h3>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">{insight.description}</p>
          {insight.estimatedImpact && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-zinc-500">
              <Sparkles className="h-3 w-3 text-brand" />
              {insight.estimatedImpact}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <button className="px-3 py-1.5 text-xs rounded-lg text-zinc-400 hover:bg-bg-hover hover:text-zinc-200">
          Dismiss
        </button>
        <button
          className={cn(
            "px-3 py-1.5 text-xs rounded-lg font-medium",
            insight.severity === "critical"
              ? "bg-danger text-white hover:bg-danger/90"
              : "bg-brand text-white hover:bg-brand-hover",
          )}
        >
          {insight.actionLabel}
        </button>
      </div>
    </div>
  );
}
