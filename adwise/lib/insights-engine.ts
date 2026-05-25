import type { Campaign, Insight } from "@/types";
import { safeDivide } from "./utils";

interface CampaignStats {
  roas: number;
  cpa: number;
  ctr: number;
  cvr: number;
  recentRoas: number; // last 7 days
  prevRoas: number; // 7-14 days ago
}

function statsFor(c: Campaign): CampaignStats {
  const slice = (a: number, b: number) => c.daily.slice(c.daily.length - b, c.daily.length - a);
  const sum = (arr: typeof c.daily) =>
    arr.reduce(
      (acc, d) => ({
        spend: acc.spend + d.spend,
        revenue: acc.revenue + d.revenue,
        clicks: acc.clicks + d.clicks,
        conversions: acc.conversions + d.conversions,
      }),
      { spend: 0, revenue: 0, clicks: 0, conversions: 0 },
    );
  const recent = sum(slice(0, 7));
  const prev = sum(slice(7, 14));

  return {
    roas: safeDivide(c.revenue, c.spend),
    cpa: safeDivide(c.spend, c.conversions),
    ctr: safeDivide(c.clicks, c.impressions) * 100,
    cvr: safeDivide(c.conversions, c.clicks) * 100,
    recentRoas: safeDivide(recent.revenue, recent.spend),
    prevRoas: safeDivide(prev.revenue, prev.spend),
  };
}

export function generateInsights(campaigns: Campaign[]): Insight[] {
  const out: Insight[] = [];

  for (const c of campaigns) {
    if (c.status !== "active") continue;
    const s = statsFor(c);

    // 1. Critical: bleeding budget on a loser
    if (s.roas < 1 && c.spend > 100) {
      out.push({
        id: `${c.id}-pause-loser`,
        campaignId: c.id,
        campaignName: c.name,
        severity: "critical",
        title: "Underperformer — pause to stop the bleed",
        description: `ROAS is ${s.roas.toFixed(2)} on $${c.spend.toFixed(0)} spend. Below break-even for 30 days.`,
        action: "pause_campaign",
        actionLabel: "Pause campaign",
        estimatedImpact: `Saves ~$${c.budgetDaily.toFixed(0)}/day`,
      });
      continue;
    }

    // 2. Opportunity: scale a clear winner with positive trend
    if (s.roas >= 3 && s.recentRoas >= s.prevRoas * 0.9 && c.spend > 50) {
      const newBudget = Math.round(c.budgetDaily * 1.2);
      out.push({
        id: `${c.id}-scale-winner`,
        campaignId: c.id,
        campaignName: c.name,
        severity: "opportunity",
        title: "Top performer — scale by 20%",
        description: `ROAS ${s.roas.toFixed(2)} with stable trend. Lift daily budget from $${c.budgetDaily} to $${newBudget}.`,
        action: "scale_campaign",
        actionLabel: `Raise budget to $${newBudget}`,
        estimatedImpact: `+~$${Math.round((newBudget - c.budgetDaily) * s.roas)}/day revenue`,
      });
    }

    // 3. Warning: high frequency = creative fatigue
    if (c.frequency > 3.5) {
      out.push({
        id: `${c.id}-fatigue`,
        campaignId: c.id,
        campaignName: c.name,
        severity: "warning",
        title: "Creative fatigue detected",
        description: `Frequency is ${c.frequency.toFixed(1)} — audience is seeing the same ads too often.`,
        action: "refresh_creative",
        actionLabel: "Refresh creatives",
        estimatedImpact: "CTR usually recovers 15-30%",
      });
    }

    // 4. Warning: high CPA on conversion campaigns
    if (c.objective === "Conversions" && s.cpa > 80 && c.conversions > 0) {
      out.push({
        id: `${c.id}-high-cpa`,
        campaignId: c.id,
        campaignName: c.name,
        severity: "warning",
        title: "CPA above target",
        description: `Cost per conversion is $${s.cpa.toFixed(0)}. Consider narrowing audience or lowering budget.`,
        action: "narrow_audience",
        actionLabel: "Tighten targeting",
      });
    }

    // 5. Info: low CTR signals weak creative
    if (s.ctr < 0.7 && c.impressions > 5000) {
      out.push({
        id: `${c.id}-low-ctr`,
        campaignId: c.id,
        campaignName: c.name,
        severity: "info",
        title: "CTR below benchmark",
        description: `CTR is ${s.ctr.toFixed(2)}%. Test new hooks, thumbnails, or copy variants.`,
        action: "refresh_creative",
        actionLabel: "Generate variants",
      });
    }

    // 6. Opportunity: improving trend on a mid-tier campaign
    if (s.roas >= 1.5 && s.roas < 3 && s.recentRoas > s.prevRoas * 1.2) {
      const newBudget = Math.round(c.budgetDaily * 1.1);
      out.push({
        id: `${c.id}-trend-up`,
        campaignId: c.id,
        campaignName: c.name,
        severity: "opportunity",
        title: "Trending up — small budget bump",
        description: `7-day ROAS climbed from ${s.prevRoas.toFixed(2)} to ${s.recentRoas.toFixed(2)}.`,
        action: "raise_budget",
        actionLabel: `Raise budget to $${newBudget}`,
      });
    }
  }

  // sort: critical → opportunity → warning → info
  const order = { critical: 0, opportunity: 1, warning: 2, info: 3 };
  return out.sort((a, b) => order[a.severity] - order[b.severity]);
}
