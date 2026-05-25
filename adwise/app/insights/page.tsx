import Topbar from "@/components/Topbar";
import InsightCard from "@/components/InsightCard";
import { CAMPAIGNS } from "@/lib/mock-data";
import { generateInsights } from "@/lib/insights-engine";
import { Sparkles } from "lucide-react";
import type { InsightSeverity } from "@/types";

const GROUPS: { key: InsightSeverity; title: string; description: string }[] = [
  { key: "critical", title: "Critical", description: "Money is leaking — handle these now" },
  { key: "opportunity", title: "Opportunities", description: "Winners to scale and trends to ride" },
  { key: "warning", title: "Warnings", description: "Performance is slipping but recoverable" },
  { key: "info", title: "Suggestions", description: "Smaller tweaks worth testing" },
];

export default function InsightsPage() {
  const insights = generateInsights(CAMPAIGNS);
  return (
    <>
      <Topbar title="AI Insights" subtitle="Recommendations generated from your account data" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="rounded-xl border border-brand/30 bg-gradient-to-br from-brand/10 via-bg-card to-bg-card p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-brand/20 grid place-items-center">
            <Sparkles className="h-5 w-5 text-brand" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{insights.length} recommendations ready</div>
            <div className="text-xs text-zinc-400">
              Based on 30 days of performance across {CAMPAIGNS.length} campaigns. Apply with one click or dismiss.
            </div>
          </div>
          <button className="text-xs px-3 py-2 rounded-lg bg-brand text-white hover:bg-brand-hover font-medium">
            Apply all safe actions
          </button>
        </section>

        {GROUPS.map((g) => {
          const items = insights.filter((i) => i.severity === g.key);
          if (items.length === 0) return null;
          return (
            <section key={g.key}>
              <div className="mb-3 flex items-baseline justify-between">
                <div>
                  <h2 className="text-base font-semibold">{g.title}</h2>
                  <p className="text-xs text-zinc-500">{g.description}</p>
                </div>
                <span className="text-xs text-zinc-500">{items.length}</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {items.map((i) => (
                  <InsightCard key={i.id} insight={i} />
                ))}
              </div>
            </section>
          );
        })}

        {insights.length === 0 && (
          <div className="rounded-xl border border-border bg-bg-card p-10 text-center text-sm text-zinc-500">
            No insights yet — try syncing more data.
          </div>
        )}
      </main>
    </>
  );
}
