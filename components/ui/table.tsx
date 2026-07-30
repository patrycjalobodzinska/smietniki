import { cn } from "@/lib/utils/cn";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";

/* ---- Low-level primitives (for bespoke layouts) ---- */

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom border-separate border-spacing-0 text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn(className)} {...props} />;
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn(className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("transition-colors", className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-12 whitespace-nowrap bg-muted/50 px-5 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:rounded-l-2xl last:rounded-r-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-5 py-4 align-middle", className)}
      {...props}
    />
  );
}

/* ---- Config-driven DataTable (the default for lists) ---- */

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[] | undefined;
  rowKey: (row: T) => string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

const alignClass = { left: "text-left", right: "text-right", center: "text-center" } as const;

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  onRowClick,
  emptyTitle = "Brak danych",
  emptyDescription,
  className,
}: DataTableProps<T>) {
  // No data (and not loading) → show only the empty state, never a bare table.
  if (!loading && (!data || data.length === 0)) {
    return (
      <div className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)}>
        <EmptyState title={emptyTitle} description={emptyDescription} className="border-0" />
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border bg-card p-1.5", className)}>
      <Table>
        <THead>
          <tr>
            {columns.map((c) => (
              <TH key={c.key} className={cn(c.align && alignClass[c.align], c.headerClassName)}>
                {c.header}
              </TH>
            ))}
          </tr>
        </THead>
        <TBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TR key={i}>
                  {columns.map((c) => (
                    <TD key={c.key}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TD>
                  ))}
                </TR>
              ))
            : data?.map((row) => (
                <TR
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "row-dash last:bg-none",
                    onRowClick && "cursor-pointer hover:bg-lime/12",
                  )}
                >
                  {columns.map((c, ci) => (
                    <TD
                      key={c.key}
                      className={cn(
                        c.align && alignClass[c.align],
                        ci === 0 && "font-medium text-foreground",
                        c.className,
                      )}
                    >
                      {c.cell(row)}
                    </TD>
                  ))}
                </TR>
              ))}
        </TBody>
      </Table>
    </div>
  );
}
