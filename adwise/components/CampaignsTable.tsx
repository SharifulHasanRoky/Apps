"use client";

import { useMemo, useState } from "react";
import type { Campaign } from "@/types";
import StatusBadge from "./StatusBadge";
import { cn, formatCurrency, formatNumber, formatPercent, safeDivide } from "@/lib/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type SortKey =
  | "name"
  | "status"
  | "spend"
  | "revenue"
  | "roas"
  | "ctr"
  | "cpa"
  | "conversions";

interface Props {
  campaigns: Campaign[];
  showFilter?: boolean;
}

export default function CampaignsTable({ campaigns, showFilter = true }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "spend",
    dir: "desc",
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");

  const enriched = useMemo(
    () =>
      campaigns.map((c) => ({
        ...c,
        roas: safeDivide(c.revenue, c.spend),
        cpa: safeDivide(c.spend, c.conversions),
        ctr: safeDivide(c.clicks, c.impressions) * 100,
      })),
    [campaigns],
  );

  const filtered = useMemo(() => {
    let rows = enriched;
    if (statusFilter !== "all") rows = rows.filter((c) => c.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (c) => c.name.toLowerCase().includes(q) || c.objective.toLowerCase().includes(q),
      );
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [enriched, query, statusFilter, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }));
  };

  return (
    <div className="rounded-xl border border-border bg-bg-card shadow-card overflow-hidden">
      {showFilter && (
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campaigns…"
            className="flex-1 max-w-xs px-3 py-2 text-xs rounded-lg border border-border bg-bg-soft outline-none focus:border-brand placeholder:text-zinc-600"
          />
          <div className="flex border border-border rounded-lg overflow-hidden text-xs">
            {(["all", "active", "paused"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-2 capitalize",
                  statusFilter === s
                    ? "bg-brand-soft text-white"
                    : "text-zinc-400 hover:bg-bg-hover",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="ml-auto text-xs text-zinc-500">{filtered.length} campaigns</div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-bg-soft text-xs text-zinc-500 uppercase tracking-wide">
            <tr>
              <Th label="Campaign" k="name" sort={sort} toggle={toggleSort} />
              <Th label="Status" k="status" sort={sort} toggle={toggleSort} />
              <Th label="Spend" k="spend" sort={sort} toggle={toggleSort} align="right" />
              <Th label="Revenue" k="revenue" sort={sort} toggle={toggleSort} align="right" />
              <Th label="ROAS" k="roas" sort={sort} toggle={toggleSort} align="right" />
              <Th label="CTR" k="ctr" sort={sort} toggle={toggleSort} align="right" />
              <Th label="CPA" k="cpa" sort={sort} toggle={toggleSort} align="right" />
              <Th label="Conv." k="conversions" sort={sort} toggle={toggleSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                className="border-t border-border hover:bg-bg-hover transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-zinc-100">{c.name}</div>
                  <div className="text-xs text-zinc-500">
                    {c.channel} · {c.objective}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(c.spend)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(c.revenue)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded font-medium",
                      c.roas >= 3 && "bg-success/10 text-success",
                      c.roas >= 1 && c.roas < 3 && "text-zinc-300",
                      c.roas < 1 && "bg-danger/10 text-danger",
                    )}
                  >
                    {c.roas.toFixed(2)}x
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                  {formatPercent(c.ctr)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-zinc-400">
                  {c.conversions > 0 ? formatCurrency(c.cpa, 2) : "—"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{formatNumber(c.conversions)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  label,
  k,
  sort,
  toggle,
  align,
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: "asc" | "desc" };
  toggle: (k: SortKey) => void;
  align?: "right";
}) {
  const active = sort.key === k;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th
      onClick={() => toggle(k)}
      className={cn(
        "px-4 py-3 cursor-pointer select-none whitespace-nowrap",
        align === "right" ? "text-right" : "text-left",
        active && "text-zinc-200",
      )}
    >
      <span className={cn("inline-flex items-center gap-1.5", align === "right" && "justify-end w-full")}>
        {label}
        <Icon className={cn("h-3 w-3 opacity-60", active && "opacity-100")} />
      </span>
    </th>
  );
}
