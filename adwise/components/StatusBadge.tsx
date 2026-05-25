import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/types";

const STYLES: Record<CampaignStatus, string> = {
  active: "bg-success/10 text-success border-success/20",
  paused: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
  draft: "bg-warning/10 text-warning border-warning/20",
};

export default function StatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border capitalize",
        STYLES[status],
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "active" && "bg-success",
          status === "paused" && "bg-zinc-400",
          status === "draft" && "bg-warning",
        )}
      />
      {status}
    </span>
  );
}
