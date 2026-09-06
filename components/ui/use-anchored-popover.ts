"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Popover przypięty do kontrolki, renderowany w portalu na `document.body`
 * i pozycjonowany `fixed`.
 *
 * Bez portalu lista wychodząca poza modal jest przycinana przez jego
 * `overflow-y: auto` i wymusza przewijanie panelu. Pozycję liczymy z geometrii
 * kontrolki: przy otwarciu (w obsłudze kliknięcia, nie w efekcie, żeby nic nie
 * mignęło w złym miejscu) oraz przy przewijaniu i zmianie rozmiaru okna.
 */

const MARGIN = 8;

export interface AnchoredPopover {
  /** Kontener kontrolki - punkt odniesienia i element do testu "klik poza". */
  anchorRef: React.RefObject<HTMLDivElement | null>;
  /** Panel popovera - też musi być w teście "klik poza", bo leży w portalu. */
  popoverRef: React.RefObject<HTMLDivElement | null>;
  style: React.CSSProperties;
  /** Przelicza pozycję; wywołaj przed otwarciem. */
  place: () => void;
  /** true gdy panel leży nad kontrolką - do ustawienia transform-origin. */
  above: boolean;
}

export function useAnchoredPopover(open: boolean, estimatedHeight: number): AnchoredPopover {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ position: "fixed", top: 0, left: 0 });
  const [above, setAbove] = useState(false);

  const place = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const height = popoverRef.current?.offsetHeight || estimatedHeight;

    const roomBelow = window.innerHeight - r.bottom - MARGIN;
    const roomAbove = r.top - MARGIN;
    // Nad kontrolką, gdy pod nią nie ma miejsca, a nad nią jest go więcej.
    const openAbove = roomBelow < height && roomAbove > roomBelow;

    // Poziomo trzymamy panel w oknie, nie wysuwając go za prawą krawędź.
    // Realną szerokość znamy dopiero po pierwszym rysowaniu - do tego czasu
    // przybliżamy ją szerokością kontrolki.
    const width = Math.max(popoverRef.current?.offsetWidth ?? 0, r.width);
    const left = Math.min(Math.max(MARGIN, r.left), Math.max(MARGIN, window.innerWidth - width - MARGIN));

    setAbove(openAbove);
    setStyle({
      position: "fixed",
      left,
      minWidth: r.width,
      maxHeight: Math.max(160, openAbove ? roomAbove : roomBelow),
      ...(openAbove ? { bottom: window.innerHeight - r.top + MARGIN - 4 } : { top: r.bottom + MARGIN - 4 }),
    });
  }, [estimatedHeight]);

  useEffect(() => {
    if (!open) return;
    // Sam nasłuch - `place` woła setState z handlerów zdarzeń, nie z ciała efektu.
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open, place]);

  return { anchorRef, popoverRef, style, place, above };
}
