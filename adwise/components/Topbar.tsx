import { Search, Bell, ChevronDown } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: Props) {
  return (
    <header className="h-16 px-6 border-b border-border bg-bg-soft flex items-center gap-6">
      <div className="flex-1">
        <h1 className="text-lg font-semibold leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-border bg-bg-card text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors">
          <span>Last 30 days</span>
          <ChevronDown className="h-3 w-3" />
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-bg-card w-64">
          <Search className="h-3.5 w-3.5 text-zinc-500" />
          <input
            placeholder="Search campaigns, ads…"
            className="bg-transparent text-xs flex-1 outline-none placeholder:text-zinc-600"
          />
        </div>

        <button className="h-9 w-9 grid place-items-center rounded-lg border border-border bg-bg-card text-zinc-400 hover:text-zinc-200 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-brand" />
        </button>

        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand to-pink-500 grid place-items-center text-xs font-semibold">
          SH
        </div>
      </div>
    </header>
  );
}
