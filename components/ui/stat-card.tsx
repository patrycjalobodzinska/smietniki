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
  /** Dark forest-green card for emphasis (KPI hero). */
  dark?: boolean;
  loading?: boolean;
  className?: string;
}

/** Ikona jest znakiem wodnym w prawym dolnym rogu - stąd sam kolor, bez tła. */
const TONE: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-coral",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  dark,
  loading,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4",
        dark && "border-transparent bg-forest text-forest-foreground",
        className,
      )}
    >
      {Icon && (
        <Icon
          aria-hidden
          className={cn(
            "pointer-events-none absolute -bottom-4 -right-3 size-24",
            dark ? "text-lime opacity-25" : cn(TONE[tone], "opacity-[0.13] dark:opacity-20"),
          )}
          strokeWidth={1.5}
        />
      )}
      <div className="relative space-y-0.5">
        <p className={cn("text-xs font-medium", dark ? "text-forest-foreground/70" : "text-muted-foreground")}>
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-2xl font-semibold leading-tight tracking-tight tabular-nums">{value}</p>
        )}
        {hint && (
          <p className={cn("text-xs", dark ? "text-forest-foreground/60" : "text-muted-foreground")}>{hint}</p>
        )}
      </div>
    </Card>
  );
}
