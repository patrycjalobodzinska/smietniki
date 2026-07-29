import { cn } from "@/lib/utils/cn";

export interface DescriptionItem {
  label: string;
  value: React.ReactNode;
}

/** Key–value grid for "dane podstawowe" sections on detail screens. */
export function DescriptionList({
  items,
  columns = 2,
  className,
}: {
  items: DescriptionItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  const cols = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" }[columns];
  return (
    <dl className={cn("grid grid-cols-1 gap-x-6 gap-y-4", cols, className)}>
      {items.map((it, i) => (
        <div key={i} className="space-y-0.5">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{it.label}</dt>
          <dd className="text-sm font-medium">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
