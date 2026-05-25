import Topbar from "@/components/Topbar";
import { Bot, Plus, Pause, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  name: string;
  description: string;
  status: "on" | "off";
  trigger: string;
  action: string;
  runsToday: number;
  icon: typeof Pause;
}

const RULES: Rule[] = [
  {
    id: "r1",
    name: "Pause underperformers",
    description: "Stop spending on ad sets with poor ROAS over a 3-day window",
    status: "on",
    trigger: "ROAS < 1.0 for 3 days AND spend > $100",
    action: "Pause ad set",
    runsToday: 4,
    icon: Pause,
  },
  {
    id: "r2",
    name: "Scale winners",
    description: "Bump budget on ads with strong consistent ROAS",
    status: "on",
    trigger: "ROAS > 3.0 for 5 days AND frequency < 3",
    action: "Increase daily budget by 20%",
    runsToday: 2,
    icon: TrendingUp,
  },
  {
    id: "r3",
    name: "Creative fatigue alert",
    description: "Notify when an ad's frequency exceeds threshold",
    status: "on",
    trigger: "Frequency > 3.5 OR CTR drops > 30%",
    action: "Send Slack alert",
    runsToday: 1,
    icon: AlertTriangle,
  },
  {
    id: "r4",
    name: "Off-hours budget cap",
    description: "Reduce spend at night when conversion rates are lower",
    status: "off",
    trigger: "Time of day in [00:00 – 06:00 ET]",
    action: "Lower budget by 50%",
    runsToday: 0,
    icon: Clock,
  },
];

export default function AutomationsPage() {
  return (
    <>
      <Topbar title="Automations" subtitle="Always-on rules that act on your campaigns" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-zinc-400">
            {RULES.filter((r) => r.status === "on").length} active · {RULES.length} total
          </div>
          <button className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-brand text-white hover:bg-brand-hover font-medium">
            <Plus className="h-3.5 w-3.5" /> New automation
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {RULES.map((r) => {
            const Icon = r.icon;
            const on = r.status === "on";
            return (
              <div
                key={r.id}
                className={cn(
                  "rounded-xl border bg-bg-card p-5 shadow-card",
                  on ? "border-border" : "border-border-soft opacity-70",
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-lg grid place-items-center shrink-0",
                      on ? "bg-brand/15 text-brand" : "bg-zinc-500/10 text-zinc-400",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-zinc-100">{r.name}</h3>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide",
                          on ? "bg-success/15 text-success" : "bg-zinc-500/15 text-zinc-400",
                        )}
                      >
                        {on ? "Live" : "Paused"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{r.description}</p>
                  </div>
                  <Switch on={on} />
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <Field label="Trigger">{r.trigger}</Field>
                  <Field label="Action">{r.action}</Field>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500 border-t border-border pt-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" />
                    {r.runsToday} runs today
                  </span>
                  <button className="text-zinc-400 hover:text-zinc-200">Edit</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-bg-soft px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-0.5 text-zinc-300 font-mono text-[11px]">{children}</div>
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <div
      className={cn(
        "h-5 w-9 rounded-full p-0.5 transition-colors shrink-0",
        on ? "bg-brand" : "bg-zinc-700",
      )}
    >
      <div
        className={cn(
          "h-4 w-4 rounded-full bg-white transition-transform",
          on && "translate-x-4",
        )}
      />
    </div>
  );
}
