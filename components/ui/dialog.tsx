"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Accessible modal: overlay, Escape to close, scroll lock, centered panel. */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-lg",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="space-y-1">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Zamknij"
          >
            <X className="size-4" />
          </button>
        </div>
        {children && <div className="px-5 pb-5">{children}</div>}
        {footer && (
          <div className="flex justify-end gap-2 border-t border-border p-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
