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

    // Stronę przewija <main data-app-scroll> z AppShella, nie <body>, więc
    // samo zablokowanie body nic nie dawało - tło przesuwało się pod modalem.
    // Blokujemy jedno i drugie: body dla ekranów bez AppShella (logowanie).
    const scrollers = [
      document.body,
      ...Array.from(document.querySelectorAll<HTMLElement>("[data-app-scroll]")),
    ];
    const previous = scrollers.map((el) => el.style.overflow);
    for (const el of scrollers) el.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      scrollers.forEach((el, i) => {
        el.style.overflow = previous[i];
      });
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          // Kolumna z przewijaną treścią: nagłówek i stopka zostają widoczne,
          // a długi formularz nie wychodzi poza ekran.
          "relative z-10 flex w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-lg",
          // Na wąskich ekranach modal korzysta z prawie całej wysokości, żeby
          // długi formularz nie ściskał się do kilku widocznych pól.
          "max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)]",
          className,
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 p-4 sm:p-5">
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
        {children && (
          // overscroll-contain: przewijanie treści modala nie przechodzi na tło.
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5 sm:pb-5">
            {children}
          </div>
        )}
        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-border p-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  );
}
