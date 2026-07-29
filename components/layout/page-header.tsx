import { cn } from "@/lib/utils/cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions (buttons, filters). */
  actions?: React.ReactNode;
  className?: string;
}

/** Consistent page title block used at the top of every screen. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
