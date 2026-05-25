import Topbar from "@/components/Topbar";
import { Users, Plus, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface AudienceRow {
  name: string;
  type: "Lookalike" | "Custom" | "Saved" | "Retargeting";
  size: number;
  source: string;
  performance: "Hot" | "Warm" | "Cold";
}

const AUDIENCES: AudienceRow[] = [
  { name: "Purchasers — Last 180d", type: "Custom", size: 142_300, source: "Pixel · Purchase event", performance: "Hot" },
  { name: "1% Lookalike — US Buyers", type: "Lookalike", size: 2_100_000, source: "Seed: Purchasers 180d", performance: "Hot" },
  { name: "Cart Abandoners — 7d", type: "Retargeting", size: 38_900, source: "Pixel · AddToCart minus Purchase", performance: "Hot" },
  { name: "Site Visitors — 30d", type: "Retargeting", size: 412_500, source: "Pixel · PageView", performance: "Warm" },
  { name: "Email List — Newsletter", type: "Custom", size: 89_600, source: "CSV · 2026-04-12", performance: "Warm" },
  { name: "2% Lookalike — Email subs", type: "Lookalike", size: 4_200_000, source: "Seed: Newsletter list", performance: "Cold" },
  { name: "Engaged with IG — 90d", type: "Custom", size: 220_400, source: "Instagram engagement", performance: "Warm" },
  { name: "Broad — US 25-54", type: "Saved", size: 65_000_000, source: "Demographics", performance: "Cold" },
];

const PERF_STYLE: Record<AudienceRow["performance"], string> = {
  Hot: "bg-danger/15 text-danger",
  Warm: "bg-warning/15 text-warning",
  Cold: "bg-zinc-500/15 text-zinc-400",
};

export default function AudiencesPage() {
  return (
    <>
      <Topbar title="Audiences" subtitle="Custom, lookalike, and saved audiences" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">{AUDIENCES.length} audiences synced from Meta</div>
          <button className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-brand text-white hover:bg-brand-hover font-medium">
            <Plus className="h-3.5 w-3.5" /> New audience
          </button>
        </div>

        <div className="rounded-xl border border-border bg-bg-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft text-xs text-zinc-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Audience</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Size</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">Signal</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {AUDIENCES.map((a) => (
                <tr key={a.name} className="border-t border-border hover:bg-bg-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-brand/10 grid place-items-center text-brand">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="font-medium text-zinc-100">{a.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{a.type}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(a.size)}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{a.source}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${PERF_STYLE[a.performance]}`}>
                      {a.performance}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="h-4 w-4 text-zinc-600 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
