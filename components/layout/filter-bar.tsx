import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Horizontal filter row used on list screens and the dashboard.
 * Compose `<Select>`, `<Input>` etc. as children.
 */
export function FilterBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3",
        className,
      )}
    >
      <span className="flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
        <SlidersHorizontal className="size-3.5" />
        Filtry
      </span>
      {children}
    </div>
  );
}
