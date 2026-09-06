"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Trwała preferencja UI (np. wybrany widok listy).
 *
 * `useSyncExternalStore` zamiast `useState` + efektu: serwer renderuje wartość
 * domyślną, a klient podmienia ją na zapisaną zaraz po hydratacji, bez
 * kaskadowego renderu i bez ostrzeżenia o niezgodności.
 */

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useLocalStorage<T extends string>(
  key: string,
  fallback: T,
  isValid: (v: string) => v is T,
): [T, (v: T) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      try {
        const raw = localStorage.getItem(key);
        return raw !== null && isValid(raw) ? raw : fallback;
      } catch {
        return fallback;
      }
    },
    () => fallback,
  );

  const set = useCallback(
    (v: T) => {
      try {
        localStorage.setItem(key, v);
      } catch {
        // Prywatne okno / zablokowane dane - preferencja po prostu nie przetrwa.
      }
      notify();
    },
    [key],
  );

  return [value, set];
}
