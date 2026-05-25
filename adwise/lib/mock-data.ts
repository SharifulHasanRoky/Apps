import type { Campaign, DailyMetric, KpiSummary, Channel, Objective, CampaignStatus } from "@/types";
import { safeDivide } from "./utils";

// Deterministic pseudo-random so SSR and CSR match.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CampaignSeed {
  name: string;
  objective: Objective;
  channel: Channel;
  status: CampaignStatus;
  budgetDaily: number;
  // health bias: 1 = great, 0 = bad. Influences performance.
  health: number;
}

const SEEDS: CampaignSeed[] = [
  { name: "Spring Sale — Lookalike 1%", objective: "Conversions", channel: "Facebook", status: "active", budgetDaily: 250, health: 0.95 },
  { name: "Spring Sale — Retargeting 30d", objective: "Conversions", channel: "Instagram", status: "active", budgetDaily: 180, health: 0.9 },
  { name: "New Collection — Awareness", objective: "Awareness", channel: "Instagram", status: "active", budgetDaily: 120, health: 0.55 },
  { name: "Holiday Bundle — Broad", objective: "Conversions", channel: "Facebook", status: "active", budgetDaily: 300, health: 0.25 },
  { name: "Newsletter Signups — Leads", objective: "Leads", channel: "Facebook", status: "active", budgetDaily: 90, health: 0.7 },
  { name: "App Install — iOS", objective: "App Installs", channel: "Audience Network", status: "active", budgetDaily: 200, health: 0.4 },
  { name: "App Install — Android", objective: "App Installs", channel: "Facebook", status: "active", budgetDaily: 200, health: 0.78 },
  { name: "Summer Drop — Creators", objective: "Engagement", channel: "Instagram", status: "paused", budgetDaily: 75, health: 0.5 },
  { name: "Cart Abandoners — DPA", objective: "Conversions", channel: "Facebook", status: "active", budgetDaily: 150, health: 0.92 },
  { name: "Site Visitors — 7d Retarget", objective: "Traffic", channel: "Instagram", status: "active", budgetDaily: 110, health: 0.65 },
  { name: "Wholesale — B2B Leads", objective: "Leads", channel: "Facebook", status: "active", budgetDaily: 80, health: 0.35 },
  { name: "Influencer Boost — Reels", objective: "Engagement", channel: "Instagram", status: "active", budgetDaily: 95, health: 0.6 },
];

function generateDaily(seed: CampaignSeed, rand: () => number): DailyMetric[] {
  const days = 30;
  const out: DailyMetric[] = [];
  // base CPM based on channel
  const cpmBase = seed.channel === "Instagram" ? 11 : seed.channel === "Audience Network" ? 4 : 9;
  const ctrBase = 0.008 + seed.health * 0.025; // 0.8% bad → 3.3% great
  const cvrBase = 0.005 + seed.health * 0.04; // 0.5% → 4.5%
  const aov = 55 + seed.health * 60; // avg order value

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const iso = date.toISOString().slice(0, 10);

    // weekly seasonality + noise
    const dow = date.getDay();
    const weekMult = dow === 0 || dow === 6 ? 1.15 : dow === 1 ? 0.9 : 1;
    const noise = 0.75 + rand() * 0.5;

    const spend = seed.status === "paused" && i < 5 ? 0 : seed.budgetDaily * weekMult * noise;
    const cpm = cpmBase * (0.85 + rand() * 0.3);
    const impressions = Math.round((spend / cpm) * 1000);
    const ctr = ctrBase * (0.8 + rand() * 0.4);
    const clicks = Math.round(impressions * ctr);
    const cvr = cvrBase * (0.7 + rand() * 0.6);
    const conversions = Math.round(clicks * cvr);
    const revenue = +(conversions * aov * (0.9 + rand() * 0.3)).toFixed(2);

    out.push({
      date: iso,
      spend: +spend.toFixed(2),
      revenue,
      impressions,
      clicks,
      conversions,
    });
  }
  return out;
}

