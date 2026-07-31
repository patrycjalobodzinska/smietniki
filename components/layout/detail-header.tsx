import { Breadcrumbs, type Crumb } from "./breadcrumbs";

export interface DetailHeaderProps {
  breadcrumbs: Crumb[];
  title: string;
  subtitle?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
}

/** Standard header for detail screens: trail, title, badge row, actions. */
export function DetailHeader({ breadcrumbs, title, subtitle, badges, actions }: DetailHeaderProps) {
  return (
    <div className="space-y-3 pb-1">
      <Breadcrumbs items={breadcrumbs} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {badges && <div className="flex flex-wrap items-center gap-2 pt-1">{badges}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
