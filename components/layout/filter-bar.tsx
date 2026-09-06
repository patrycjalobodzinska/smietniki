"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button, Dialog } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

/**
 * Horizontal filter row used on list screens and the dashboard.
 * Compose `<Select>`, `<Input>` etc. as children.
 *
 * Na wąskich ekranach pasek nie zmieściłby się w jednym rzędzie i spychałby
 * listę poza ekran, więc filtry chowają się pod przycisk otwierający modal.
 * Kontrolki są sterowane z góry (value/onChange), więc ta sama definicja
 * dzieci działa w obu wariantach bez rozjazdu stanu.
 *
 * `trailing` zostaje na stronie także na telefonie - dla rzeczy, które nie są
 * filtrem (np. przełącznik tabela/kafle).
 */
export function FilterBar({
  children,
  trailing,
  className,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Telefon: przycisk zamiast paska */}
      <div className={cn("flex items-center justify-end gap-2 sm:hidden", className)}>
        {trailing}
        <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="shrink-0">
          <SlidersHorizontal className="size-3.5" />
          Filtry
        </Button>
      </div>

      {/* Tablet i wyżej: pasek jak dotąd */}
      <div
        className={cn(
          "hidden flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 sm:flex",
          className,
        )}
      >
        <span className="flex items-center gap-1.5 px-1 text-xs font-medium text-muted-foreground">
          <SlidersHorizontal className="size-3.5" />
          Filtry
        </span>
        {children}
        {trailing}
      </div>

      {open && (
        <Dialog
          open
          onClose={() => setOpen(false)}
          title="Filtry"
          footer={<Button onClick={() => setOpen(false)}>Pokaż wyniki</Button>}
        >
          <div className="flex flex-col gap-3 [&>*]:w-full">{children}</div>
        </Dialog>
      )}
    </>
  );
}
