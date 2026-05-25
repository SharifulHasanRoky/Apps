"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyMetric } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: DailyMetric[];
}

export default function TrendChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-sm font-semibold">Performance trend</div>
          <div className="text-xs text-zinc-500">Spend vs. revenue · last 30 days</div>
        </div>
      </div>
      <div className="h-72 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="g-rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="g-spend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1f2433" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => d.slice(5)}
              stroke="#4b5365"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              stroke="#4b5365"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              tickFormatter={(v: number) => formatCurrency(v)}
            />
            <Tooltip
              contentStyle={{
                background: "#161a23",
                border: "1px solid #222838",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#e6e9ef" }}
              formatter={(v: number, name: string) => [formatCurrency(v), name]}
            />
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: 12, color: "#9ca3af", paddingTop: 8 }}
            />
            <Area
              name="Revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#7c5cff"
              strokeWidth={2}
              fill="url(#g-rev)"
            />
            <Area
              name="Spend"
              type="monotone"
              dataKey="spend"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#g-spend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
