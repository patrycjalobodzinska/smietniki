"use client";

import { useState } from "react";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui";
import { MeasurementDialog } from "@/components/domain/forms/measurement-dialog";

/**
 * "Zmień zapełnienie" action for any container - usable inside clickable table
 * rows (it swallows the click so the row navigation doesn't fire).
 */
export function ChangeFillButton({
  containerCode,
  currentLevel,
  label,
  variant = "outline",
  size = "sm",
}: {
  containerCode: string;
  currentLevel?: number | null;
  /** Omit for an icon-only button (row actions). */
  label?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const [open, setOpen] = useState(false);

  return (
    <span onClick={(e) => e.stopPropagation()}>
      <Button
        variant={variant}
        size={size}
        className={label ? undefined : "size-9 px-0"}
        title="Zmień zapełnienie"
        aria-label={`Zmień zapełnienie pojemnika ${containerCode}`}
        onClick={() => setOpen(true)}
      >
        <Gauge />
        {label}
      </Button>
      {open && (
        <MeasurementDialog
          open
          containerCode={containerCode}
          currentLevel={currentLevel}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  );
}