function buildCampaigns(): Campaign[] {
  return SEEDS.map((seed, idx) => {
    const rand = mulberry32(1000 + idx * 13);
    const daily = generateDaily(seed, rand);
    const totals = daily.reduce(
      (acc, d) => ({
        spend: acc.spend + d.spend,
        revenue: acc.revenue + d.revenue,
        impressions: acc.impressions + d.impressions,
        clicks: acc.clicks + d.clicks,
        conversions: acc.conversions + d.conversions,
      }),
      { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 },
    );
    const reach = Math.round(totals.impressions / (1.4 + rand() * 1.6));
    const frequency = +(totals.impressions / Math.max(reach, 1)).toFixed(2);

    return {
      id: `cmp_${(idx + 1).toString().padStart(3, "0")}`,
      name: seed.name,
      status: seed.status,
      objective: seed.objective,
      channel: seed.channel,
      budgetDaily: seed.budgetDaily,
      spend: +totals.spend.toFixed(2),
      revenue: +totals.revenue.toFixed(2),
      impressions: totals.impressions,
      clicks: totals.clicks,
      conversions: totals.conversions,
      frequency,
      reach,
      daily,
    };
  });
}

export const CAMPAIGNS: Campaign[] = buildCampaigns();

export function getCampaign(id: string): Campaign | undefined {
  return CAMPAIGNS.find((c) => c.id === id);
}

export function getKpiSummary(campaigns: Campaign[] = CAMPAIGNS): KpiSummary {
  const totals = campaigns.reduce(
    (acc, c) => ({
      spend: acc.spend + c.spend,
      revenue: acc.revenue + c.revenue,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
    }),
    { spend: 0, revenue: 0, impressions: 0, clicks: 0, conversions: 0 },
  );

  // compare last 7 days vs previous 7 days for delta
  const last7 = sumWindow(campaigns, 0, 7);
  const prev7 = sumWindow(campaigns, 7, 14);
  const pct = (a: number, b: number) => (b === 0 ? 0 : ((a - b) / b) * 100);

  return {
    spend: totals.spend,
    revenue: totals.revenue,
    conversions: totals.conversions,
    impressions: totals.impressions,
    clicks: totals.clicks,
    roas: safeDivide(totals.revenue, totals.spend),
    cpa: safeDivide(totals.spend, totals.conversions),
    ctr: safeDivide(totals.clicks, totals.impressions) * 100,
    spendDelta: pct(last7.spend, prev7.spend),
    revenueDelta: pct(last7.revenue, prev7.revenue),
    roasDelta: pct(safeDivide(last7.revenue, last7.spend), safeDivide(prev7.revenue, prev7.spend)),
    conversionsDelta: pct(last7.conversions, prev7.conversions),
  };
}

function sumWindow(campaigns: Campaign[], startBack: number, endBack: number) {
  // sum metrics for days [endBack..startBack) counting from latest day = 0
  return campaigns.reduce(
    (acc, c) => {
      const slice = c.daily.slice(c.daily.length - endBack, c.daily.length - startBack);
      slice.forEach((d) => {
        acc.spend += d.spend;
        acc.revenue += d.revenue;
        acc.conversions += d.conversions;
        acc.impressions += d.impressions;
        acc.clicks += d.clicks;
      });
      return acc;
    },
    { spend: 0, revenue: 0, conversions: 0, impressions: 0, clicks: 0 },
  );
}

export function getDailyTotals(campaigns: Campaign[] = CAMPAIGNS): DailyMetric[] {
  const map = new Map<string, DailyMetric>();
  campaigns.forEach((c) =>
    c.daily.forEach((d) => {
      const cur = map.get(d.date) ?? {
        date: d.date,
        spend: 0,
        revenue: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
      };
      cur.spend += d.spend;
      cur.revenue += d.revenue;
      cur.impressions += d.impressions;
      cur.clicks += d.clicks;
      cur.conversions += d.conversions;
      map.set(d.date, cur);
    }),
  );
  return Array.from(map.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}
