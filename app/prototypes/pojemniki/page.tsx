"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ConsistentVariant } from "./variants/consistent";
import { GaugeVariant } from "./variants/gauge";
import { FractionLedVariant } from "./variants/fraction-led";

/**
 * Powierzchnia prototypowa - alternatywy dla tabeli na liście pojemników.
 * Odizolowana: nic produkcyjnego stąd nie importuje. Do usunięcia po wyborze.
 */

const VARIANTS = [
  { name: "Zgodny", render: () => <ConsistentVariant /> },
  { name: "Miernik", render: () => <GaugeVariant /> },
  { name: "Frakcja", render: () => <FractionLedVariant /> },
];

export default function PrototypePage() {
  const [current, setCurrent] = useState(0);
  const [mountKey, setMountKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(false);

  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [highlight, setHighlight] = useState({ left: 0, width: 0 });

  const moveHighlight = useCallback(() => {
    const el = itemRefs.current[current];
    if (el) setHighlight({ left: el.offsetLeft, width: el.offsetWidth });
  }, [current]);

  useLayoutEffect(moveHighlight, [moveHighlight]);

  useEffect(() => {
    window.addEventListener("resize", moveHighlight);
    return () => window.removeEventListener("resize", moveHighlight);
  }, [moveHighlight]);

  // Wybór z URL (?v=2), bez animacji przy pierwszym malowaniu.
  useEffect(() => {
    const v = parseInt(new URLSearchParams(location.search).get("v") ?? "", 10);
    if (v >= 1 && v <= VARIANTS.length) setCurrent(v - 1);
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  const setActive = useCallback((i: number) => {
    if (i < 0 || i >= VARIANTS.length) return;
    setCurrent(i);
    setMountKey((k) => k + 1);
    const url = new URL(location.href);
    url.searchParams.set("v", String(i + 1));
    history.replaceState(null, "", url);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) setActive(num - 1);
      else if (e.key === "ArrowRight") setActive((current + 1) % VARIANTS.length);
      else if (e.key === "ArrowLeft") setActive((current - 1 + VARIANTS.length) % VARIANTS.length);
      else if (e.key === "r" || e.key === "R") setMountKey((k) => k + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [current, setActive]);

  // Prototyp działa poza AppShellem, więc motyw przełączamy tu.
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <div className="min-h-dvh bg-background px-6 py-8 pb-28">
      <style>{PICKER_CSS}</style>

      <header className="mx-auto mb-6 flex max-w-[1400px] items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Pojemniki</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            28 pojemników w 8 altankach · prototyp widoku listy ({VARIANTS[current].name})
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {dark ? "tryb jasny" : "tryb ciemny"}
        </button>
      </header>

      <main key={mountKey} className="mx-auto max-w-[1400px]">
        {VARIANTS[current].render()}
      </main>

      <nav className="proto-picker" aria-label="Prototype variants" data-ready={ready ? "" : undefined}>
        <span
          className="proto-picker-highlight"
          aria-hidden="true"
          style={{ width: highlight.width, transform: `translateX(${highlight.left}px)` }}
        />
        {VARIANTS.map((v, i) => (
          <button
            key={v.name}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="proto-picker-item"
            data-active={i === current ? "" : undefined}
            aria-current={i === current ? "true" : undefined}
            onClick={() => setActive(i)}
          >
            {v.name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          onClick={() => setMountKey((k) => k + 1)}
        >
          ↻
        </button>
      </nav>
    </div>
  );
}

const PICKER_CSS = `
.proto-picker {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2147483647;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(10, 10, 10, 0.82);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  backdrop-filter: blur(12px) saturate(1.4);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 8px 24px rgba(0, 0, 0, 0.24),
    0 2px 6px rgba(0, 0, 0, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13px;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  user-select: none;
  -webkit-user-select: none;
}

.proto-picker-highlight {
  position: absolute;
  top: 4px;
  left: 0;
  height: 28px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  will-change: transform;
}

.proto-picker[data-ready] .proto-picker-highlight {
  transition:
    transform 250ms cubic-bezier(0.23, 1, 0.32, 1),
    width 250ms cubic-bezier(0.23, 1, 0.32, 1);
}

@media (prefers-reduced-motion: reduce) {
  .proto-picker[data-ready] .proto-picker-highlight { transition: none; }
}

.proto-picker-item {
  position: relative;
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: rgba(255, 255, 255, 0.55);
  font: inherit;
  cursor: pointer;
  transition: color 150ms ease-out;
}

.proto-picker-item:hover { color: rgba(255, 255, 255, 0.85); }
.proto-picker-item:active { transform: scale(0.97); }

.proto-picker-item:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

.proto-picker-item[data-active] { color: #fff; }

.proto-picker-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.12);
}

.proto-picker-replay {
  padding: 0 10px;
  font-size: 14px;
}

.proto-picker[data-position="top"] { bottom: auto; top: 24px; }

/* --- wejścia wariantów --- */
@keyframes proto-rise {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}

.proto-rise {
  animation: proto-rise 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes proto-ring {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: none; }
}

.proto-ring {
  transform-origin: center;
  animation: proto-ring 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .proto-rise, .proto-ring { animation: none; }
}
`;
