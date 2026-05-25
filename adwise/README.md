# AdWise

A Madgicx-style AI optimizer for Meta (Facebook/Instagram) ads. Built with Next.js 14, TypeScript, Tailwind CSS, and Recharts.

Everything is powered by deterministic mock data — there's no real Meta Marketing API integration yet, so the project runs offline and is safe to demo.

## Features

- **Dashboard** — KPI cards (Spend, Revenue, ROAS, Conversions) with 7-day trends, spend vs. revenue area chart, top performers, and recommended actions.
- **Campaigns** — Full sortable, filterable table across all campaigns with status, ROAS/CTR/CPA, and 30-day metrics.
- **AI Insights** — Rule-based engine that flags critical losers, scaling opportunities, creative fatigue, high CPA, and low CTR; grouped by severity.
- **Audiences** — Custom, lookalike, retargeting, and saved audiences with signal heat (Hot/Warm/Cold).
- **Automations** — Always-on rules (pause underperformers, scale winners, fatigue alerts, off-hours budget caps) with live/paused state.

## Stack

- Next.js 14 (App Router) + React 18
- TypeScript (strict)
- Tailwind CSS
- Recharts (charts)
- lucide-react (icons)

## Run

```bash
cd adwise
npm install
npm run dev
# open http://localhost:3000
```

## Project layout

```
adwise/
  app/                 # Next.js pages (dashboard, campaigns, insights, audiences, automations)
  components/          # Sidebar, Topbar, KpiCard, TrendChart, CampaignsTable, InsightCard, StatusBadge
  lib/
    mock-data.ts       # Deterministic seeded campaign + daily metric generation
    insights-engine.ts # Rule-based recommendation engine
    utils.ts           # Formatting helpers
  types/index.ts       # Shared TS types (Campaign, Insight, KpiSummary, …)
```

## Where to plug in real data

`lib/mock-data.ts` exports `CAMPAIGNS`, `getKpiSummary`, and `getDailyTotals`. Swap these for calls to the Meta Marketing API (or your own warehouse) and the rest of the UI will continue to work — the rule engine in `lib/insights-engine.ts` consumes the same `Campaign` shape.
