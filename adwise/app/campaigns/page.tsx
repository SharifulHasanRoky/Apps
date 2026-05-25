import Topbar from "@/components/Topbar";
import CampaignsTable from "@/components/CampaignsTable";
import KpiCard from "@/components/KpiCard";
import { CAMPAIGNS, getKpiSummary } from "@/lib/mock-data";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function CampaignsPage() {
  const kpi = getKpiSummary();
  const active = CAMPAIGNS.filter((c) => c.status === "active").length;
  const paused = CAMPAIGNS.filter((c) => c.status === "paused").length;

  return (
    <>
      <Topbar title="Campaigns" subtitle="All Meta ad campaigns across your accounts" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Total campaigns" value={`${CAMPAIGNS.length}`} hint={`${active} active · ${paused} paused`} />
          <KpiCard label="Total spend" value={formatCurrency(kpi.spend)} delta={kpi.spendDelta} invertDelta />
          <KpiCard label="Total revenue" value={formatCurrency(kpi.revenue)} delta={kpi.revenueDelta} />
          <KpiCard label="Conversions" value={formatNumber(kpi.conversions)} delta={kpi.conversionsDelta} />
        </section>

        <CampaignsTable campaigns={CAMPAIGNS} />
      </main>
    </>
  );
}
