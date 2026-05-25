export type CampaignStatus = "active" | "paused" | "draft";
export type Objective =
  | "Conversions"
  | "Traffic"
  | "Awareness"
  | "Engagement"
  | "Leads"
  | "App Installs";

export type Channel = "Facebook" | "Instagram" | "Audience Network" | "Messenger";

export interface DailyMetric {
  date: string; // ISO yyyy-mm-dd
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  objective: Objective;
  channel: Channel;
  budgetDaily: number;
  spend: number;
  revenue: number;
  impressions: number;
  clicks: number;
  conversions: number;
  frequency: number;
  reach: number;
  daily: DailyMetric[]; // last 30 days
}

export type InsightSeverity = "critical" | "warning" | "opportunity" | "info";
export type InsightAction =
  | "pause_campaign"
  | "scale_campaign"
  | "lower_budget"
  | "raise_budget"
  | "refresh_creative"
  | "narrow_audience"
  | "expand_audience";

export interface Insight {
  id: string;
  campaignId: string;
  campaignName: string;
  severity: InsightSeverity;
  title: string;
  description: string;
  action: InsightAction;
  actionLabel: string;
  estimatedImpact?: string;
}

export interface KpiSummary {
  spend: number;
  revenue: number;
  conversions: number;
  impressions: number;
  clicks: number;
  roas: number;
  cpa: number;
  ctr: number;
  spendDelta: number; // percent
  revenueDelta: number;
  roasDelta: number;
  conversionsDelta: number;
}
