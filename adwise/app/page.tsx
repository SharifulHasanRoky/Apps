import Topbar from "@/components/Topbar";
import KpiCard from "@/components/KpiCard";
import TrendChart from "@/components/TrendChart";
import CampaignsTable from "@/components/CampaignsTable";
import InsightCard from "@/components/InsightCard";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { CAMPAIGNS, getDailyTotals, getKpiSummary } from "@/lib/mock-data";
import { generateInsights } from "@/lib/insights-engine";
import { formatCurrency, formatNumber, formatPercent, safeDivide } from "@/lib/utils";

export default function DashboardPage() {
  const kpi = getKpiSummary();
  const daily = getDailyTotals();
  const insights = generateInsights(CAMPAIGNS);
  const top = [...CAMPAIGNS]
    .filter((c) => c.status === "active")
    .map((c) => ({ ...c, roas: safeDivide(c.revenue, c.spend) }))
    .sort((a, b) => b.roas - a.roas)
    .slice(0, 5);

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Real-time overview of your Meta ad accounts"
      />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Spend"
            value={formatCurrency(kpi.spend)}
            delta={kpi.spendDelta}
            invertDelta
            hint="Last 30 days"
          />
          <KpiCard
            label="Revenue"
            value={formatCurrency(kpi.revenue)}
            delta={kpi.revenueDelta}
            hint="Attributed revenue"
          />
          <KpiCard
            label="ROAS"
            value={`${kpi.roas.toFixed(2)}x`}
            delta={kpi.roasDelta}
            hint="Return on ad spend"
          />
          <KpiCard
            label="Conversions"
            value={formatNumber(kpi.conversions)}
            delta={kpi.conversionsDelta}
            hint={`${formatPercent(kpi.ctr)} CTR · ${formatCurrency(kpi.cpa, 2)} CPA`}
          />
        </section>

        {/* Chart + insights preview */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <TrendChart data={daily} />
          </div>

          <div className="rounded-xl border border-border bg-bg-card p-5 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-brand/15 grid place-items-center">
                <Sparkles className="h-3.5 w-3.5 text-brand" />
              </div>
              <div>
                <div className="text-sm font-semibold">AI Insights</div>
                <div className="text-xs text-zinc-500">{insights.length} recommendations</div>
              </div>
              <Link
                href="/insights"
                className="ml-auto text-xs text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-1"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {insights.slice(0, 4).map((i) => (
                <CompactInsight key={i.id} insight={i} />
              ))}
            </div>
          </div>
        </section>

        {/* Top performers */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-semibold">Top performers</h2>
              <p className="text-xs text-zinc-500">Highest ROAS active campaigns</p>
            </div>
            <Link
              href="/campaigns"
              className="text-xs text-zinc-400 hover:text-zinc-100 inline-flex items-center gap-1"
            >
              All campaigns <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <CampaignsTable campaigns={top} showFilter={false} />
        </section>

        {/* Featured insights */}
        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold">Recommended actions</h2>
            <p className="text-xs text-zinc-500">Generated from the last 30 days of data</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {insights.slice(0, 4).map((i) => (
              <InsightCard key={i.id} insight={i} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function CompactInsight({ insight }: { insight: ReturnType<typeof generateInsights>[number] }) {
  const dot =
    insight.severity === "critical"
      ? "bg-danger"
      : insight.severity === "opportunity"
        ? "bg-success"
        : insight.severity === "warning"
          ? "bg-warning"
          : "bg-zinc-500";
  return (
    <div className="p-3 rounded-lg border border-border bg-bg-soft">
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <div className="text-xs text-zinc-500 truncate">{insight.campaignName}</div>
      </div>
      <div className="mt-1 text-sm font-medium text-zinc-100 leading-snug">{insight.title}</div>
      <div className="mt-1 text-xs text-zinc-400 line-clamp-2">{insight.description}</div>
    </div>
  );
}
