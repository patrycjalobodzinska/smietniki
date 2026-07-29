import { AlertTriangle, Info, TrendingUp, TriangleAlert, type LucideIcon } from "lucide-react";
import type { Insight, InsightSeverity } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

const CFG: Record<InsightSeverity, { icon: LucideIcon; tone: string; badge: "danger" | "warning" | "info" | "success" }> = {
  critical: { icon: TriangleAlert, tone: "text-danger bg-danger/12", badge: "danger" },
  warning: { icon: AlertTriangle, tone: "text-warning-foreground bg-warning/15", badge: "warning" },
  info: { icon: Info, tone: "text-info bg-info/12", badge: "info" },
  positive: { icon: TrendingUp, tone: "text-success bg-success/12", badge: "success" },
};

export function InsightList({ insights }: { insights: Insight[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {insights.map((ins) => {
        const cfg = CFG[ins.severity];
        const Icon = cfg.icon;
        return (
          <div
            key={ins.id}
            className="flex gap-3 rounded-xl border border-border bg-background-secondary/50 p-4"
          >
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", cfg.tone)}>
              <Icon className="size-[18px]" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-snug">{ins.title}</p>
                <Badge variant={cfg.badge}>{ins.metric}</Badge>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{ins.description}</p>
              <Badge variant="outline">
                {ins.reliability === "measured" ? "Dane pomiarowe" : "Estymacja"}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
