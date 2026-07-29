import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface Crumb {
  label: string;
  href?: string;
}

/** Breadcrumb trail for detail screens (spec §20.3). */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}>
      {items.map((c, i) => {
        const last = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {c.href && !last ? (
              <Link href={c.href} className="transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className={cn(last && "text-foreground")}>{c.label}</span>
            )}
            {!last && <ChevronRight className="size-3.5" />}
          </span>
        );
      })}
    </nav>
  );
}
