import { fillTone, type FillTone } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { Badge } from "@/components/ui/badge";

const TONE_BG: Record<FillTone, string> = {
  low: "bg-fill-low",
  mid: "bg-fill-mid",
  high: "bg-fill-high",
  critical: "bg-fill-critical",
};

const TONE_TEXT: Record<FillTone, string> = {
  low: "text-fill-low",
  mid: "text-fill-mid",
  high: "text-fill-high",
  critical: "text-fill-critical",
};

/** Horizontal fill-level bar. Handles N/D (null) for Access-only objects. */
export function FillBar({ level, className }: { level: number | null; className?: string }) {
  if (level === null) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="h-2 w-full min-w-16 rounded-full bg-muted" />
        <span className="w-9 shrink-0 text-right text-xs font-medium text-muted-foreground">N/D</span>
      </div>
    );
  }
  const tone = fillTone(level);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-2 w-full min-w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", TONE_BG[tone])}
          style={{ width: `${Math.min(100, Math.max(0, level))}%` }}
        />
      </div>
      <span className={cn("w-9 shrink-0 text-right text-xs font-semibold tabular-nums", TONE_TEXT[tone])}>
        {Math.round(level)}%
      </span>
    </div>
  );
}

/** Colored dot for map/legend/compact rows. */
export function FillDot({ level, className }: { level: number | null; className?: string }) {
  if (level === null) return <span className={cn("size-2.5 rounded-full bg-fill-none", className)} />;
  return <span className={cn("size-2.5 rounded-full", TONE_BG[fillTone(level)], className)} />;
}
