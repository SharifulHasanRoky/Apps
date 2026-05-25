"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Megaphone,
  Sparkles,
  Users,
  Bot,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/insights", label: "AI Insights", icon: Sparkles, badge: "AI" },
  { href: "/audiences", label: "Audiences", icon: Users },
  { href: "/automations", label: "Automations", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-bg-soft flex flex-col">
      <div className="h-16 px-5 flex items-center gap-2 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand to-pink-500 grid place-items-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div className="font-semibold tracking-tight">AdWise</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-brand-soft text-white"
                  : "text-zinc-400 hover:bg-bg-hover hover:text-zinc-100",
              )}
            >
              <Icon className={cn("h-4 w-4", active && "text-brand")} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand/20 text-brand">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-bg-hover hover:text-zinc-100"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
