import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card } from "./card";
import { Skeleton } from "./skeleton";

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
  loading?: boolean;
  className?: string;
}

const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning-foreground",
  danger: "bg-danger/12 text-danger",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  loading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          )}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className={cn("flex size-10 items-center justify-center rounded-lg", TONE[tone])}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
