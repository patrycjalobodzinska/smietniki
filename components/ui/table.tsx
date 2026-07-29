import { cn } from "@/lib/utils/cn";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";

/* ---- Low-level primitives (for bespoke layouts) ---- */

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b [&_tr]:border-border", className)} {...props} />;
}

export function TBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("border-b border-border transition-colors hover:bg-muted/50", className)}
      {...props}
    />
  );
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-11 px-4 text-left align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
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
  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}>
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            {columns.map((c) => (
              <TH key={c.key} className={cn(c.align && alignClass[c.align], c.headerClassName)}>
                {c.header}
              </TH>
            ))}
          </TR>
        </THead>
        <TBody>
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TR key={i} className="hover:bg-transparent">
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
                  className={onRowClick ? "cursor-pointer" : undefined}
                >
                  {columns.map((c) => (
                    <TD key={c.key} className={cn(c.align && alignClass[c.align], c.className)}>
                      {c.cell(row)}
                    </TD>
                  ))}
                </TR>
              ))}
        </TBody>
      </Table>
      {!loading && data && data.length === 0 && (
        <EmptyState title={emptyTitle} description={emptyDescription} className="border-0" />
      )}
    </div>
  );
}
